// Career Path Planner · App entry point
import { HashRouter } from './router.js';
import { StateManager, initialCareerState } from './career-state.js';
import { createCareerAdapter } from './ai-adapter.js';
import { loadCareerHistory } from './utils/storage.js';
import { FormPage } from './pages/form.js';
import { ResultPage } from './pages/result.js';

// Initialize state
const savedHistory = loadCareerHistory();
const state = new StateManager({
  ...initialCareerState,
  history: savedHistory,
});

// Create AI adapter
const aiAdapter = createCareerAdapter('xunfei');

// Create router
const router = new HashRouter({});

// Create page instances
const formPage = new FormPage(state, router);
formPage.setAIAdapter(aiAdapter);
const resultPage = new ResultPage(state, router);

// Register routes
router.routes = {
  form: formPage,
  result: resultPage,
};

// Start
router.start();
