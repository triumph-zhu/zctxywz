// Career Path LocalStorage Persistence
const STORAGE_KEY = 'career_path_planner';

export function saveCareerResult(result) {
  const history = loadCareerHistory();
  history.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString('zh-CN'),
    careerPath: result.careerPath,
    basicInfo: result.basicInfo || {},
  });
  // Keep last 10
  if (history.length > 10) history.length = 10;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save career result:', e);
  }
}

export function loadCareerHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function clearCareerHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveDraftForm(formData) {
  try {
    localStorage.setItem(STORAGE_KEY + '_draft', JSON.stringify(formData));
  } catch (e) { /* ignore */ }
}

export function loadDraftForm() {
  try {
    const data = localStorage.getItem(STORAGE_KEY + '_draft');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function clearDraftForm() {
  localStorage.removeItem(STORAGE_KEY + '_draft');
}
