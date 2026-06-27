// State management with publish-subscribe pattern
export class StateManager {
  constructor(initialState) {
    this._state = this._deepClone(initialState);
    this._listeners = new Map();
  }

  getState() {
    return this._state;
  }

  setState(updater) {
    const prev = this._deepClone(this._state);
    if (typeof updater === 'function') {
      this._state = updater(this._deepClone(this._state));
    } else {
      this._state = { ...this._state, ...updater };
    }
    this._notify(prev, this._state);
  }

  subscribe(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, []);
    }
    this._listeners.get(key).push(callback);
    // Return unsubscribe function
    return () => {
      const list = this._listeners.get(key);
      const idx = list.indexOf(callback);
      if (idx > -1) list.splice(idx, 1);
    };
  }

  _notify(prev, next) {
    for (const [key, callbacks] of this._listeners) {
      const prevVal = JSON.stringify(prev[key]);
      const nextVal = JSON.stringify(next[key]);
      if (prevVal !== nextVal) {
        callbacks.forEach(cb => cb(next[key], prev[key]));
      }
    }
  }

  _deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

// Initial state
export const initialState = {
  // Route
  currentRoute: 'welcome',

  // Interview config
  config: {
    type: null,           // 'hr' | 'behavioral' | 'scenario'
    difficulty: null,     // 1 | 2 | 3
    duration: 15,         // minutes (5/10/15)
    major: 'general',     // major id
  },

  // Interview runtime state
  interview: {
    state: 'idle',        // idle | intro | question | waiting | analyzing | follow_up | closing | completed
    startTime: null,
    timeRemaining: null,
    currentQuestionIndex: 0,
    currentQuestion: null,
    followUpCount: 0,
    questions: [],
    responses: [],
    dialogue: [],
    questionResults: [],
  },

  // Interview result
  result: {
    completed: false,
    completedAt: null,
    dimensionScores: {},
    overallScore: 0,
    grade: '',
    questionResults: [],
    suggestions: [],
    strengths: [],
    weaknesses: [],
  },

  // History
  history: [],
};
