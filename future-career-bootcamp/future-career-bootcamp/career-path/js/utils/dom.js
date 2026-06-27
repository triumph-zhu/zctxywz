// DOM utility functions
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = val;
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(val)) {
        el.dataset[dk] = dv;
      }
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key === 'html') {
      el.innerHTML = val;
    } else if (key === 'text') {
      el.textContent = val;
    } else {
      el.setAttribute(key, val);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  }
  return el;
}

export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function show(el) {
  el.classList.remove('hidden');
}

export function hide(el) {
  el.classList.add('hidden');
}

export function addClass(el, ...classes) {
  el.classList.add(...classes);
}

export function removeClass(el, ...classes) {
  el.classList.remove(...classes);
}

export function toggleClass(el, className, force) {
  el.classList.toggle(className, force);
}

// Ripple effect for buttons
export function initRipple(root = document) {
  $$('.btn', root).forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}
