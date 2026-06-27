// Major / Professional field definitions
export const MAJORS = [
  { id: 'accounting', name: '会计学', icon: '📊' },
  { id: 'finance', name: '财务管理', icon: '💰' },
  { id: 'law', name: '法学', icon: '⚖️' },
  { id: 'cs', name: '计算机科学', icon: '💻' },
  { id: 'management', name: '工商管理', icon: '📈' },
  { id: 'marketing', name: '市场营销', icon: '📣' },
  { id: 'academic_research', name: '学术研究', icon: '🔬' },
  { id: 'business_management', name: '商业管理', icon: '📋' },
  { id: 'general', name: '通用', icon: '🎯' },
];

export function getMajorName(id) {
  return MAJORS.find(m => m.id === id)?.name || '通用';
}

export function getMajorIcon(id) {
  return MAJORS.find(m => m.id === id)?.icon || '📋';
}
