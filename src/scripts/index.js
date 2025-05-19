import Router from "./routes/routes.js";
import AuthView from "./views/auth-view.js";
import AuthPresenter from "./presenters/auth-presenter.js";
import DashboardView from "./views/dashboard-view.js";
import DashboardPresenter from "./presenters/dashboard-presenter.js";
import AddStoryView from "./views/add-story-view.js";
import AddStoryModel from "./models/add-story-model.js";
import AddStoryPresenter from "./presenters/add-story-presenter.js";
import SavedStoriesView from "./views/saved-story-view.js";
import SavedStoriesPresenter from "./presenters/saved-story-presenter.js";
import DetailStoryPresenter from "./presenters/detail-story-presenter.js";
import ApiConfig from "./configs/api-config.js";
import Storage from "./utils/storage.js";
import "leaflet/dist/leaflet.css";

const isChromeOrSafari =
  /Chrome|Safari/.test(navigator.userAgent) &&
  !/Edge|Firefox/.test(navigator.userAgent);
if (isChromeOrSafari) {
  console.debug("[App] Running in Chrome/Safari mode");
  if (
    document.startViewTransition &&
    typeof document.startViewTransition === "function"
  ) {
    document.startViewTransition = function (callback) {
      callback();
      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(),
      };
    };
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW terdaftar:", reg))
      .catch((err) => console.error("SW gagal:", err));
  });
}

const app = document.getElementById("app");
const router = new Router();

const authView = new AuthView(app);
const authPresenter = new AuthPresenter(authView, router);

const dashView = new DashboardView(app);
const dashPresenter = new DashboardPresenter(dashView, router);

const addView = new AddStoryView(app);
const addModel = new AddStoryModel(ApiConfig, Storage);
const addPresenter = new AddStoryPresenter(addView, addModel, router);

const savedStoriesView = new SavedStoriesView(app);
const savedStoriesPresenter = new SavedStoriesPresenter(savedStoriesView, Storage, router);

const detailPresenter = new DetailStoryPresenter(app, router);

router.addRoute("/login", (payload) => {
  console.debug("[Router] Login route handler triggered");
  authPresenter.init(payload);
});

router.addRoute("/register", (payload) => {
  console.debug("[Router] Register route handler triggered");
  authPresenter.init(payload);
});

router.addRoute("/dashboard", (payload) => {
  console.debug("[Router] Dashboard route handler triggered");
  dashPresenter.init(payload);
});

router.addRoute("/add", (payload) => {
  console.debug("[Router] Add story route handler triggered");
  addPresenter.init(payload);
});

router.addRoute("/saved", (payload) => {
  console.debug("[Router] Saved stories route handler triggered");
  savedStoriesPresenter.init(payload);
});

router.subscribe((payload) => {
  const route = payload.route || payload.path || "";
  console.debug("[Router Subscribe] Handling route:", route);

  if (!route.startsWith("/add")) {
    addPresenter.destroy();
  }

  if (route === "" || route === "/" || route === undefined) {
    console.debug("[Router] Empty route, redirecting to dashboard");
    window.location.hash = "#/dashboard";
    return;
  }

  if (route.startsWith("/stories/")) {
    console.debug("[Router] Detail story route detected");
    detailPresenter.init(payload);
    return;
  }
});

console.debug("[App] Initializing router");
router.init();
