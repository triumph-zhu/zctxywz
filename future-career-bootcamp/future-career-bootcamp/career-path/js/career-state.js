// Career Path State Management（内联 StateManager，避免跨目录依赖）

export class StateManager {
  constructor(initialState) {
    this._state = this._deepClone(initialState);
    this._listeners = new Map();
  }
  getState() { return this._state; }
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
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key).push(callback);
    return () => { const list = this._listeners.get(key); const idx = list.indexOf(callback); if (idx > -1) list.splice(idx, 1); };
  }
  _notify(prev, next) {
    for (const [key, callbacks] of this._listeners) {
      const prevVal = JSON.stringify(prev[key]);
      const nextVal = JSON.stringify(next[key]);
      if (prevVal !== nextVal) callbacks.forEach(cb => cb(next[key], prev[key]));
    }
  }
  _deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
}

// Initial state
export const initialCareerState = {
  currentRoute: 'form',
  formStep: 1,

  basicInfo: { name: '', grade: '', major: '', majorCustom: '' },
  careerIntent: { industries: [], roles: [], goal: '' },
  skills: { existing: [], existingCustom: '', strengths: [], strengthsCustom: '', gaps: [], gapsCustom: '' },
  preferences: { cities: [], workload: '', salary: '' },
  extra: '',

  result: null,
  analyzing: false,
  history: [],
};
