// Report page logic
import { $, $$, createElement, initRipple } from '../utils/dom.js';
import { getTypeName, getDifficultyName, getScoreGrade, getScoreColor, getRatingClass, formatDuration } from '../utils/format.js';
import { RadarChart } from '../components/radar-chart.js';
import { DIMENSIONS } from '../../data/scoring-rubric.js';
import { getMajorName } from '../../data/majors.js';

export class ReportPage {
  constructor(state, router) {
    this.state = state;
    this.router = router;
    this.container = null;
  }

  mount() {
    this.container = document.getElementById('page-report');
    this.container.classList.add('active');
    this._render();
    this._bindEvents();
    initRipple(this.container);
    // Trigger animations after render
    requestAnimationFrame(() => {
      this._animateScore();
      this._observeRatings();
    });
  }

  destroy() {
    this.container.classList.remove('active');
  }

  _render() {
    const result = this.state.getState().result;

    if (!result || !result.completed) {
      this.container.innerHTML = `
        <div class="report-page">
          <div class="report-container text-center" style="padding-top:100px;">
            <div style="font-size:48px;margin-bottom:16px;">📋</div>
            <h2>暂无面试报告</h2>
            <p class="text-secondary mt-md">完成一次面试后即可查看报告</p>
            <button class="btn btn-primary mt-lg" id="go-home-btn">返回首页</button>
          </div>
        </div>
      `;
      return;
    }

    const gradeInfo = result.grade || getScoreGrade(result.overallScore);
    const config = result.config || {};
    const score = result.overallScore;
    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 70; // r=70
    const offset = circumference * (1 - score / 100);

    this.container.innerHTML = `
      <div class="report-page">
        <div class="report-container">
          <!-- Header -->
          <div class="report-header">
            <h1 class="report-title">面试报告</h1>
            <div class="report-meta">
              ${getTypeName(config.type)} · ${getMajorName(config.major)} · ${getDifficultyName(config.difficulty)}
              ${result.actualDuration ? ` · 用时${formatDuration(result.actualDuration)}` : ''}
              ${result.isEarlyEnd ? ' · <span style="color:var(--color-danger);">提前结束</span>' : ''}
            </div>
          </div>

          <!-- Score card with ring -->
          <div class="card report-score-card">
            <div class="report-score-ring">
              <svg viewBox="0 0 160 160" width="160" height="160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-divider)" stroke-width="8"/>
                <circle cx="80" cy="80" r="70" fill="none" stroke="${color}" stroke-width="8"
                  stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}"
                  stroke-dashoffset="${circumference.toFixed(2)}"
                  transform="rotate(-90 80 80)"
                  class="score-ring-progress"
                  data-target-offset="${offset.toFixed(2)}"
                  style="transition: stroke-dashoffset 1.5s ease-out;"/>
              </svg>
              <div class="report-score-center">
                <div class="report-score-number" style="color:${color}" data-target="${score}">0</div>
                <div class="report-score-max">/ 100</div>
              </div>
            </div>
            <div class="report-grade report-grade--${gradeInfo.class}">
              ${gradeInfo.emoji} ${gradeInfo.grade}
            </div>
          </div>

          <!-- Radar chart -->
          <div class="card" id="radar-section">
            <div class="report-section-title">能力画像</div>
            <div class="radar-chart-container">
              <canvas id="radar-canvas" style="width:300px;height:300px;"></canvas>
            </div>
          </div>

          <!-- Dimension scores -->
          <div class="card" style="margin-bottom:var(--space-lg);">
            <div class="report-section-title">各维度评分</div>
            <div id="dimension-ratings">
              ${this._renderDimensionRatings(result.dimensionScores)}
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          ${this._renderStrengthsWeaknesses(result.strengths, result.weaknesses)}

          <!-- Question review -->
          <div class="report-section">
            <div class="report-section-title">逐题回顾</div>
            ${this._renderQuestionReview(result.questionResults)}
          </div>

          <!-- Suggestions -->
          <div class="report-section">
            <div class="report-section-title">改进建议</div>
            <div class="report-suggestion-list">
              ${(result.suggestions || []).map((s, i) => `
                <div class="report-suggestion-item">
                  <div class="report-suggestion-icon">💡</div>
                  <div class="report-suggestion-text">${s}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Actions -->
          <div class="report-actions">
            <button class="btn btn-secondary" id="go-home-btn">返回首页</button>
            <button class="btn btn-primary" id="retry-btn">再面一次</button>
          </div>
        </div>
      </div>
    `;

    // Draw radar chart after DOM is ready
    requestAnimationFrame(() => this._drawRadarChart(result.dimensionScores));
  }

  _renderDimensionRatings(dimensionScores) {
    if (!dimensionScores) return '';
    return DIMENSIONS.map(dim => {
      const score = dimensionScores[dim] || 0;
      const ratingClass = getRatingClass(score);
      return `
        <div class="rating-bar">
          <div class="rating-label">${dim}</div>
          <div class="rating-track">
            <div class="rating-fill rating-fill--${ratingClass}" data-width="${score}%"></div>
          </div>
          <div class="rating-score" style="color:${getScoreColor(score)}">${score}</div>
        </div>
      `;
    }).join('');
  }

  _renderStrengthsWeaknesses(strengths, weaknesses) {
    if ((!strengths || strengths.length === 0) && (!weaknesses || weaknesses.length === 0)) return '';

    return `
      <div class="card" style="margin-bottom:var(--space-lg);">
        ${strengths && strengths.length > 0 ? `
          <div style="margin-bottom:var(--space-md);">
            <div class="report-section-title">✅ 优势</div>
            <div class="report-sw-list">
              ${strengths.map(s => `
                <div class="report-sw-item">
                  <span class="icon" style="color:var(--color-success);">●</span>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${weaknesses && weaknesses.length > 0 ? `
          <div>
            <div class="report-section-title">⚠️ 待提升</div>
            <div class="report-sw-list">
              ${weaknesses.map(w => `
                <div class="report-sw-item">
                  <span class="icon" style="color:var(--color-warning);">●</span>
                  <span>${w}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  _renderQuestionReview(questionResults) {
    if (!questionResults || questionResults.length === 0) return '<p class="text-secondary">暂无题目数据</p>';

    return questionResults.map((qr, i) => {
      const avgScore = qr.scores ? Math.round(Object.values(qr.scores).reduce((a, b) => a + b, 0) / Object.values(qr.scores).length) : 0;

      return `
        <div class="report-question-item">
          <div class="report-question-header">
            <div class="report-question-label">Q${i + 1} · ${qr.categoryName || qr.category || ''}</div>
            <div class="report-question-score" style="color:${getScoreColor(avgScore)}">${avgScore}分</div>
          </div>
          <div class="report-question-text">${qr.questionText || ''}</div>
          <div class="report-question-response">${qr.response || ''}</div>
          <div class="report-question-feedback">${qr.feedback || ''}</div>
        </div>
      `;
    }).join('');
  }

  _drawRadarChart(dimensionScores) {
    const canvas = document.getElementById('radar-canvas');
    if (!canvas || !dimensionScores) return;

    const values = DIMENSIONS.map(dim => dimensionScores[dim] || 0);
    const chart = new RadarChart(canvas, {
      dimensions: DIMENSIONS,
      values: values,
      maxValue: 100,
    });
    chart.drawAnimated(1200);
  }

  _animateScore() {
    // Ring progress animation
    const ring = this.container.querySelector('.score-ring-progress');
    if (ring) {
      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = ring.dataset.targetOffset;
      });
    }

    // Number count-up animation
    const numEl = this.container.querySelector('.report-score-number');
    if (numEl && numEl.dataset.target) {
      const target = parseInt(numEl.dataset.target);
      this._countUp(numEl, 0, target, 1500);
    }
  }

  _countUp(element, start, end, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      element.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  _observeRatings() {
    const bars = $$('.rating-bar', this.container);
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const fill = bar.querySelector('.rating-fill');
          if (fill && fill.dataset.width) {
            fill.style.width = fill.dataset.width;
          }
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
  }

  _bindEvents() {
    const goHomeBtns = $$('button[id="go-home-btn"]', this.container);
    goHomeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.router.navigate('welcome');
      });
    });

    const retryBtn = $('#retry-btn', this.container);
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.router.navigate('interview');
      });
    }
  }
}
