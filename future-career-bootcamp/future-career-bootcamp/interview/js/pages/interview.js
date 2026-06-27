// Interview scene page logic
import { $, clearElement, createElement, addClass, removeClass, initRipple } from '../utils/dom.js';
import { formatTime, getTypeName, getDifficultyName } from '../utils/format.js';
import { InterviewEngine, InterviewState } from '../interview-engine/engine.js';
import { createInterviewerSVG, setAvatarExpression, selectInterviewerProfile, INTERVIEWER_PROFILES } from '../components/avatar.js';
import { TypingEffect, typeText } from '../components/typing-effect.js';
import { Timer } from '../components/timer.js';
import { addHistoryEntry } from '../utils/storage.js';

export class InterviewPage {
  constructor(state, router) {
    this.state = state;
    this.router = router;
    this.container = null;
    this.engine = null;
    this.timer = null;
    this.currentTyping = null;
    this.questionStartTime = null;
    this._destroyed = false;
    this._interviewEnded = false;
    this._resultSaved = false;
    this.interviewerProfile = null;
  }

  mount() {
    this.container = document.getElementById('page-interview');
    this.container.classList.add('active');
    this._destroyed = false;
    this._interviewEnded = false;
    this._resultSaved = false;

    const s = this.state.getState();
    this.engine = new InterviewEngine(s.config);

    // Select interviewer
    const profileId = selectInterviewerProfile(s.config.type);
    this.interviewerProfile = INTERVIEWER_PROFILES[profileId];

    this._render();
    this._bindEvents();
    this._startInterview();
    initRipple(this.container);
  }

  destroy() {
    this._destroyed = true;
    if (this.timer) this.timer.stop();
    if (this.currentTyping) this.currentTyping.stop();
    if (this.container) this.container.classList.remove('active');
  }

  _render() {
    const s = this.state.getState();
    const totalSeconds = s.config.duration * 60;
    const circumference = 2 * Math.PI * 15; // r=15

    this.container.innerHTML = `
      <div class="interview-page">
        <!-- Top bar - 紧凑布局 -->
        <div class="interview-topbar">
          <div class="interview-topbar-left">
            <button class="interview-back-btn" id="back-btn" title="退出面试">✕</button>
            <span class="interview-type-badge">${getTypeName(s.config.type)} · ${getDifficultyName(s.config.difficulty)}</span>
          </div>
          <div class="interview-topbar-center">
            <div class="timer" id="timer">
              <svg class="timer-ring" viewBox="0 0 36 36" width="32" height="32">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-divider)" stroke-width="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-accent)" stroke-width="3"
                  stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}"
                  stroke-dashoffset="0" transform="rotate(-90 18 18)" id="timer-ring-progress"
                  style="transition: stroke-dashoffset 1s linear, stroke 0.3s ease;"/>
              </svg>
              <span id="timer-text">${formatTime(totalSeconds)}</span>
            </div>
            <div class="progress-info">
              <span id="progress-text">0/0</span>
            </div>
          </div>
          <div class="interview-topbar-right">
            <button class="btn btn-ghost btn-end-interview" id="end-btn" title="提前结束面试">⏹ 结束</button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="interview-progress-bar">
          <div class="interview-progress-fill" id="progress-fill" style="width:0%"></div>
        </div>

        <!-- Office scene - 精简版 -->
        <div class="office-scene">
          <!-- Window -->
          <div class="office-window">
            <div class="office-window-cross-h"></div>
            <div class="office-window-cross-v"></div>
            <div class="office-window-blind" style="top:8px;"></div>
            <div class="office-window-blind" style="top:20px;"></div>
            <div class="office-window-blind" style="top:32px;"></div>
            <div class="office-window-blind" style="top:44px;"></div>
            <div class="office-window-blind" style="top:56px;"></div>
            <div class="office-window-blind" style="top:68px;"></div>
            <div class="office-window-blind" style="top:80px;"></div>
          </div>
          <div class="office-sunlight"></div>

          <!-- Bookshelf -->
          <div class="office-bookshelf">
            <div class="office-bookshelf-shelf office-bookshelf-shelf--top"></div>
            <div class="office-bookshelf-shelf office-bookshelf-shelf--mid"></div>
            <div class="office-bookshelf-shelf office-bookshelf-shelf--bot"></div>
            <div class="office-bookshelf-side office-bookshelf-side--left"></div>
            <div class="office-bookshelf-side office-bookshelf-side--right"></div>
            <div style="position:absolute;top:4px;left:3px;display:flex;gap:2px;align-items:flex-end;">
              <div class="office-book" style="width:7px;height:22px;background:#c0392b;"></div>
              <div class="office-book" style="width:6px;height:18px;background:#2980b9;"></div>
              <div class="office-book" style="width:8px;height:20px;background:#27ae60;"></div>
            </div>
            <div style="position:absolute;top:54%;left:3px;display:flex;gap:2px;align-items:flex-end;">
              <div class="office-book" style="width:8px;height:24px;background:#2c3e50;"></div>
              <div class="office-book" style="width:6px;height:20px;background:#e74c3c;"></div>
            </div>
          </div>

          <!-- Interviewer -->
          <div class="interviewer-in-office" id="avatar-container">
            ${createInterviewerSVG(this.interviewerProfile.id)}
          </div>
        </div>

        <!-- Chat area -->
        <div class="interview-chat">
          <div class="chat-area" id="chat-area"></div>
          <div class="chat-hint" id="chat-hint"></div>
          <div class="chat-input-area">
            <textarea class="chat-input" id="chat-input" placeholder="输入你的回答..." rows="1"></textarea>
            <button class="btn btn-primary" id="send-btn">发送</button>
          </div>
        </div>
      </div>
    `;
  }

  _bindEvents() {
    const sendBtn = $('#send-btn', this.container);
    const input = $('#chat-input', this.container);
    const backBtn = $('#back-btn', this.container);

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text || this.engine.state !== InterviewState.WAITING) return;
      input.value = '';
      input.style.height = 'auto';
      this._processUserResponse(text);
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    backBtn.addEventListener('click', () => {
      this._showEndConfirmModal('确定要退出面试吗？已完成的题目将被记录。').then(confirmed => {
        if (confirmed) this._endInterview();
      });
    });

    // End interview button
    const endBtn = $('#end-btn', this.container);
    if (endBtn) {
      endBtn.addEventListener('click', () => {
        this._showEndConfirmModal('确定提前结束面试？已完成的题目将被记录。').then(confirmed => {
          if (confirmed) this._endInterview();
        });
      });
    }
  }

  async _startInterview() {
    const s = this.state.getState();
    const totalSeconds = s.config.duration * 60;
    const circumference = 2 * Math.PI * 15;

    // Show countdown first
    await this._showCountdown();

    // Initialize timer
    this.timer = new Timer({
      totalSeconds,
      onTick: (remaining, formatted) => {
        const timerText = $('#timer-text', this.container);
        if (timerText) timerText.textContent = formatted;

        const ringProgress = $('#timer-ring-progress', this.container);
        if (ringProgress) {
          const offset = circumference * (1 - remaining / totalSeconds);
          ringProgress.style.strokeDashoffset = offset;
        }

        const timerEl = $('#timer', this.container);
        if (timerEl) {
          if (remaining <= 300) {
            addClass(timerEl, 'timer--warning');
            if (ringProgress) ringProgress.style.stroke = 'var(--color-danger)';
          } else {
            removeClass(timerEl, 'timer--warning');
            if (ringProgress) ringProgress.style.stroke = 'var(--color-accent)';
          }
        }
      },
      onExpire: () => {
        this._addSystemMessage('⏰ 面试时间到！');
        this._endInterview();
      },
    });

    // Listen to engine events
    this.engine.onDialogue((entry) => {
      if (this._destroyed) return;
      this._handleDialogueEntry(entry);
    });

    this.engine.onStateChange((newState, prevState) => {
      if (this._destroyed) return;
      this._handleStateChange(newState, prevState);
    });

    // Start
    this.timer.start();
    await this.engine.start();
  }

  _showCountdown() {
    return new Promise((resolve) => {
      const page = this.container.querySelector('.interview-page');
      if (!page) { resolve(); return; }

      const overlay = createElement('div', {
        className: 'countdown-overlay',
        html: `
          <div class="countdown-content">
            <div class="countdown-label">面试即将开始</div>
            <div class="countdown-number" id="countdown-num">3</div>
            <div class="countdown-sublabel">请做好准备</div>
          </div>
        `,
      });
      page.appendChild(overlay);

      let count = 3;
      const numEl = overlay.querySelector('#countdown-num');

      const tick = () => {
        if (count <= 0) {
          overlay.classList.add('countdown-fade-out');
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 500);
          return;
        }
        numEl.textContent = count;
        numEl.classList.remove('countdown-pop');
        void numEl.offsetWidth; // force reflow
        numEl.classList.add('countdown-pop');
        count--;
        setTimeout(tick, 1000);
      };
      tick();
    });
  }

  _handleDialogueEntry(entry) {
    const chatArea = $('#chat-area', this.container);
    if (!chatArea) return;

    if (entry.role === 'interviewer') {
      // Nod first, then speak
      setAvatarExpression($('#avatar-container', this.container), 'nodding');
      setTimeout(() => {
        setAvatarExpression($('#avatar-container', this.container), 'speaking');
      }, 600);
      this._addInterviewerBubble(entry.text, entry.type);
    } else if (entry.role === 'candidate') {
      setAvatarExpression($('#avatar-container', this.container), 'smiling');
      this._addCandidateBubble(entry.text);
    }

    this._updateProgress();
  }

  _handleStateChange(newState, prevState) {
    const input = $('#chat-input', this.container);
    const sendBtn = $('#send-btn', this.container);
    const hint = $('#chat-hint', this.container);

    switch (newState) {
      case InterviewState.WAITING:
        if (input) { input.disabled = false; input.focus(); }
        if (sendBtn) sendBtn.disabled = false;
        if (hint) {
          const question = this.engine.getCurrentQuestion();
          hint.textContent = question?.tips ? `💡 提示：${question.tips}` : '';
        }
        this.questionStartTime = Date.now();

        // Transition flash
        if (prevState === InterviewState.ANALYZING) {
          const flash = createElement('div', { className: 'interview-transition-flash' });
          const page = this.container.querySelector('.interview-page');
          if (page) {
            page.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
          }
        }
        break;

      case InterviewState.ANALYZING:
        if (input) input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (hint) hint.textContent = '';
        setAvatarExpression($('#avatar-container', this.container), 'thinking');
        this._showThinking();
        break;

      case InterviewState.COMPLETED:
        if (input) input.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (hint) hint.textContent = '';
        this._endInterview();
        break;
    }
  }

  async _processUserResponse(text) {
    this._hideThinking();
    const result = await this.engine.processResponse(text);
    this._hideThinking();

    if (result && result.completed) {
      this._saveResult(result);
    }
  }

  _addInterviewerBubble(text, type = 'message') {
    const chatArea = $('#chat-area', this.container);
    if (!chatArea) return;

    this._hideThinking();

    const bubble = createElement('div', {
      className: 'chat-bubble chat-bubble--interviewer',
    });

    // Avatar thumbnail
    const p = this.interviewerProfile;
    const avatarThumb = createElement('div', {
      className: 'chat-avatar-thumb',
      html: `<svg viewBox="0 0 40 40" width="32" height="32">
        <circle cx="20" cy="20" r="18" fill="${p.skinColor}"/>
        <circle cx="14" cy="17" r="2" fill="${p.hairColor}"/>
        <circle cx="26" cy="17" r="2" fill="${p.hairColor}"/>
        <path d="M14,24 Q20,28 26,24" stroke="#c0392b" stroke-width="1.5" fill="none"/>
        <path d="M8,12 Q20,4 32,12 Q32,6 20,4 Q8,6 8,12 Z" fill="${p.hairColor}"/>
      </svg>`,
    });

    const textWrap = createElement('div', { className: 'chat-bubble-text-wrap' });
    const sender = createElement('div', {
      className: 'chat-sender',
      text: `${p.name} · ${p.title}`,
    });
    const content = createElement('div', { className: 'chat-bubble-content' });

    textWrap.appendChild(sender);
    textWrap.appendChild(content);
    bubble.appendChild(avatarThumb);
    bubble.appendChild(textWrap);
    chatArea.appendChild(bubble);

    // Typing effect
    if (this.currentTyping) this.currentTyping.stop();
    this.currentTyping = new TypingEffect(content, {
      speed: 40,
      onComplete: () => {
        setAvatarExpression($('#avatar-container', this.container), 'smiling');
      },
    });
    this.currentTyping.type(text);

    this._scrollToBottom();
  }

  _addCandidateBubble(text) {
    const chatArea = $('#chat-area', this.container);
    if (!chatArea) return;

    const bubble = createElement('div', {
      className: 'chat-bubble chat-bubble--candidate',
    });

    const sender = createElement('div', { className: 'chat-sender', text: '🙋 我' });
    const content = createElement('div', { className: 'chat-bubble-content', text });

    bubble.appendChild(sender);
    bubble.appendChild(content);
    chatArea.appendChild(bubble);

    this._scrollToBottom();
  }

  _addSystemMessage(text) {
    const chatArea = $('#chat-area', this.container);
    if (!chatArea) return;

    const bubble = createElement('div', {
      className: 'chat-bubble chat-bubble--system',
      text,
    });
    chatArea.appendChild(bubble);
    this._scrollToBottom();
  }

  _showThinking() {
    const chatArea = $('#chat-area', this.container);
    if (!chatArea) return;

    this._hideThinking();

    const thinking = createElement('div', {
      className: 'thinking-indicator',
      id: 'thinking-indicator',
      html: `
        <div class="thinking-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="text-xs text-secondary">面试官正在思考...</span>
      `,
    });
    chatArea.appendChild(thinking);
    this._scrollToBottom();
  }

  _hideThinking() {
    const existing = document.getElementById('thinking-indicator');
    if (existing) existing.remove();
  }

  _updateProgress() {
    const progress = this.engine.getProgress();
    const progressText = $('#progress-text', this.container);
    const progressFill = $('#progress-fill', this.container);

    if (progressText) progressText.textContent = `${progress.current}/${progress.total}`;
    if (progressFill) progressFill.style.width = `${progress.percent}%`;
  }

  _scrollToBottom() {
    const chatArea = $('#chat-area', this.container);
    if (chatArea) {
      requestAnimationFrame(() => {
        chatArea.scrollTop = chatArea.scrollHeight;
      });
    }
  }

  async _endInterview() {
    if (this._interviewEnded) return;
    this._interviewEnded = true;

    if (this.timer) this.timer.stop();

    if (this.engine.state !== InterviewState.COMPLETED) {
      const result = await this.engine.endInterview();
      this._saveResult(result);
    }
  }

  _saveResult(result) {
    if (!result || !result.completed) return;
    if (this._resultSaved) return;
    this._resultSaved = true;

    const s = this.state.getState();
    const isEarlyEnd = this.engine.currentIndex < this.engine.questions.length - 1;
    const report = {
      ...result,
      config: s.config,
      completedAt: new Date().toISOString(),
      actualDuration: s.config.duration * 60 - (this.timer?.remaining || 0),
      isEarlyEnd,
    };

    this.state.setState({ result: report });

    addHistoryEntry({
      config: s.config,
      overallScore: result.overallScore,
      grade: result.grade,
      completedAt: report.completedAt,
      dimensionScores: result.dimensionScores,
      questionResults: result.questionResults,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      isEarlyEnd,
    });

    // Show end screen then navigate
    this._showEndScreen().then(() => {
      if (!this._destroyed) {
        this.router.navigate('report');
      }
    });
  }

  _showEndScreen() {
    return new Promise((resolve) => {
      const page = this.container.querySelector('.interview-page');
      if (!page) { resolve(); return; }

      const overlay = createElement('div', {
        className: 'interview-end-overlay',
        html: `
          <div class="interview-end-content">
            <div class="interview-end-icon">
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--color-accent)" stroke-width="3"
                  stroke-dasharray="226" stroke-dashoffset="226" class="end-circle-anim"/>
                <path d="M24,42 L34,52 L56,30" fill="none" stroke="var(--color-accent)" stroke-width="4"
                  stroke-linecap="round" stroke-linejoin="round" class="end-check-anim"/>
              </svg>
            </div>
            <div class="interview-end-text">面试结束</div>
            <div class="interview-end-sub">正在生成面试报告...</div>
          </div>
        `,
      });
      page.appendChild(overlay);

      setTimeout(resolve, 2500);
    });
  }

  _showEndConfirmModal(message) {
    return new Promise((resolve) => {
      const page = this.container.querySelector('.interview-page');
      if (!page) { resolve(false); return; }

      const overlay = createElement('div', {
        className: 'modal-overlay',
        html: `
          <div class="modal">
            <div class="modal-title">提示</div>
            <div class="modal-body">${message}</div>
            <div class="modal-actions">
              <button class="btn btn-secondary" id="modal-cancel">取消</button>
              <button class="btn btn-primary" id="modal-confirm" style="background:var(--color-danger);">确定结束</button>
            </div>
          </div>
        `,
      });
      page.appendChild(overlay);

      overlay.querySelector('#modal-cancel').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
      overlay.querySelector('#modal-confirm').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
    });
  }
}
