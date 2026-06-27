// AI Adapter - abstraction layer for AI integration
// 讯飞 chatxunfei OpenAI 兼容接口集成，带 MockAI 降级
// 所有面试官对话（开场白、提问、点评追问、过渡、结束语）均通过 AI 生成
// 报告数据（逐题反馈、优缺点、改进建议）也通过 AI 深度分析

import { ResponseAnalyzer } from './response-analyzer.js';
import { FollowUpEngine } from './follow-up.js';
import { Scorer } from './scorer.js';
import { INTERVIEWER_PROFILES } from '../components/avatar.js';
import { getTypeName, getDifficultyName } from '../utils/format.js';
import { getMajorName } from '../../data/majors.js';
import { API_CONFIG } from '../config.js';

// === Base class ===
class AIAdapter {
  async generateIntro(context) { throw new Error('Must be implemented'); }
  async generateQuestion(context) { throw new Error('Must be implemented'); }
  async generateReply(context) { throw new Error('Must be implemented'); }
  async generateQuestionFeedback(context) { throw new Error('Must be implemented'); }
  async generateClosing(context) { throw new Error('Must be implemented'); }
  async generateFullReport(context) { throw new Error('Must be implemented'); }
}

// === Mock implementation (preset logic, 无 AI) ===
class MockAIAdapter extends AIAdapter {
  constructor() {
    super();
    this.analyzer = new ResponseAnalyzer();
    this.followUpEngine = new FollowUpEngine();
  }

  async generateIntro(context) {
    await this._simulateDelay(500, 1000);
    const c = context.config;
    const typeNames = { hr: 'HR', behavioral: '行为', scenario: '情景', defense: '答辩' };
    const diffNames = { 1: '初级', 2: '中级', 3: '高级' };
    return `你好！我是张经理，今天由我来负责你的${typeNames[c.type] || ''}面试。这次面试的难度是${diffNames[c.difficulty] || '中级'}，我们大概会聊${context.totalQuestions}个问题，请放松，如实回答就好。准备好了吗？那我们开始吧。`;
  }

  async generateQuestion(context) {
    await this._simulateDelay(300, 600);
    return context.question.text;
  }

  async generateReply(context) {
    await this._simulateDelay(500, 1000);
    const analysis = this.analyzer.analyze(context.response, context.question);
    const shouldFollowUp = this.followUpEngine.shouldFollowUp(analysis, context.config);
    if (shouldFollowUp) {
      const followUpText = this.followUpEngine.getFollowUpQuestion(analysis, context.question);
      return { text: followUpText, shouldFollowUp: true, aiFeedback: null };
    }
    return { text: this._getTransitionPhrase(), shouldFollowUp: false, aiFeedback: null };
  }

  async generateQuestionFeedback(context) {
    await this._simulateDelay(200, 400);
    const scorer = new Scorer(context.config.type);
    const analysis = this.analyzer.analyze(context.response, context.question);
    const scores = scorer.scoreQuestion(context.response, context.question, analysis);
    const feedback = scorer.generateQuestionFeedback(context.response, context.question, analysis, scores);
    return { scores, feedback };
  }

  async generateClosing(context) {
    await this._simulateDelay(300, 600);
    return '好的，今天的面试就到这里。感谢你的参与，我们会在后续给你详细的反馈。';
  }

  async generateFullReport(context) {
    await this._simulateDelay(500, 1000);
    const scorer = new Scorer(context.config.type);
    const dimScores = scorer.calculateDimensionScores(context.questionResults);
    const { strengths, weaknesses } = scorer.identifyStrengthsWeaknesses(dimScores);
    const suggestions = scorer.generateSuggestions(dimScores, context.questionResults);
    return { strengths, weaknesses, suggestions, questionFeedbacks: [] };
  }

  _simulateDelay(min, max) {
    return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
  }

  _getTransitionPhrase() {
    const phrases = [
      '好的，了解了。接下来，',
      '明白了。那我们换个话题，',
      '谢谢你的回答。下一个问题，',
      '嗯，好的。接下来，',
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
}

// === 讯飞 chatxunfei OpenAI 兼容接口 ===
class XunfeiAdapter extends AIAdapter {
  constructor(config) {
    super();
    this.apiKey = API_CONFIG.xunfei.apiKey;
    this.apiSecret = API_CONFIG.xunfei.apiSecret;
    this.baseUrl = API_CONFIG.xunfei.baseUrl;
    this.model = API_CONFIG.xunfei.model;
    this.config = config;
    this.mockFallback = new MockAIAdapter();
    this.analyzer = new ResponseAnalyzer();
  }

  _getAuthToken() {
    return `${this.apiKey}:${this.apiSecret}`;
  }

  // --- 面试官身份 Prompt ---
  _buildSystemPrompt() {
    const c = this.config;
    const profileId = this._getProfileId();
    const profile = INTERVIEWER_PROFILES[profileId] || INTERVIEWER_PROFILES.male_hr;
    const typeName = getTypeName(c.type);
    const diffName = getDifficultyName(c.difficulty);
    const majorName = getMajorName(c.major);
    const qIndex = c._currentQuestionIndex || '?';
    const qTotal = c._totalQuestions || '?';

    // 答辩场景用专门的提示词
    if (c.type === 'defense') {
      return '你是' + profile.name + '，' + profile.title + '，正在主持一场' + typeName + '。\n' +
        '答辩难度为' + diffName + '，专业方向为' + majorName + '。\n\n' +
        '你的行为准则：\n' +
        '1. 你是答辩委员会主席，学术严谨、专业权威，但态度尊重\n' +
        '2. 你必须对答辩人的回答做出专业点评——指出论证的优点和不足\n' +
        '3. 点评要学术化，如"你的研究方法选择有理论支撑"、"数据分析的深度不够，需要更多论证"\n' +
        '4. 点评完再决定：如果论证不够充分就追问细节，如果论证充分就进入下一个问题\n' +
        '5. 追问时针对具体论证环节深入，如样本选择、数据处理、理论框架等\n' +
        '6. 回复控制在80字以内，点评+追问/过渡\n' +
        '7. 只输出你说的内容，不要加标注或括号\n' +
        '8. 用学术但自然的口吻表达\n\n' +
        '当前答辩进行到第' + qIndex + '/' + qTotal + '题。';
    }

    return '你是' + profile.name + '，' + profile.title + '，正在主持一场' + typeName + '面试。\n' +
      '面试难度为' + diffName + '，专业方向为' + majorName + '。\n\n' +
      '你的行为准则：\n' +
      '1. 你是专业的面试官，语气沉稳、礼貌，偶尔温和鼓励候选人\n' +
      '2. 你必须对候选人的回答做出点评——指出回答中的亮点和不足，但不要暴露评分细节\n' +
      '3. 点评要具体，比如"你提到了具体数据，这很好"、"回答有点笼统，可以更具体些"\n' +
      '4. 点评完再决定：如果回答不够具体或有深入空间就追问，如果回答充分就自然过渡到下一题\n' +
      '5. 追问时针对候选人提到的具体内容深入，不要问泛泛的问题\n' +
      '6. 回复控制在80字以内，点评+追问/过渡\n' +
      '7. 只输出你说的内容，不要加任何标注、括号或解释性文字\n' +
      '8. 用自然口语表达，像真人面试官一样说话\n\n' +
      '当前面试进行到第' + qIndex + '/' + qTotal + '题。';
  }

  _getProfileId() {
    switch (this.config.type) {
      case 'hr': return 'male_hr';
      case 'behavioral': return 'female_hr';
      case 'scenario': return 'tech_lead';
      case 'defense': return 'defense_prof';
      default: return 'male_hr';
    }
  }

  // --- API Call (通过本地代理转发到讯飞) ---
  async _callAPI(messages, maxTokens = 200) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
          // 认证信息由代理转发到讯飞时补上 Authorization header
          apiKey: this.apiKey,
          apiSecret: this.apiSecret,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`讯飞 API error (${response.status}): ${errText}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.warn('讯飞 API returned empty content:', JSON.stringify(data));
        return null;
      }
      return content.trim();
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('讯飞 API call timed out (30s)');
      } else {
        console.warn(`讯飞 API call failed: ${err.message}`);
      }
      return null;
    }
  }

  // --- 开场白 ---
  async generateIntro(context) {
    const c = context.config;
    const profileId = this._getProfileId();
    const profile = INTERVIEWER_PROFILES[profileId] || INTERVIEWER_PROFILES.male_hr;
    const typeName = getTypeName(c.type);
    const diffName = getDifficultyName(c.difficulty);
    const majorName = getMajorName(c.major);

    const isDefense = c.type === 'defense';
    const introPrompt = isDefense
      ? `你是${profile.name}，${profile.title}。你正在主持一场${typeName}，难度${diffName}，专业方向${majorName}。请用学术严谨但友好的口吻做答辩开场白，说明答辩流程（陈述→提问→总结），控制在80字以内。只输出开场白内容。`
      : `你是${profile.name}，${profile.title}。你正在主持一场${typeName}面试，难度${diffName}，专业方向${majorName}。请用自然口语做面试开场白，简短自我介绍并说明面试流程，控制在80字以内。只输出开场白内容。`;

    const messages = [
      { role: 'system', content: introPrompt },
      { role: 'user', content: isDefense ? '请开始答辩，做简短的开场介绍。' : '请开始面试，做简短的开场介绍。' },
    ];

    const result = await this._callAPI(messages);
    return result || this.mockFallback.generateIntro(context);
  }

  // --- 题目提问（AI 用自然口吻说出题目）---
  async generateQuestion(context) {
    const { question } = context;
    const isDefense = this.config.type === 'defense';
    const questionPrompt = isDefense
      ? `现在需要你向答辩人提出以下问题，请用答辩委员会主席的学术口吻重新表达这道题目，让它听起来像学术答辩中的专业提问。保持原意不变，语气严谨专业。只输出提问内容，不要加任何额外说明。\n\n原题：${question.text}`
      : `现在需要你向候选人提出以下面试问题，请用你自己的自然口吻重新表达这道题目，让它听起来像真人面试官在提问，而不是在读题。保持原意不变，但语气要自然亲切。只输出提问内容，不要加任何额外说明。\n\n原题：${question.text}`;

    const messages = [
      { role: 'system', content: this._buildSystemPrompt() },
      { role: 'user', content: questionPrompt },
    ];

    const result = await this._callAPI(messages);
    return result || question.text;
  }

  // --- 对话回复（点评 + 追问或过渡）---
  async generateReply(context) {
    const { response, question, dialogueHistory } = context;

    const messages = [
      { role: 'system', content: this._buildSystemPrompt() },
    ];

    // 添加对话历史，让 AI 有上下文
    const recentHistory = (dialogueHistory || []).slice(-20);
    for (const entry of recentHistory) {
      if (entry.role === 'interviewer') {
        messages.push({ role: 'assistant', content: entry.text });
      } else if (entry.role === 'candidate') {
        messages.push({ role: 'user', content: entry.text });
      }
    }

    // 明确告诉 AI 候选人刚回答了什么
    if (question) {
      messages.push({
        role: 'user',
        content: `关于"${question.text}"这个问题，我的回答是：${response}`,
      });
    }

    const aiReply = await this._callAPI(messages, 200);

    if (aiReply) {
      const shouldFollowUp = this._detectFollowUp(aiReply);
      return {
        text: aiReply,
        shouldFollowUp,
        aiFeedback: aiReply, // AI 的回复本身就包含了点评
      };
    }

    // Fallback
    console.warn('讯飞 generateReply fallback to mock');
    return this.mockFallback.generateReply(context);
  }

  // --- 逐题 AI 打分 + 反馈 ---
  async generateQuestionFeedback(context) {
    const { question, response, config } = context;
    const isDefense = config.type === 'defense';
    const dims = question.scoringCriteria || ['表达能力', '逻辑思维', '专业度', '自信度', '情绪管理', '应变能力'];

    // 先用本地分析获取客观指标
    const analysis = this.analyzer.analyze(response, question);
    const objIndicators = [];
    if (response.length < 30) objIndicators.push('回答极短（不足30字）');
    else if (response.length < 60) objIndicators.push('回答较短（不足60字）');
    else if (response.length > 200) objIndicators.push('回答较长（' + response.length + '字）');
    if (analysis.hasStructure) objIndicators.push('有结构化表达');
    else objIndicators.push('缺乏结构化表达');
    if (analysis.hasSTAR && analysis.hasSTAR.completeness >= 3) objIndicators.push('STAR法则完整度:' + analysis.hasSTAR.completeness + '/4');
    else if (analysis.hasSTAR) objIndicators.push('STAR法则完整度:' + (analysis.hasSTAR.completeness || 0) + '/4');
    if (analysis.hasExample) objIndicators.push('有具体案例');
    else objIndicators.push('缺少具体案例');
    if (analysis.hasData) objIndicators.push('有数据支撑');
    else objIndicators.push('缺少数据支撑');
    if (analysis.fillerCount > 2) objIndicators.push('口头禅较多（' + analysis.fillerCount + '处）');

    const dimsPrompt = dims.map(d => `${d}(0-100)`).join('、');

    const scoringPrompt = isDefense
      ? `你是答辩委员会评分专家。请严格按标准对答辩回答逐维度打分。

【评分维度】${dimsPrompt}

【严格评分标准】
- 85-100：极优秀（前5%）。论证严密完整，数据详实，逻辑无懈可击，对质疑回应出色
- 70-84：良好（前25%）。论证较充分，有具体支撑，但存在可改进之处
- 55-69：合格（中间50%）。基本能回应问题，但论证笼统、深度不够、或缺少关键要素
- 40-54：不合格（后25%）。回答偏题、过于简短、逻辑混乱、或明显回避核心问题
- 0-39：极差。完全跑题、无法作答、或内容空洞

【客观分析指标】${objIndicators.join('；')}

【关键规则】
1. 大部分人应该在55-75分区间，不要默认给高分
2. 回答短于50字且无实质内容，所有维度不应超过55分
3. 缺少具体案例和数据的回答，专业度不应超过65分
4. 无结构化表达的回答，逻辑思维不应超过65分
5. 有口头禅的回答，表达能力扣5-10分
6. 每个维度的分数必须有差异，不要全部给相同分

【输出格式】严格按此格式，不要加任何额外文字：
维度1:分数1,维度2:分数2,...|
点评（指出1-2个亮点和1-2个不足，60字以内）`
      : `你是面试评分专家。请严格按标准对面试回答逐维度打分。

【评分维度】${dimsPrompt}

【严格评分标准】
- 85-100：极优秀（前5%）。回答结构清晰，有具体案例和数据支撑，逻辑严密，自信从容
- 70-84：良好（前25%）。回答有具体内容，基本有条理，但深度或说服力可提升
- 55-69：合格（中间50%）。能回答问题但较笼统，缺少具体案例，或表述不够清晰
- 40-54：不合格（后25%）。回答过短、跑题、缺乏实质内容、或逻辑混乱
- 0-39：极差。无法回答、完全跑题、或内容空洞无物

【客观分析指标】${objIndicators.join('；')}

【关键规则】
1. 大部分人应该在55-75分区间，不要默认给高分
2. 回答短于50字且无实质内容，所有维度不应超过55分
3. 缺少具体案例和数据的回答，专业度不应超过65分
4. 无结构化表达的回答，逻辑思维不应超过65分
5. 有口头禅的回答，表达能力扣5-10分
6. 每个维度的分数必须有差异，不要全部给相同分

【输出格式】严格按此格式，不要加任何额外文字：
维度1:分数1,维度2:分数2,...|
点评（指出1-2个亮点和1-2个不足，60字以内）`;

    const messages = [
      { role: 'system', content: scoringPrompt },
      {
        role: 'user',
        content: `问题：${question.text}\n回答：${response}`,
      },
    ];

    const result = await this._callAPI(messages, 200);

    let scores = {};
    let feedback = '';

    if (result) {
      // 解析 AI 输出: "维度1:分数1,维度2:分数2,...|点评"
      const pipeIdx = result.indexOf('|');
      if (pipeIdx > 0) {
        const scoreStr = result.substring(0, pipeIdx);
        feedback = result.substring(pipeIdx + 1).trim();

        const scorePairs = scoreStr.split(',');
        for (const pair of scorePairs) {
          const colonIdx = pair.lastIndexOf(':');
          if (colonIdx > 0) {
            const dim = pair.substring(0, colonIdx).trim();
            const val = parseInt(pair.substring(colonIdx + 1).trim());
            if (dim && !isNaN(val) && val >= 0 && val <= 100) {
              scores[dim] = val;
            }
          }
        }
      } else {
        feedback = result;
      }
    }

    // AI 打分缺失的维度用本地算法补上
    const scorer = new Scorer(config.type);
    const localScores = scorer.scoreQuestion(response, question, analysis);
    for (const dim of dims) {
      if (scores[dim] === undefined) {
        scores[dim] = localScores[dim] || 60;
      }
    }

    if (!feedback) {
      feedback = scorer.generateQuestionFeedback(response, question, analysis, localScores);
    }

    return { scores, feedback };
  }

  // --- 结束语 ---
  async generateClosing(context) {
    const { config } = context;
    const profileId = this._getProfileId();
    const profile = INTERVIEWER_PROFILES[profileId] || INTERVIEWER_PROFILES.male_hr;
    const isDefense = config.type === 'defense';

    const closingPrompt = isDefense
      ? `你是${profile.name}，${profile.title}。答辩已经全部结束，请对答辩人做一个简短的结束语，肯定其研究工作，表示委员会将进行评议。语气学术严谨，控制在60字以内。只输出结束语内容。`
      : `你是${profile.name}，${profile.title}。面试已经全部结束，请对候选人做一个简短的结束语，感谢参与，表示后续会给出反馈。语气温和专业，控制在60字以内。只输出结束语内容。`;

    const messages = [
      { role: 'system', content: closingPrompt },
      { role: 'user', content: isDefense ? '答辩结束了，请做结束语。' : '面试结束了，请做结束语。' },
    ];

    const result = await this._callAPI(messages);
    return result || this.mockFallback.generateClosing(context);
  }

  // --- 完整报告深度分析（优缺点 + 改进建议 + 逐题点评）---
  async generateFullReport(context) {
    const { questionResults, config } = context;

    // 逐题 AI 点评（并行请求）
    const feedbackPromises = questionResults.map(async (qr) => {
      const result = await this.generateQuestionFeedback({
        question: { text: qr.questionText, category: qr.category, scoringCriteria: Object.keys(qr.scores || {}) },
        response: qr.response,
        config,
      });
      return result.feedback;
    });
    const questionFeedbacks = await Promise.all(feedbackPromises);

    // 整体优缺点分析
    const qSummary = questionResults.map((qr, i) =>
      `Q${i + 1}(${qr.categoryName || ''}): 问"${qr.questionText}" 答"${qr.response.substring(0, 80)}${qr.response.length > 80 ? '...' : ''}" 反馈:${questionFeedbacks[i]}`
    ).join('\n');

    const strengthsMessages = [
      {
        role: 'system',
        content: '你是一位资深职场顾问，根据面试数据分析候选人的优势和待提升之处。优势3-5条，待提升2-3条。每条控制在20字以内。输出格式：\n优势：\n1. xxx\n2. xxx\n...\n待提升：\n1. xxx\n2. xxx',
      },
      {
        role: 'user',
        content: `面试数据：\n${qSummary}\n\n请分析优势和待提升之处。`,
      },
    ];

    const strengthsResult = await this._callAPI(strengthsMessages, 300);
    let strengths = [];
    let weaknesses = [];

    if (strengthsResult) {
      const lines = strengthsResult.split('\n').map(l => l.trim()).filter(l => l);
      let inStrengths = false;
      let inWeaknesses = false;
      for (const line of lines) {
        if (line.startsWith('优势') || line.startsWith('✅')) {
          inStrengths = true; inWeaknesses = false; continue;
        }
        if (line.startsWith('待提升') || line.startsWith('⚠️')) {
          inStrengths = false; inWeaknesses = true; continue;
        }
        const cleaned = line.replace(/^\d+[.、)\s]*/, '').trim();
        if (!cleaned) continue;
        if (inStrengths) strengths.push(cleaned);
        if (inWeaknesses) weaknesses.push(cleaned);
      }
    }

    // 改进建议
    const suggestionsMessages = [
      {
        role: 'system',
        content: '你是一位资深职场顾问，请根据面试数据给出3-5条具体、可操作的改进建议。每条建议控制在40字以内，要有针对性。输出格式：\n1. xxx\n2. xxx',
      },
      {
        role: 'user',
        content: `面试数据：\n${qSummary}\n\n请给出改进建议。`,
      },
    ];

    const suggestionsResult = await this._callAPI(suggestionsMessages, 400);
    let suggestions = [];

    if (suggestionsResult) {
      suggestions = suggestionsResult
        .split('\n')
        .map(l => l.trim())
        .filter(l => l)
        .map(l => l.replace(/^\d+[.、)\s]*/, '').trim())
        .filter(s => s.length > 5);
    }

    // 本地兜底
    if (strengths.length === 0 || weaknesses.length === 0) {
      const scorer = new Scorer(config.type);
      const dimScores = scorer.calculateDimensionScores(questionResults);
      const local = scorer.identifyStrengthsWeaknesses(dimScores);
      if (strengths.length === 0) strengths = local.strengths;
      if (weaknesses.length === 0) weaknesses = local.weaknesses;
    }

    if (suggestions.length === 0) {
      const scorer = new Scorer(config.type);
      const dimScores = scorer.calculateDimensionScores(questionResults);
      suggestions = scorer.generateSuggestions(dimScores, questionResults);
    }

    return { strengths, weaknesses, suggestions, questionFeedbacks };
  }

  // --- Helpers ---
  _detectFollowUp(text) {
    const questionPatterns = [
      /能.*说说|能.*详细|能.*具体|能.*展开|可以.*举例|为什么|怎么|如何|哪些|什么/,
      /呢？|吗？|？$/,
      /追问|深入|进一步|更多|补充|展开/,
    ];
    return questionPatterns.some(p => p.test(text));
  }
}

// === Factory ===
export function createAIAdapter(type = 'xunfei', config = {}) {
  switch (type) {
    case 'xunfei':
      return new XunfeiAdapter(config);
    case 'mock':
    default:
      return new MockAIAdapter();
  }
}
