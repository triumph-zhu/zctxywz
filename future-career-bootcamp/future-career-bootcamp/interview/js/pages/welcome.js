// Welcome page logic
import { $, $$, createElement, initRipple } from '../utils/dom.js';
import { loadHistory, clearHistory } from '../utils/storage.js';
import { getTypeName, getDifficultyName, getScoreGrade, formatDate } from '../utils/format.js';
import { MAJORS, getMajorName, getMajorIcon } from '../../data/majors.js';

export class WelcomePage {
  constructor(state, router) {
    this.state = state;
    this.router = router;
    this.container = null;
  }

  mount() {
    this.container = document.getElementById('page-welcome');
    this.container.classList.add('active');
    this._render();
    this._bindEvents();
    initRipple(this.container);
  }

  destroy() {
    this.container.classList.remove('active');
  }

  _render() {
    const s = this.state.getState();
    const history = loadHistory();

    this.container.innerHTML = `
      <div class="welcome-page">
        <header class="welcome-header">
          <div class="welcome-logo">🎯</div>
          <h1 class="welcome-title">职场面试模拟器</h1>
          <p class="welcome-subtitle">仿真面试场景，助你轻松应对真实面试</p>
        </header>

        <div class="welcome-content">
          <div class="welcome-section">
            <div class="welcome-section-title">选择面试类型</div>
            <div class="type-cards">
              <div class="card card-selectable card-hover type-card ${s.config.type === 'hr' ? 'active' : ''}" data-type="hr">
                <div class="card-icon" style="background:rgba(52,152,219,0.1);color:#3498db;">👔</div>
                <div class="card-title">HR面试</div>
                <div class="card-desc">综合素质考察，自我介绍、优缺点、职业规划等</div>
              </div>
              <div class="card card-selectable card-hover type-card ${s.config.type === 'behavioral' ? 'active' : ''}" data-type="behavioral">
                <div class="card-icon" style="background:rgba(155,89,182,0.1);color:#9b59b6;">🤝</div>
                <div class="card-title">行为面试</div>
                <div class="card-desc">基于STAR法则，挑战应对、团队协作、冲突处理</div>
              </div>
              <div class="card card-selectable card-hover type-card ${s.config.type === 'scenario' ? 'active' : ''}" data-type="scenario">
                <div class="card-icon" style="background:rgba(230,126,34,0.1);color:#e67e22;">⚡</div>
                <div class="card-title">情景面试</div>
                <div class="card-desc">假设场景，资源不足、危机处理、道德困境</div>
              </div>
              <div class="card card-selectable card-hover type-card ${s.config.type === 'defense' ? 'active' : ''}" data-type="defense">
                <div class="card-icon" style="background:rgba(41,128,185,0.1);color:#2980b9;">🎓</div>
                <div class="card-title">论文答辩</div>
                <div class="card-desc">模拟答辩委员会提问，选题意义、研究方法、质疑应对</div>
              </div>
            </div>
          </div>

          <div class="welcome-section">
            <div class="welcome-section-title">选择难度</div>
            <div class="btn-group" data-group="difficulty">
              <button class="btn btn-option ${s.config.difficulty === 1 ? 'active' : ''}" data-value="1">初级</button>
              <button class="btn btn-option ${s.config.difficulty === 2 ? 'active' : ''}" data-value="2">中级</button>
              <button class="btn btn-option ${s.config.difficulty === 3 ? 'active' : ''}" data-value="3">高级</button>
            </div>
          </div>

          <div class="welcome-section">
            <div class="welcome-section-title">面试时长</div>
            <div class="btn-group" data-group="duration">
              <button class="btn btn-option ${s.config.duration === 5 ? 'active' : ''}" data-value="5">5分钟</button>
              <button class="btn btn-option ${s.config.duration === 10 ? 'active' : ''}" data-value="10">10分钟</button>
              <button class="btn btn-option ${s.config.duration === 15 ? 'active' : ''}" data-value="15">15分钟</button>
            </div>
          </div>

          <div class="welcome-section">
            <div class="welcome-section-title">专业方向</div>
            <div class="major-cards">
              ${MAJORS.map(m => `
                <div class="card card-selectable card-hover major-card ${s.config.major === m.id ? 'active' : ''}" data-major="${m.id}">
                  <div class="major-card-icon">${m.icon}</div>
                  <div class="major-card-name">${m.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="welcome-start">
            <button class="btn btn-primary btn-lg" id="start-btn" ${(!s.config.type || !s.config.difficulty) ? 'disabled' : ''}>
              开始面试
            </button>
          </div>

          <div class="welcome-history" id="history-section" ${history.length === 0 ? 'style="display:none"' : ''}>
            <div class="history-header">
              <div class="history-title">📋 面试记录 (${history.length})</div>
              <button class="btn btn-ghost btn-sm" id="clear-history-btn" ${history.length === 0 ? 'style="display:none"' : ''}>清空记录</button>
            </div>
            <div class="history-list" id="history-list">
              ${this._renderHistory(history)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _renderHistory(history) {
    if (history.length === 0) {
      return '<div class="history-empty">暂无面试记录，快来试试吧！</div>';
    }

    return history.map((entry, i) => {
      const gradeInfo = getScoreGrade(entry.overallScore);
      const majorName = getMajorName(entry.config?.major);
      const isEarlyEnd = entry.isEarlyEnd;

      return `
        <div class="history-item" data-index="${i}">
          <div class="history-info">
            <span class="history-type">${getTypeName(entry.config?.type)}</span>
            <span class="history-major">${majorName}</span>
            <span class="history-date">${formatDate(entry.completedAt)}</span>
            ${isEarlyEnd ? '<span class="history-early-end">提前结束</span>' : ''}
          </div>
          <div class="history-right">
            <span class="history-score history-score--${gradeInfo.class}">${entry.overallScore}分</span>
            <span class="history-action">查看</span>
          </div>
        </div>
      `;
    }).join('');
  }

  _bindEvents() {
    // Type card selection
    $$('.type-card', this.container).forEach(card => {
      card.addEventListener('click', () => {
        $$('.type-card', this.container).forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.setState(s => { s.config.type = card.dataset.type; return s; });
        this._updateStartButton();
      });
    });

    // Button groups (difficulty, duration)
    $$('[data-group]', this.container).forEach(group => {
      const groupName = group.dataset.group;
      group.querySelectorAll('.btn-option').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const value = parseInt(btn.dataset.value);
          this.state.setState(s => {
            if (groupName === 'difficulty') s.config.difficulty = value;
            if (groupName === 'duration') s.config.duration = value;
            return s;
          });
          this._updateStartButton();
        });
      });
    });

    // Major card selection
    $$('.major-card', this.container).forEach(card => {
      card.addEventListener('click', () => {
        $$('.major-card', this.container).forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.setState(s => { s.config.major = card.dataset.major; return s; });
      });
    });

    // Start button
    const startBtn = $('#start-btn', this.container);
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const s = this.state.getState();
        if (s.config.type && s.config.difficulty) {
          this.router.navigate('interview');
        }
      });
    }

    // History items - click to view report
    $$('.history-item', this.container).forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        const history = loadHistory();
        const entry = history[idx];
        if (entry) {
          // Reconstruct report from history data
          const report = {
            completed: true,
            config: entry.config,
            overallScore: entry.overallScore,
            grade: entry.grade,
            completedAt: entry.completedAt,
            dimensionScores: entry.dimensionScores || {},
            questionResults: entry.questionResults || [],
            strengths: entry.strengths || [],
            weaknesses: entry.weaknesses || [],
            suggestions: entry.suggestions || [],
            isEarlyEnd: entry.isEarlyEnd || false,
            actualDuration: entry.config?.duration * 60 || 900,
          };
          this.state.setState({ result: report });
          this.router.navigate('report');
        }
      });
    });

    // Clear history button
    const clearBtn = $('#clear-history-btn', this.container);
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有面试记录吗？')) {
          clearHistory();
          this._render();
          this._bindEvents();
          initRipple(this.container);
        }
      });
    }
  }

  _updateStartButton() {
    const s = this.state.getState();
    const btn = $('#start-btn', this.container);
    if (btn) {
      btn.disabled = !s.config.type || !s.config.difficulty;
    }
  }
}
