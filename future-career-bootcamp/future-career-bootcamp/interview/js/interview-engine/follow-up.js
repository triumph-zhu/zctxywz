// Follow-up question logic
// [AI-INTEGRATION-POINT] This module can be replaced with AI-powered follow-up generation

import { ResponseAnalyzer } from './response-analyzer.js';

const GENERIC_FOLLOW_UPS = [
  '能再详细说说吗？',
  '可以举个例子吗？',
  '能具体描述一下当时的情形吗？',
  '你刚才提到的这一点，能展开讲讲吗？',
];

const CLAIM_FOLLOW_UPS = [
  '你刚才提到{claim}，能具体说说你在其中的角色吗？',
  '关于{claim}，能分享一下具体的做法吗？',
  '{claim}——能详细说说你是怎么做到的吗？',
];

const SHORT_RESPONSE_PROMPTS = [
  '能再多说一些吗？我想了解更多细节。',
  '可以展开讲讲吗？尽量用具体的例子来说明。',
  '你的回答比较简短，能补充一些细节吗？',
];

export class FollowUpEngine {
  constructor() {
    this.analyzer = new ResponseAnalyzer();
  }

  shouldFollowUp(analysis, config) {
    // Always follow up on very short answers
    if (analysis.length < 30) return true;

    // Follow up if there are extractable claims
    if (analysis.claims && analysis.claims.length > 0) return true;

    // Follow up if answer lacks structure or examples
    if (!analysis.hasStructure && !analysis.hasExample && analysis.length > 50) {
      const probability = { 1: 0.2, 2: 0.4, 3: 0.6 }[config.difficulty] || 0.3;
      return Math.random() < probability;
    }

    // Probability-based follow up by difficulty
    const probability = { 1: 0.3, 2: 0.5, 3: 0.7 }[config.difficulty] || 0.3;
    return Math.random() < probability;
  }

  getFollowUpQuestion(analysis, question) {
    // Short answer → prompt for more
    if (analysis.length < 30) {
      return this._pickRandom(SHORT_RESPONSE_PROMPTS);
    }

    // Has claims → follow up on a claim
    if (analysis.claims && analysis.claims.length > 0) {
      const claim = analysis.claims[Math.floor(Math.random() * analysis.claims.length)];
      const template = this._pickRandom(CLAIM_FOLLOW_UPS);
      return template.replace('{claim}', claim);
    }

    // No example → ask for one
    if (!analysis.hasExample) {
      return '能给我一个具体的例子吗？';
    }

    // No structure → ask for structured response
    if (!analysis.hasStructure) {
      return '能更有条理地组织一下你的回答吗？比如按时间顺序或者按重要程度来说。';
    }

    // Generic follow-up
    return this._pickRandom(GENERIC_FOLLOW_UPS);
  }

  getTargetDimension(analysis) {
    if (!analysis.hasStructure) return '逻辑思维';
    if (!analysis.hasExample) return '表达能力';
    if (analysis.fillerCount > 2) return '表达能力';
    if (analysis.length < 50) return '表达能力';
    return '应变能力';
  }

  _pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
