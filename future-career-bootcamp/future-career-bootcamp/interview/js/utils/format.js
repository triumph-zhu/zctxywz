// Format utilities
export function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}分钟`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}小时${rm}分钟` : `${h}小时`;
}

export function getScoreColor(score) {
  if (score >= 90) return 'var(--color-success)';
  if (score >= 80) return 'var(--color-info)';
  if (score >= 70) return 'var(--color-accent)';
  if (score >= 60) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

export function getScoreGrade(score) {
  if (score >= 90) return { grade: '优秀', class: 'excellent', emoji: '🌟' };
  if (score >= 80) return { grade: '良好', class: 'good', emoji: '👍' };
  if (score >= 70) return { grade: '中等', class: 'average', emoji: '💪' };
  if (score >= 60) return { grade: '及格', class: 'pass', emoji: '📝' };
  return { grade: '需提升', class: 'poor', emoji: '📚' };
}

export function getRatingClass(score) {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  return 'poor';
}

export function getDifficultyName(d) {
  return { 1: '初级', 2: '中级', 3: '高级' }[d] || '';
}

export function getTypeName(t) {
  return { hr: 'HR面试', behavioral: '行为面试', scenario: '情景面试', defense: '论文答辩' }[t] || '';
}
