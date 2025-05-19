import DetailModel from "../models/detail-story-model.js";
import DetailView from "../views/detail-story-view.js";

export default class DetailPresenter {
  constructor(container, router) {
    this._view = new DetailView(container);
    this._model = new DetailModel();
    this._router = router;
    this._view.bindBack(this._handleBack.bind(this));
    this._view.bindLogout(this._handleLogout.bind(this));
    this._view.bindAddStory(this._handleAddStory.bind(this));

    console.debug(
      '[DetailPresenter] Registering route handler for "/stories/:id"'
    );

    this._router.addRoute("/stories/:id", ({ params }) => {
      console.debug("[DetailPresenter] Route matched with params:", params);
      this.init(params);
    });
  }

  async init(params) {
    console.debug("[DetailPresenter] init called with params:", params);

    const id =
      params?.id ||
      (typeof params === "string" ? params : null) ||
      (Array.isArray(params) ? params[0] : null);

    console.debug("[DetailPresenter] Extracted ID:", id);

    if (!id) {
      console.error("[DetailPresenter] ID tidak ditemukan dalam params");
      this._view.render({
        name: "Error",
        description: "ID cerita tidak ditemukan",
        photoUrl: "",
        createdAt: new Date().toISOString(),
        lat: null,
        lon: null,
      });
      return;
    }

    try {
      console.debug(
        "[DetailPresenter] Memanggil getStoryDetail dengan ID:",
        id
      );
      const story = await this._model.getStoryDetail(id);
      console.debug("[DetailPresenter] Story berhasil dimuat:", story);
      this._view.render(story);
    } catch (error) {
      console.error("[DetailPresenter] Error loading story:", error);
      this._view.render({
        name: "Not Found",
        description: error.message,
        photoUrl: "",
        createdAt: new Date().toISOString(),
        lat: null,
        lon: null,
      });
    }
  }

  _handleBack() {
    window.location.hash = "#/dashboard";
  }

  _handleLogout() {
    window.location.hash = "#/login";
  }

  _handleAddStory() {
    window.location.hash = "#/add";
  }
}
