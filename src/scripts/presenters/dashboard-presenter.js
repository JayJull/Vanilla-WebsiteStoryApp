// src/presenters/dashboard-presenter.js
import DashboardModel from "../models/dashboard-model.js";
import { getToken, removeToken, getUser } from "../utils/storage.js";
import { indexedDBUtil } from "../configs/database";
import Swal from "sweetalert2";

export default class DashboardPresenter {
  constructor(view, router) {
    this.view = view;
    this.router = router;
    this.model = new DashboardModel();
    this.stories = [];
  }

  async init({ route }) {
    if (route !== "/dashboard") return;

    const token = getToken();
    if (!token) {
      location.hash = "#/login";
      return;
    }

    this.view.bindAddStory(() => (location.hash = "#/add"));
    this.view.bindLogout(this.doLogout.bind(this));
    this.view.bindSaveStories(() => (location.hash = "#/saved"));
    this.view.bindSaveStory(this.handleSaveStory.bind(this));

    // load user & stories
    const user = getUser() || {};
    const res = await this.model.getStories(token);
    if (res.error) {
      this.view.showError(res.message);
      this.stories = [];
    } else {
      this.stories = res.listStory;
    }

    this.view.render(this.stories, user);
  }

  async handleSaveStory(id) {
    const story = this.stories.find((s) => s.id === id);
    if (!story) {
      return Swal.fire("Error", "Cerita tidak ditemukan", "error");
    }

    try {
      await indexedDBUtil.saveStory(story);
      Swal.fire("Tersimpan", "Cerita berhasil disimpan.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Gagal", "Cerita gagal disimpan.", "error");
    }
  }

  doLogout() {
    removeToken();
    location.hash = "#/login";
  }
}
