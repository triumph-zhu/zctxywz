// Timer component
export class Timer {
  constructor(options = {}) {
    this.totalSeconds = options.totalSeconds || 1800;
    this.remaining = this.totalSeconds;
    this.onTick = options.onTick || null;
    this.onWarning = options.onWarning || null;
    this.onExpire = options.onExpire || null;
    this.warningThreshold = options.warningThreshold || 300; // 5 minutes
    this._interval = null;
    this._isRunning = false;
  }

  start() {
    if (this._isRunning) return;
    this._isRunning = true;
    this._interval = setInterval(() => this._tick(), 1000);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    this._isRunning = false;
  }

  reset(seconds) {
    this.stop();
    this.totalSeconds = seconds || this.totalSeconds;
    this.remaining = this.totalSeconds;
  }

  getFormatted() {
    const m = Math.floor(Math.max(0, this.remaining) / 60);
    const s = Math.max(0, this.remaining) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get isRunning() {
    return this._isRunning;
  }

  get isWarning() {
    return this.remaining <= this.warningThreshold && this.remaining > 0;
  }

  get isExpired() {
    return this.remaining <= 0;
  }

  _tick() {
    this.remaining--;
    this.onTick?.(this.remaining, this.getFormatted());

    if (this.isWarning && !this._warned) {
      this._warned = true;
      this.onWarning?.();
    }

    if (this.isExpired) {
      this.stop();
      this.onExpire?.();
    }
  }
}
