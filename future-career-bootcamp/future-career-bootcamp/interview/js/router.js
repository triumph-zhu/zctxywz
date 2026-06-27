// Hash Router
export class HashRouter {
  constructor(routes) {
    this.routes = routes;
    this.currentPage = null;
    this.currentRouteName = '';
    window.addEventListener('hashchange', () => this.resolve());
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  resolve() {
    const hash = window.location.hash.slice(1) || 'welcome';
    if (hash === this.currentRouteName) return;

    const route = this.routes[hash];
    if (!route) {
      this.navigate('welcome');
      return;
    }

    // Destroy current page
    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }

    this.currentRouteName = hash;
    this.currentPage = route;
    route.mount();
  }

  start() {
    this.resolve();
  }
}
