// App entry point - initialization and routing
import { HashRouter } from './router.js';
import { StateManager, initialState } from './state.js';
import { loadHistory } from './utils/storage.js';
import { WelcomePage } from './pages/welcome.js';
import { InterviewPage } from './pages/interview.js';
import { ReportPage } from './pages/report.js';

// Initialize state with history from localStorage
const savedHistory = loadHistory();
const state = new StateManager({
  ...initialState,
  history: savedHistory,
});

// Create router first
const router = new HashRouter({});

// Create page instances with router reference
const welcomePage = new WelcomePage(state, router);
const interviewPage = new InterviewPage(state, router);
const reportPage = new ReportPage(state, router);

// Register routes
router.routes = {
  welcome: welcomePage,
  interview: interviewPage,
  report: reportPage,
};

// Start the app
router.start();
