import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

export default class DetailView {
  constructor(container) {
    this.app = container;
    this._onBack = null;
    this._onLogout = null;
    this._onAddStory = null;
    this._sidebarVisible = true;
    
  }

  render(story, user = {}) {
    const { name, description, photoUrl, createdAt, lat, lon } = story;
    const formattedDate = new Date(createdAt).toLocaleString();
    const userName = user.name || "User";
    const userPhoto = user.photoUrl || "/api/placeholder/36/36";

    const template = `
      <div class="app-container">        
        <aside class="sidebar" id="sidebar" aria-label="Sidebar Navigation">
          <div class="sidebar-logo p-lg">
            <h1 class="text-xl font-bold">Story App</h1>
          </div>
          <nav class="sidebar-menu" role="navigation">
            <ul>
             <li><a href="#" id="menu-dashboard" class="menu-item"><i class="fas fa-chart-pie"></i><span>Dashboard</span></a></li>
              <li><a href="#/add" id="btn-add-story" class="menu-item active"><i class="fas fa-pen"></i><span>Tambah Story</span></a></li>
              <li><a href="#/saved" id="btn-save-stories" class="menu-item"><i class="fas fa-save"></i><span>Simpan</span></a></li>
              <li><button id="btn-logout" class="menu-item"><i class="fas fa-sign-out-alt"></i><span>Logout</span></button></li>
            </ul>
          </nav>
          <footer class="sidebar-footer text-sm text-secondary p-md">Muhammad Izza &copy; ${new Date().getFullYear()} Story App</footer>
        </aside>

        <main class="main-content">
          <header class="navbar p-md shadow" role="banner">
            <button class="navbar-toggle text-lg" id="sidebar-toggle" aria-label="Toggle sidebar">☰</button>
            <div class="text-lg font-semibold">Story Detail</div>
            <div class="flex items-center gap-sm">
              <button id="btn-back" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Dashboard</button>
              <div class="navbar-user flex items-center ml-md">
                <img src="${userPhoto}" alt="Foto profil ${userName}" class="rounded" width="36" height="36" />
                <span class="ml-sm">${userName}</span>
              </div>
            </div>
          </header>

          <section class="content-container p-lg overflow-auto">
            <article class="detail-container" aria-labelledby="detail-title" tabindex="0">
              <h2 id="detail-title" class="text-xl font-bold mb-sm">${name}</h2>
              <p class="text-sm text-secondary mb-md">Dipost pada ${formattedDate}</p>

              <img src="${photoUrl}" alt="Foto cerita oleh ${name}" class="w-full rounded shadow mb-lg" />

              <div class="detail-description mb-lg text-base">
                <h3 class="text-lg font-medium mb-sm">Deskripsi: </h3>
                <p>${description}</p>
              </div>

              <h3 class="text-lg font-medium mb-sm">Location</h3>
              <div id="detail-map" class="rounded shadow" role="region" aria-label="Peta lokasi cerita" style="height:400px"></div>
            </article>
          </section>
        </main>
      </div>
    `;

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.app.innerHTML = template;
      });
    } else {
      this.app.innerHTML = template;
    }

    this.app.focus();
    this._bindEvents();

    if (lat != null && lon != null) {
      this._initMap(Number(lat), Number(lon), name);
    } else {
      const mapEl = this.app.querySelector("#detail-map");
      mapEl.innerHTML = `<div class="empty-map p-md text-secondary"><p>No location data available.</p></div>`;
      mapEl.style.height = "auto";
    }
  }

  _bindEvents() {
    this.app
      .querySelector("#btn-back")
      .addEventListener("click", () => this._onBack && this._onBack());
    this.app.querySelector("#menu-dashboard").addEventListener("click", (e) => {
      e.preventDefault();
      this._onBack && this._onBack();
    });
    this.app
      .querySelector("#btn-add-story")
      .addEventListener("click", () => this._onAddStory && this._onAddStory());
    this.app.querySelector("#btn-logout").addEventListener("click", () => {
      Swal.fire({
        title: "Logout",
        text: "Yakin keluar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya",
        cancelButtonText: "Batal",
        confirmButtonColor: "var(--accent)",
      }).then((r) => r.isConfirmed && this._onLogout && this._onLogout());
    });
    this.app.querySelector("#sidebar-toggle").addEventListener("click", () => {
      const sidebar = this.app.querySelector("#sidebar");
      sidebar.classList.toggle("show");
      this._sidebarVisible = !this._sidebarVisible;
    });
  }

  _initMap(lat, lon, title) {
    const mapEl = this.app.querySelector("#detail-map");
    const map = L.map(mapEl).setView([lat, lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([lat, lon])
      .addTo(map)
      .bindPopup(`<strong>${title}</strong>`)
      .openPopup();
  }

  bindBack(handler) {
    this._onBack = handler;
  }
  bindLogout(handler) {
    this._onLogout = handler;
  }
  bindAddStory(handler) {
    this._onAddStory = handler;
  }
}
