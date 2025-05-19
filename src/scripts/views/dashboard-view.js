import Swal from "sweetalert2";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderStoryCard } from "../components/story-card.js";

export default class DashboardView {
  constructor(container) {
    this.app = container;
    this.map = null;
    this._onLogout = null;
    this._onAddStory = null;
    this._onSaveStories = null;
    this._onSaveStory = null; // handler untuk tombol per-card
    this._sidebarVisible = true;
    this._updateActiveMenu();

    // Update active sidebar menu sesuai hash saat pertama render dan saat hash berubah
    window.addEventListener("hashchange", this._updateActiveMenu.bind(this));
  }

  render(stories, user = {}) {
    const userName = user.name || "User";
    const userPhoto = user.photoUrl || "/api/placeholder/36/36";

    const layoutTemplate = `
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

        <main class="main-content" id="main-content">
          <header class="navbar" role="banner">
            <button class="navbar-toggle" id="sidebar-toggle" aria-label="Toggle Sidebar">☰</button>
            <div class="navbar-actions">
              <div class="navbar-user">
                <img src="${userPhoto}" alt="Foto profil ${userName}" />
                <span>${userName}</span>
              </div>
            </div>
          </header>

          <section class="content-container">
            <h2 class="section-title" tabindex="-1">Dashboard</h2>

            <section aria-labelledby="stories-section" class="mb-xl">
              <h3 id="stories-section" class="text-lg font-medium mb-sm">Stories</h3>
              <div id="stories-container">
                ${this._renderStoriesList(stories)}
              </div>
            </section>

            <section aria-labelledby="map-section">
              <h3 id="map-section" class="text-lg font-medium mb-sm">Story Map</h3>
              <div id="map" role="region" aria-label="Peta lokasi cerita"></div>
            </section>
          </section>
        </main>
      </div>
    `;

    if (document.startViewTransition) {
      document.startViewTransition(() => (this.app.innerHTML = layoutTemplate));
    } else {
      this.app.innerHTML = layoutTemplate;
    }

    this._bindEvents();
    this._initMap(stories.filter((s) => s.lat != null && s.lon != null));
    this._updateActiveMenu();
  }

  _renderStoriesList(stories) {
    if (!stories.length) {
      return `
        <div class="empty-state text-center py-lg">
          <p class="mb-sm">Tidak ada story. Buat story pertamamu!</p>
          <button id="btn-add-story-empty" class="btn btn-primary"><i class="fas fa-plus"></i> Buat Story</button>
        </div>
      `;
    }

    return `<div class="story-list">${stories
      .map((s) =>
        renderStoryCard({
          id: s.id,
          name: s.name,
          description: s.description,
          photoUrl: s.photoUrl,
          createdAt: s.createdAt,
          lat: Number(s.lat),
          lon: Number(s.lon),
        })
      )
      .join("")}</div>`;
  }

  _bindEvents() {
    // Toggle sidebar
    this.app.querySelector("#sidebar-toggle").addEventListener("click", () => {
      const sidebar = this.app.querySelector("#sidebar");
      sidebar.classList.toggle("show");
      this._sidebarVisible = !this._sidebarVisible;
    });

    // Add story (button sidebar dan empty state)
    this.app
      .querySelectorAll("#btn-add-story, #btn-add-story-empty")
      .forEach((btn) =>
        btn.addEventListener(
          "click",
          () => this._onAddStory && this._onAddStory()
        )
      );

    // Navigate to saved stories
    this.app
      .querySelector("#btn-save-stories")
      .addEventListener(
        "click",
        () => this._onSaveStories && this._onSaveStories()
      );

    // Per-card "Simpan"
    this.app
      .querySelector("#stories-container")
      .addEventListener("click", (e) => {
        if (e.target.matches(".btn-save-story")) {
          const id = e.target.dataset.id;
          this._onSaveStory && this._onSaveStory(id);
        }
      });

    // Logout confirmation
    this.app.querySelector("#btn-logout").addEventListener("click", () => {
      Swal.fire({
        title: "Logout",
        text: "Apakah Anda yakin ingin logout?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, keluar",
        cancelButtonText: "Batal",
        confirmButtonColor: "var(--accent)",
      }).then((result) => {
        if (result.isConfirmed) this._onLogout && this._onLogout();
      });
    });
  }

  _initMap(stories) {
    const mapEl = this.app.querySelector("#map");
    if (!stories.length) {
      mapEl.innerHTML = `<p class="empty-map p-md">Data lokasi tidak tersedia.</p>`;
      return;
    }
    mapEl.style.height = "400px";
    this.map?.remove();
    this.map = L.map(mapEl).setView([stories[0].lat, stories[0].lon], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);
    setTimeout(() => this.map.invalidateSize(), 0);

    stories.forEach((s) => {
      L.marker([s.lat, s.lon])
        .addTo(this.map)
        .bindPopup(
          `<strong>${s.name}</strong><p>${s.description.slice(0, 100)}${
            s.description.length > 100 ? "..." : ""
          }</p><a href="#/stories/${s.id}">Detail</a>`
        );
    });
  }

  bindLogout(fn) {
    this._onLogout = fn;
  }
  bindAddStory(fn) {
    this._onAddStory = fn;
  }
  bindSaveStories(fn) {
    this._onSaveStories = fn;
  }
  bindSaveStory(fn) {
    this._onSaveStory = fn;
  }

  _updateActiveMenu() {
    const currentHash = window.location.hash || "#/";
    const menuItems = this.app.querySelectorAll(".menu-item");

    menuItems.forEach((item) => {
      const href = item.getAttribute("href");

      // Khusus untuk menu Dashboard, aktifkan jika hash adalah "#/" atau "#/dashboard"
      if (
        href === "#/" &&
        (currentHash === "#/" || currentHash === "#/dashboard")
      ) {
        item.classList.add("active");
      }
      // Untuk menu lainnya, gunakan pencocokan persis seperti sebelumnya
      else if (href && currentHash === href) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}
