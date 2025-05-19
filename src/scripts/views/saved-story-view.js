// src/views/saved-story-view.js
import Swal from "sweetalert2";

export default class SavedStoriesView {
  constructor(root) {
    this._root = root;
    this._onLogout = null;
    this._onBack = null;
    this._onRemove = null;
    this._initTemplate();
    this._captureElements();
    this._updateActiveMenu(); // Set active menu saat pertama kali load
    window.addEventListener("hashchange", this._updateActiveMenu.bind(this)); // Update saat hash berubah
  }

  _initTemplate() {
    this._root.innerHTML = `
      <div class="app-container">
        <aside class="sidebar" id="sidebar" aria-label="Sidebar Navigation">
          <div class="sidebar-logo">
            <h1 class="text-xl font-bold">Story App</h1>
          </div>
          <nav class="sidebar-menu" role="navigation">
            <ul>
              <li><a href="#/" id="menu-dashboard" class="menu-item"><i class="fas fa-chart-pie"></i><span>Dashboard</span></a></li>
              <li><a href="#/add" id="btn-add-story" class="menu-item"><i class="fas fa-pen"></i><span>Tambah Story</span></a></li>
              <li><a href="#/saved" id="btn-save-stories" class="menu-item"><i class="fas fa-save"></i><span>Simpan</span></a></li>
              <li><button id="btn-logout" class="menu-item"><i class="fas fa-sign-out-alt"></i><span>Logout</span></button></li>
            </ul>
          </nav>
          <footer class="sidebar-footer text-sm text-secondary">Muhammad Izza &copy; ${new Date().getFullYear()} Story App</footer>
        </aside>
        <main class="main-content">
          <header class="navbar p-md shadow">
            <button id="sidebar-toggle">☰</button>
            <div class="text-lg font-semibold">Saved Stories</div>
            <button id="btn-back" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Dashboard</button>
          </header>
          <section class="content-container p-lg overflow-auto">
            <h2 class="section-title">Your Saved Stories</h2>
            <div id="saved-stories-container" class="stories-grid">
              <div class="empty-state"><p>No saved stories found.</p></div>
            </div>
          </section>
        </main>
      </div>
    `;
  }

  _captureElements() {
    this.container = this._root.querySelector("#saved-stories-container");

    this._root.querySelector("#btn-back").addEventListener("click", () => {
      this._onBack && this._onBack();
    });

    this._root.querySelector("#btn-logout").addEventListener("click", () => {
      Swal.fire({
        title: "Logout",
        text: "Yakin keluar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
      }).then((res) => {
        if (res.isConfirmed && this._onLogout) this._onLogout();
      });
    });
  }

  _updateActiveMenu() {
  const currentHash = window.location.hash || "#/";
  const menuItems = this._root.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    const href = item.getAttribute("href");
    if (href && currentHash === href) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}


  bindLogout(fn) {
    this._onLogout = fn;
  }

  bindBack(fn) {
    this._onBack = fn;
  }

  bindRemove(fn) {
    this._onRemove = fn;
  }

  renderSavedStories(stories) {
    if (!stories.length) {
      this.container.innerHTML = `<div class="empty-state"><p>No saved stories found.</p></div>`;
      return;
    }

    this.container.innerHTML = stories
      .map(
        (s) => `
      <div class="story-card shadow" data-id="${s.id}">
        <img src="${s.photoUrl}" alt="${s.name}" class="story-image"/>
        <h3 class="story-title">${s.name}</h3>
        <p class="story-desc">${s.description}</p>
        <div class="story-meta">
          <span class="story-date">${new Date(
            s.createdAt
          ).toLocaleDateString()}</span>
        </div>
        <div class="story-actions">
          <a href="#/stories/${s.id}" class="btn btn-primary">Lihat Detail</a>
          <button class="btn btn-danger btn-remove" data-id="${
            s.id
          }">Hapus</button>
        </div>
      </div>
    `
      )
      .join("");

    this.container.querySelectorAll(".btn-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        if (this._onRemove) this._onRemove(id);
      });
    });
  }

  startViewTransition(cb) {
    document.startViewTransition ? document.startViewTransition(cb) : cb();
  }
}
