// Question selector - selects and orders questions based on config
import { questionsHR } from '../../data/questions-hr.js';
import { questionsBehavioral } from '../../data/questions-behavioral.js';
import { questionsScenario } from '../../data/questions-scenario.js';
import { questionsDefense } from '../../data/questions-defense.js';

const QUESTION_BANKS = {
  hr: questionsHR,
  behavioral: questionsBehavioral,
  scenario: questionsScenario,
  defense: questionsDefense,
};

export class QuestionSelector {
  constructor(config) {
    this.type = config.type;
    this.difficulty = config.difficulty;
    this.duration = config.duration;
    this.major = config.major || 'general';
  }

  selectQuestions() {
    const questionCount = Math.max(3, Math.floor(this.duration / 3.5));

    const bank = QUESTION_BANKS[this.type];
    if (!bank || !bank.questions) return [];

    // Filter by major: include 'general' questions + questions matching the major
    const majorPool = bank.questions.filter(q => this._matchesMajor(q));

    // Filter by difficulty
    const pool = majorPool.filter(q => {
      if (this.difficulty === 1) return q.difficulty <= 2;
      if (this.difficulty === 2) return q.difficulty >= 1 && q.difficulty <= 3;
      return q.difficulty >= 2;
    });

    // If no questions after filtering, use all major-matching questions
    const effectivePool = pool.length >= 3 ? pool : majorPool;

    // Ensure each category has at least 1 question
    const categories = [...new Set(effectivePool.map(q => q.category))];
    const selected = [];
    const selectedIds = new Set();

    for (const cat of categories) {
      const catQuestions = effectivePool.filter(q => q.category === cat);
      if (catQuestions.length > 0) {
        const q = this._weightedRandom(catQuestions);
        selected.push(q);
        selectedIds.add(q.id);
      }
    }

    // Fill remaining slots
    const remaining = questionCount - selected.length;
    const unused = effectivePool.filter(q => !selectedIds.has(q.id));
    this._shuffle(unused);

    for (let i = 0; i < remaining && i < unused.length; i++) {
      selected.push(unused[i]);
    }

    // Sort: self_introduction first, then shuffle the rest
    const intro = selected.find(q => q.category === 'self_introduction');
    const others = selected.filter(q => q.category !== 'self_introduction');
    this._shuffle(others);

    return intro ? [intro, ...others] : others;
  }

  _matchesMajor(question) {
    const major = question.major;
    if (!major) return true; // No major field = general
    if (major === 'general') return true;
    if (Array.isArray(major)) return major.includes(this.major);
    return major === this.major;
  }

  _weightedRandom(questions) {
    const weights = questions.map(q => {
      const diffDelta = Math.abs(q.difficulty - this.difficulty);
      // Boost weight for major-specific questions
      const majorBoost = (q.major && q.major !== 'general') ? 1.3 : 1;
      return (1 / (1 + diffDelta * 0.5)) * majorBoost;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < questions.length; i++) {
      random -= weights[i];
      if (random <= 0) return questions[i];
    }
    return questions[questions.length - 1];
  }

  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
