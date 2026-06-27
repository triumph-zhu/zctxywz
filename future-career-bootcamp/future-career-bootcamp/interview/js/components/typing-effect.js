// Typing effect component
export class TypingEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.speed = options.speed || 40;
    this.startDelay = options.startDelay || 0;
    this.onComplete = options.onComplete || null;
    this.onChar = options.onChar || null;
    this._isRunning = false;
    this._aborted = false;
  }

  async type(text) {
    this._isRunning = true;
    this._aborted = false;

    if (this.startDelay) {
      await this._delay(this.startDelay);
    }

    this.element.textContent = '';

    for (let i = 0; i < text.length; i++) {
      if (this._aborted) break;

      this.element.textContent += text[i];
      this.onChar?.(text[i], i, text);

      // Pause after punctuation + random jitter
      const char = text[i];
      const basePause = /[。！？；]/.test(char) ? 300
                  : /[，、：、—]/.test(char) ? 150
                  : /[.!?;]/.test(char) ? 200
                  : /[,;:—]/.test(char) ? 100
                  : this.speed;

      // Add ±30% random jitter for natural feel
      const jitter = basePause * 0.3 * (Math.random() * 2 - 1);
      const pause = Math.max(10, basePause + jitter);

      await this._delay(pause);
    }

    this._isRunning = false;
    this.onComplete?.();
  }

  stop() {
    this._aborted = true;
    this._isRunning = false;
  }

  get isRunning() {
    return this._isRunning;
  }

  _delay(ms) {
    return new Promise(resolve => {
      if (this._aborted) { resolve(); return; }
      const timer = setTimeout(resolve, ms);
      // Check abort periodically
      const check = setInterval(() => {
        if (this._aborted) {
          clearTimeout(timer);
          clearInterval(check);
          resolve();
        }
      }, 50);
      setTimeout(() => clearInterval(check), ms + 100);
    });
  }
}

// Quick function to type text into an element
export function typeText(element, text, options = {}) {
  const typer = new TypingEffect(element, options);
  typer.type(text);
  return typer;
}
