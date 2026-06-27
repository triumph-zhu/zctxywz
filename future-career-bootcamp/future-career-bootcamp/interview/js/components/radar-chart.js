// Radar Chart - Canvas-based visualization with animation and tooltip
export class RadarChart {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dimensions = options.dimensions || [];
    this.values = options.values || [];
    this.targetValues = [...this.values];
    this.maxValue = options.maxValue || 100;
    this.levels = options.levels || 5;
    this.colors = {
      grid: '#e0e0e0',
      gridFill: '#f8f9fa',
      label: '#2c3e50',
      stroke: '#1abc9c',
      point: '#1abc9c',
      pointStroke: '#ffffff',
    };
    this._tooltip = null;
    this._pointPositions = [];
    this._hoverListener = null;
  }

  draw() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const count = this.dimensions.length;

    if (count < 3) return;

    const angleStep = (2 * Math.PI) / count;
    const startAngle = -Math.PI / 2;

    this.ctx.clearRect(0, 0, width, height);

    // Draw grid levels
    for (let level = 1; level <= this.levels; level++) {
      const r = (radius / this.levels) * level;
      this.ctx.beginPath();
      for (let i = 0; i <= count; i++) {
        const angle = i * angleStep + startAngle;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.strokeStyle = this.colors.grid;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      if (level === this.levels) {
        this.ctx.fillStyle = this.colors.gridFill;
        this.ctx.fill();
      }
    }

    // Draw axis lines and labels
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep + startAngle;
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = this.colors.grid;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Label
      const labelDistance = radius + 24;
      const labelX = centerX + labelDistance * Math.cos(angle);
      const labelY = centerY + labelDistance * Math.sin(angle);

      this.ctx.fillStyle = this.colors.label;
      this.ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      if (Math.abs(Math.cos(angle)) > 0.8) {
        this.ctx.textAlign = Math.cos(angle) > 0 ? 'left' : 'right';
      }

      this.ctx.fillText(this.dimensions[i], labelX, labelY);
    }

    // Gradient fill for data area
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, 'rgba(26, 188, 156, 0.35)');
    gradient.addColorStop(0.7, 'rgba(26, 188, 156, 0.2)');
    gradient.addColorStop(1, 'rgba(26, 188, 156, 0.08)');

    // Draw data area with gradient
    this.ctx.beginPath();
    for (let i = 0; i <= count; i++) {
      const idx = i % count;
      const angle = idx * angleStep + startAngle;
      const value = Math.min(this.values[idx] || 0, this.maxValue) / this.maxValue;
      const r = radius * value;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = this.colors.stroke;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw data points
    this._pointPositions = [];
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep + startAngle;
      const value = Math.min(this.values[i] || 0, this.maxValue) / this.maxValue;
      const r = radius * value;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      this._pointPositions.push({ x, y, dimension: this.dimensions[i], value: this.values[i] });

      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.colors.point;
      this.ctx.fill();
      this.ctx.strokeStyle = this.colors.pointStroke;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  drawAnimated(duration = 1200) {
    const startTime = performance.now();
    const targetValues = [...this.targetValues];

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.values = targetValues.map(v => v * eased);
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.values = targetValues;
        this.draw();
        this._setupHover();
      }
    };

    // Start from zero
    this.values = targetValues.map(() => 0);
    requestAnimationFrame(animate);
  }

  _setupHover() {
    if (this._hoverListener) return;

    // Create tooltip DOM
    if (!this._tooltip) {
      this._tooltip = document.createElement('div');
      this._tooltip.className = 'radar-tooltip';
      this.canvas.parentNode.style.position = 'relative';
      this.canvas.parentNode.appendChild(this._tooltip);
    }

    this._hoverListener = (e) => {
      const canvasRect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - canvasRect.left;
      const my = e.clientY - canvasRect.top;

      let found = null;
      for (const pt of this._pointPositions) {
        const dist = Math.sqrt((mx - pt.x) ** 2 + (my - pt.y) ** 2);
        if (dist < 15) {
          found = pt;
          break;
        }
      }

      if (found) {
        this._tooltip.style.display = 'block';
        this._tooltip.style.left = `${found.x}px`;
        this._tooltip.style.top = `${found.y - 40}px`;
        this._tooltip.innerHTML = `<strong>${found.dimension}</strong>: ${found.value}分`;
        this.canvas.style.cursor = 'pointer';
      } else {
        this._tooltip.style.display = 'none';
        this.canvas.style.cursor = 'default';
      }
    };

    this.canvas.addEventListener('mousemove', this._hoverListener);
    this.canvas.addEventListener('mouseleave', () => {
      if (this._tooltip) this._tooltip.style.display = 'none';
    });
  }

  update(dimensions, values) {
    this.dimensions = dimensions;
    this.values = values;
    this.targetValues = [...values];
    this.draw();
  }
}
