// src/presenters/saved-story-presenter.js
import { indexedDBUtil } from "../configs/database";
import Swal from "sweetalert2";

export default class SavedStoriesPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
  }

  init({ route }) {
    if (route !== "/saved") return;

    this.view.startViewTransition(() => {
      this.view._initTemplate();
      this.view._captureElements();
      this._bindEvents();
      this._loadSavedStories();
    });
  }

  _bindEvents() {
    this.view.bindLogout(() => (window.location.hash = "#/login"));
    this.view.bindBack(() => (window.location.hash = "#/dashboard"));
    this.view.bindRemove((id) => this._removeStory(id));
  }

  async _loadSavedStories() {
    try {
      const stories = await indexedDBUtil.getAllStories();
      this.view.renderSavedStories(stories);
    } catch (err) {
      console.error(err);
      this.view.renderSavedStories([]);
    }
  }

  async _removeStory(id) {
    try {
      await indexedDBUtil.deleteStory(id);
      Swal.fire("Terhapus", "Cerita berhasil dihapus.", "success");
      this._loadSavedStories();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus cerita.", "error");
    }
  }
}
