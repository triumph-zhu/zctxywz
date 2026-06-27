// Scoring engine
import { WEIGHTS, DIMENSIONS } from '../../data/scoring-rubric.js';

export class Scorer {
  constructor(interviewType) {
    this.type = interviewType;
    this.weights = WEIGHTS[interviewType] || WEIGHTS.hr;
    this.dimensions = DIMENSIONS;
  }

  // Score a single question response
  scoreQuestion(response, question, analysis) {
    const scores = {};
    const relevantDimensions = question.scoringCriteria || this._getDefaultDimensions();

    for (const dim of relevantDimensions) {
      let baseScore = 60;

      // Length assessment
      if (response.length < 20) baseScore -= 20;
      else if (response.length < 50) baseScore -= 8;
      else if (response.length >= 100 && response.length <= 500) baseScore += 5;

      // Structure bonus
      if (analysis.hasStructure) baseScore += 10;

      // STAR completeness
      if (analysis.hasSTAR) {
        baseScore += analysis.hasSTAR.completeness * 3;
      }

      // Example bonus
      if (analysis.hasExample) baseScore += 8;

      // Data support
      if (analysis.hasData) baseScore += 5;

      // Filler penalty
      baseScore -= Math.min(analysis.fillerCount * 2, 10);

      // Dimension-specific adjustments
      if (dim === '逻辑思维' && analysis.hasStructure) baseScore += 5;
      if (dim === '表达能力' && response.length >= 50 && response.length <= 300) baseScore += 5;
      if (dim === '应变能力' && analysis.hasExample) baseScore += 5;
      if (dim === '自信度' && analysis.claims && analysis.claims.length > 0) baseScore += 5;

      scores[dim] = Math.max(0, Math.min(100, baseScore));
    }

    return scores;
  }

  // Calculate dimension scores across all questions
  calculateDimensionScores(questionResults) {
    const dimScores = {};
    const dimCounts = {};

    for (const dim of this.dimensions) {
      dimScores[dim] = 0;
      dimCounts[dim] = 0;
    }

    for (const qr of questionResults) {
      for (const [dim, score] of Object.entries(qr.scores || {})) {
        if (dimScores[dim] !== undefined) {
          dimScores[dim] += score;
          dimCounts[dim]++;
        }
      }
    }

    for (const dim of this.dimensions) {
      if (dimCounts[dim] > 0) {
        dimScores[dim] = Math.round(dimScores[dim] / dimCounts[dim]);
      } else {
        dimScores[dim] = 50; // Default middle score
      }
    }

    return dimScores;
  }

  // Calculate overall score
  calculateOverallScore(dimensionScores) {
    let total = 0;
    for (const [dim, score] of Object.entries(dimensionScores)) {
      total += score * (this.weights[dim] || 0);
    }
    return Math.round(total);
  }

  // Get grade info
  getGrade(score) {
    if (score >= 90) return { grade: '优秀', class: 'excellent', emoji: '🌟' };
    if (score >= 80) return { grade: '良好', class: 'good', emoji: '👍' };
    if (score >= 70) return { grade: '中等', class: 'average', emoji: '💪' };
    if (score >= 60) return { grade: '及格', class: 'pass', emoji: '📝' };
    return { grade: '需提升', class: 'poor', emoji: '📚' };
  }

  // Generate feedback for a single question
  generateQuestionFeedback(response, question, analysis, scores) {
    const feedbacks = [];

    // Positive feedback
    if (analysis.hasStructure) feedbacks.push('回答结构清晰，条理性好');
    if (analysis.hasSTAR && analysis.hasSTAR.completeness >= 3) feedbacks.push('很好地运用了STAR法则');
    if (analysis.hasExample) feedbacks.push('有具体案例支撑，说服力强');
    if (analysis.hasData) feedbacks.push('使用了具体数据，增强了可信度');
    if (response.length >= 100 && response.length <= 300) feedbacks.push('回答长度适中，重点突出');

    // Improvement suggestions
    if (response.length < 50) feedbacks.push('回答过于简短，建议补充更多细节');
    if (!analysis.hasStructure) feedbacks.push('建议使用"首先...其次...最后"等结构化表达');
    if (!analysis.hasExample) feedbacks.push('建议加入具体案例来增强说服力');
    if (analysis.fillerCount > 2) feedbacks.push('注意减少口头禅的使用');
    if (analysis.hasSTAR && analysis.hasSTAR.completeness < 2) feedbacks.push('建议完整描述情境、任务、行动和结果');

    if (feedbacks.length === 0) feedbacks.push('回答基本合格，继续加油');

    return feedbacks.join('；') + '。';
  }

  // Generate overall suggestions
  generateSuggestions(dimensionScores, questionResults) {
    const suggestions = [];
    const sorted = Object.entries(dimensionScores).sort((a, b) => a[1] - b[1]);

    // Suggestions for weakest dimensions
    for (const [dim, score] of sorted.slice(0, 2)) {
      if (score < 70) {
        switch (dim) {
          case '表达能力':
            suggestions.push('回答时注意结构化表达，善用"首先...其次...最后"的框架，避免过于简短或冗长');
            break;
          case '逻辑思维':
            suggestions.push('加强因果关系的表述，用"因为...所以..."等连接词，让回答更有逻辑性');
            break;
          case '专业度':
            suggestions.push('多使用专业术语和行业知识，展示对岗位的深入理解');
            break;
          case '自信度':
            suggestions.push('描述成就时语气要坚定，避免过多使用"可能"、"大概"等不确定词汇');
            break;
          case '情绪管理':
            suggestions.push('面对压力问题时保持冷静，先思考再回答，避免情绪化表达');
            break;
          case '应变能力':
            suggestions.push('面对意外问题不要慌张，可以请求思考时间，然后有条理地组织回答');
            break;
        }
      }
    }

    // General suggestions
    const avgFillers = questionResults.reduce((sum, qr) => sum + (qr.fillerCount || 0), 0) / questionResults.length;
    if (avgFillers > 1.5) {
      suggestions.push('减少"嗯"、"那个"、"就是"等口头禅的使用，会让表达更专业');
    }

    const avgLength = questionResults.reduce((sum, qr) => sum + (qr.responseLength || 0), 0) / questionResults.length;
    if (avgLength < 60) {
      suggestions.push('回答时尽量展开，用具体案例和数据来支撑你的观点');
    }

    const starUsage = questionResults.filter(qr => qr.hasSTAR && qr.hasSTAR.completeness >= 3).length;
    if (starUsage < questionResults.length * 0.5) {
      suggestions.push('练习STAR法则（情境-任务-行动-结果），确保每个行为问题都有完整的故事线');
    }

    if (suggestions.length === 0) {
      suggestions.push('整体表现不错，继续保持！可以尝试更高难度的面试来进一步挑战自己');
    }

    return suggestions;
  }

  // Identify strengths and weaknesses
  identifyStrengthsWeaknesses(dimensionScores) {
    const sorted = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
    const strengths = sorted.filter(([, s]) => s >= 75).map(([d]) => d + '表现突出');
    const weaknesses = sorted.filter(([, s]) => s < 65).map(([d]) => d + '有待提升');

    return { strengths, weaknesses };
  }

  _getDefaultDimensions() {
    return [...this.dimensions];
  }
}
