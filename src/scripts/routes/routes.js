import { parseUrl } from "../utils/url-parser.js";

export default class Router {
  constructor() {
    this.routes = [];
    this._callback = null;
    window.addEventListener("hashchange", () => this.onHashChange());
  }

  init() {
    if (!location.hash) {
      this.navigate("/login");
    } else {
      this.onHashChange();
    }
  }

  // Tambahkan method navigate untuk konsistensi
  navigate(path) {
    console.debug("[Router] Navigating to:", path);
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    location.hash = "#" + path;
  }

  onHashChange() {
    const rawHash = location.hash;
    const { path, params: urlParams } = parseUrl(rawHash);
    console.debug("[Router] Hash changed to:", path);
    console.debug("[Router] URL params:", urlParams);

    let matchFound = false;

    for (const route of this.routes) {
      const { pattern, paramNames, handler } = route;
      const pathSegments = path.split("/");
      const patternSegments = pattern.split("/");

      if (paramNames.length > 0) {
        if (pathSegments.length !== patternSegments.length) continue;

        let isMatch = true;
        const extractedParams = { ...urlParams };

        for (let i = 0; i < patternSegments.length; i++) {
          const pSeg = patternSegments[i];
          const tSeg = pathSegments[i];
          if (pSeg.startsWith(":")) {
            extractedParams[pSeg.slice(1)] = tSeg;
          } else if (pSeg !== tSeg) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          console.debug("[Router] Dynamic route matched:", pattern);
          handler({ route: path, params: extractedParams });
          matchFound = true;
          break;
        }
      } else if (pattern === path) {
        console.debug("[Router] Static route matched:", pattern);
        handler({ route: path, params: urlParams });
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      console.warn("[Router] No route matched, passing to subscriber:", path);
      window.location.href = "/404.html";
    }
  }

  subscribe(cb) {
    this._callback = cb;
  }

  addRoute(pattern, handler) {
    console.debug("[Router] Adding route:", pattern);
    const paramNames = pattern
      .split("/")
      .filter((seg) => seg.startsWith(":"))
      .map((seg) => seg.slice(1));

    this.routes.push({ pattern, paramNames, handler });
  }
}
