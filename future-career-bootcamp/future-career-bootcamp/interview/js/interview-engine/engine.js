// Interview Engine - state machine that orchestrates the interview flow
// 所有面试官对话和报告分析均通过 AI 生成
import { QuestionSelector } from './question-selector.js';
import { ResponseAnalyzer } from './response-analyzer.js';
import { Scorer } from './scorer.js';
import { createAIAdapter } from './ai-adapter.js';

export const InterviewState = {
  IDLE: 'idle',
  INTRO: 'intro',
  QUESTION: 'question',
  WAITING: 'waiting',
  ANALYZING: 'analyzing',
  FOLLOW_UP: 'follow_up',
  CLOSING: 'closing',
  COMPLETED: 'completed',
};

export class InterviewEngine {
  constructor(config) {
    this.config = config;
    this.state = InterviewState.IDLE;
    this.ai = createAIAdapter('xunfei', config);
    this.questionSelector = new QuestionSelector(config);
    this.scorer = new Scorer(config.type);
    this.analyzer = new ResponseAnalyzer();
    this.questions = this.questionSelector.selectQuestions();
    this.currentIndex = 0;
    this.followUpCount = 0;
    this.maxFollowUps = config.difficulty === 3 ? 2 : 1;
    this.dialogue = [];
    this.questionResults = [];
    this._onStateChange = null;
    this._onDialogue = null;
  }

  onStateChange(callback) { this._onStateChange = callback; }
  onDialogue(callback) { this._onDialogue = callback; }

  _setState(newState) {
    const prev = this.state;
    this.state = newState;
    if (this._onStateChange) this._onStateChange(newState, prev);
  }

  _addDialogue(role, text, type = 'message', extra = {}) {
    const entry = {
      id: `dlg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role, type, text,
      timestamp: Date.now(),
      ...extra,
    };
    this.dialogue.push(entry);
    if (this._onDialogue) this._onDialogue(entry);
    return entry;
  }

  getCurrentQuestion() { return this.questions[this.currentIndex] || null; }
  hasNextQuestion() { return this.currentIndex < this.questions.length - 1; }

  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.questions.length,
      percent: Math.round(((this.currentIndex + 1) / this.questions.length) * 100),
    };
  }

  async start() {
    this._setState(InterviewState.INTRO);
    this.config._currentQuestionIndex = 0;
    this.config._totalQuestions = this.questions.length;

    // 开场白由 AI 生成
    const introText = await this.ai.generateIntro({
      config: this.config,
      totalQuestions: this.questions.length,
    });
    this._addDialogue('interviewer', introText, 'greeting');

    await this._delay(500);
    return this._askCurrentQuestion();
  }

  async _askCurrentQuestion() {
    const question = this.getCurrentQuestion();
    if (!question) return this.endInterview();

    this._setState(InterviewState.QUESTION);
    this.followUpCount = 0;
    this.config._currentQuestionIndex = this.currentIndex + 1;
    this.config._totalQuestions = this.questions.length;

    // 题目提问由 AI 用自然口吻生成
    const questionText = await this.ai.generateQuestion({
      question,
      config: this.config,
      dialogueHistory: this.dialogue,
    });
    this._addDialogue('interviewer', questionText, 'question', {
      questionId: question.id,
      category: question.category,
    });

    this._setState(InterviewState.WAITING);
    return question;
  }

  async processResponse(responseText) {
    if (this.state !== InterviewState.WAITING) return null;
    if (!responseText.trim()) return null;

    const question = this.getCurrentQuestion();
    this.config._currentQuestionIndex = this.currentIndex + 1;
    this.config._totalQuestions = this.questions.length;

    // 记录用户回答
    this._addDialogue('candidate', responseText, 'response', {
      questionId: question?.id,
    });

    this._setState(InterviewState.ANALYZING);

    // 并行请求：AI对话回复 + AI逐题评分反馈
    const [aiReply, aiFeedbackResult] = await Promise.all([
      this.ai.generateReply({
        response: responseText,
        question,
        dialogueHistory: this.dialogue,
        config: this.config,
      }),
      this.ai.generateQuestionFeedback({
        question,
        response: responseText,
        config: this.config,
      }),
    ]);

    // 使用 AI 打分（不再用本地硬算分数）
    const scores = aiFeedbackResult.scores;
    const analysis = this.analyzer.analyze(responseText, question);

    // 记录题目结果
    const questionResult = {
      questionId: question?.id,
      questionText: question?.text,
      category: question?.category,
      categoryName: question?.categoryName,
      response: responseText,
      responseTime: null,
      responseLength: responseText.length,
      scores,
      feedback: aiFeedbackResult.feedback, // AI 生成的逐题反馈
      followUps: [],
      hasStructure: analysis.hasStructure,
      hasSTAR: analysis.hasSTAR,
      hasExample: analysis.hasExample,
      hasData: analysis.hasData,
      fillerCount: analysis.fillerCount,
    };
    this.questionResults.push(questionResult);

    // AI 回复：追问或过渡
    if (aiReply.shouldFollowUp && this.followUpCount < this.maxFollowUps) {
      this.followUpCount++;
      this._setState(InterviewState.FOLLOW_UP);
      this._addDialogue('interviewer', aiReply.text, 'follow_up', {
        questionId: question?.id,
        followUpIndex: this.followUpCount,
      });
      questionResult.followUps.push({ text: aiReply.text, response: null });
      this._setState(InterviewState.WAITING);
      return { type: 'follow_up', text: aiReply.text };
    }

    // 下一题或结束
    if (this.hasNextQuestion()) {
      this.currentIndex++;
      this.followUpCount = 0;
      if (aiReply.text) {
        this._addDialogue('interviewer', aiReply.text, 'transition');
      }
      await this._delay(300);
      return this._askCurrentQuestion();
    }

    return this.endInterview();
  }

  async endInterview() {
    this._setState(InterviewState.CLOSING);

    // 结束语由 AI 生成
    const closingText = await this.ai.generateClosing({
      config: this.config,
      dialogueHistory: this.dialogue,
      questionResults: this.questionResults,
    });
    this._addDialogue('interviewer', closingText, 'closing');
    this._setState(InterviewState.COMPLETED);

    // 本地评分（保证分数基础）
    const dimensionScores = this.scorer.calculateDimensionScores(this.questionResults);
    const overallScore = this.scorer.calculateOverallScore(dimensionScores);
    const gradeInfo = this.scorer.getGrade(overallScore);

    // AI 深度分析报告（优缺点 + 建议 + 逐题点评）
    let aiReport;
    try {
      aiReport = await this.ai.generateFullReport({
        questionResults: this.questionResults,
        dimensionScores,
        config: this.config,
      });
    } catch (e) {
      console.warn('AI report generation failed, using local fallback:', e);
      aiReport = null;
    }

    // 用 AI 报告覆盖本地生成的文本，但分数保持本地计算
    const strengths = aiReport?.strengths?.length > 0
      ? aiReport.strengths
      : this.scorer.identifyStrengthsWeaknesses(dimensionScores).strengths;
    const weaknesses = aiReport?.weaknesses?.length > 0
      ? aiReport.weaknesses
      : this.scorer.identifyStrengthsWeaknesses(dimensionScores).weaknesses;
    const suggestions = aiReport?.suggestions?.length > 0
      ? aiReport.suggestions
      : this.scorer.generateSuggestions(dimensionScores, this.questionResults);

    // 将 AI 逐题点评更新到 questionResults 中
    if (aiReport?.questionFeedbacks) {
      for (let i = 0; i < aiReport.questionFeedbacks.length && i < this.questionResults.length; i++) {
        if (aiReport.questionFeedbacks[i]) {
          this.questionResults[i].feedback = aiReport.questionFeedbacks[i];
        }
      }
    }

    return {
      completed: true,
      dimensionScores,
      overallScore,
      grade: gradeInfo,
      questionResults: this.questionResults,
      strengths,
      weaknesses,
      suggestions,
      dialogue: this.dialogue,
    };
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
