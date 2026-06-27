// Career Path · Result Page
import { $, $$ } from '../utils/dom.js';
import { saveCareerResult } from '../utils/storage.js';

export class ResultPage {
  constructor(state, router) {
    this.state = state;
    this.router = router;
    this.container = null;
  }

  mount() {
    this.container = document.getElementById('page-result');
    this.container.classList.add('active');
    this._render();
    this._bindEvents();

    // Auto-save result
    const s = this.state.getState();
    if (s.result) {
      saveCareerResult({ ...s.result, basicInfo: s.basicInfo });
    }
  }

  destroy() {
    this.container.classList.remove('active');
  }

  _render() {
    const s = this.state.getState();
    const r = s.result;
    if (!r) {
      this.container.innerHTML = `<div class="container"><p style="color:var(--t-3)">暂无分析结果</p></div>`;
      return;
    }

    this.container.innerHTML = `
      <div class="container">
        <!-- Path Header -->
        <div class="result-section" style="margin-bottom:32px">
          <div class="eyebrow">Career Path</div>
          <div class="result-path-title">推荐路径：<b>${this._esc(r.careerPath)}</b></div>
          <div class="result-path-desc">${this._esc(r.pathDescription)}</div>
        </div>

        <!-- Milestones Timeline -->
        ${r.milestones && r.milestones.length ? `
        <div class="result-section">
          <div class="result-section-title">发展里程碑</div>
          <div class="result-timeline">
            ${r.milestones.map(m => `
              <div class="result-milestone">
                <div class="result-milestone-stage">${this._esc(m.stage)}</div>
                <div class="result-milestone-time">${this._esc(m.timeframe)}</div>
                <div class="result-milestone-goals">${this._esc(m.goals)}</div>
                <div class="result-milestone-actions">${this._esc(m.actions)}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <!-- Strengths -->
        ${r.strengths && r.strengths.length ? `
        <div class="result-section">
          <div class="result-section-title">你的优势</div>
          <div class="result-list">
            ${r.strengths.map(s => `<div class="result-list-item"><span class="result-list-icon gold">✦</span><span>${this._esc(s)}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Skill Gaps -->
        ${r.skillGaps && r.skillGaps.length ? `
        <div class="result-section">
          <div class="result-section-title">需要补充的技能</div>
          <div class="result-list">
            ${r.skillGaps.map(s => `<div class="result-list-item"><span class="result-list-icon cyan">▸</span><span>${this._esc(s)}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Suggestions -->
        ${r.suggestions && r.suggestions.length ? `
        <div class="result-section">
          <div class="result-section-title">行动建议</div>
          <div class="result-list">
            ${r.suggestions.map((s, i) => `<div class="result-list-item"><span class="result-list-icon violet">${i + 1}.</span><span>${this._esc(s)}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Resources -->
        ${r.resources && r.resources.length ? `
        <div class="result-section">
          <div class="result-section-title">推荐资源</div>
          <div class="result-list">
            ${r.resources.map(s => `<div class="result-list-item"><span class="result-list-icon gold">◆</span><span>${this._esc(s)}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Risks -->
        ${r.risks && r.risks.length ? `
        <div class="result-section">
          <div class="result-section-title">潜在风险</div>
          <div class="result-list">
            ${r.risks.map(s => `<div class="result-list-item"><span class="result-list-icon rose">⚠</span><span>${this._esc(s)}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Actions -->
        <div class="result-actions">
          <button class="cp-btn cp-btn-ghost" id="cp-replan">← 重新规划</button>
          <button class="cp-btn cp-btn-primary" id="cp-save">✦ 已保存到历史</button>
        </div>
      </div>`;
  }

  _bindEvents() {
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('#cp-replan')) {
        // Reset form state and go back
        this.state.setState(s => {
          s.formStep = 1;
          s.result = null;
          s.analyzing = false;
          return s;
        });
        this.router.navigate('form');
      }
    });
  }

  _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
