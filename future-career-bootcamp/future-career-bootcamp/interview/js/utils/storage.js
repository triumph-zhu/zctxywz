// localStorage persistence
const STORAGE_KEY = 'interview_simulator';

export function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save history:', e);
  }
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to load history:', e);
    return [];
  }
}

export function addHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry);
  // Keep only last 20 entries
  if (history.length > 20) history.length = 20;
  saveHistory(history);
  return history;
}

export function clearHistory() {
  saveHistory([]);
}
