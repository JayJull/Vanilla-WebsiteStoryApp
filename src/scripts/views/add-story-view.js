import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Swal from "sweetalert2";

export default class AddStoryView {
  constructor(root) {
    this._root = root;
    this._onMapClick = null;
    this._onBack = null;
    this._onLogout = null;
    this._stream = null;
    this._sidebarVisible = true;
    this._initTemplate();
    this._captureElements();
    this._updateActiveMenu(); // Set active menu saat pertama kali load
    window.addEventListener("hashchange", this._updateActiveMenu.bind(this)); // Update saat hash berubah
  }

  _initTemplate() {
    this._root.innerHTML = `
      <div class="app-container">
        <aside class="sidebar" id="sidebar" aria-label="Sidebar Navigation">
          <div class="sidebar-logo p-lg">
            <h1 class="text-xl font-bold">Story App</h1>
          </div>
          <nav class="sidebar-menu" role="navigation">
            <ul>
              <li><a href="#/" id="menu-dashboard" class="menu-item"><i class="fas fa-chart-pie"></i><span>Dashboard</span></a></li>
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
            <div class="text-lg font-semibold">Add New Story</div>
            <button id="btn-back" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Dashboard</button>
          </header>

          <section class="content-container p-lg overflow-auto">
            <h2 class="section-title">Create New Story</h2>
            <form id="story-form">

              <div class="form-group">
                <label for="preview" class="form-label">Photo</label>
                <div class="camera-preview rounded shadow">
                  <video id="preview" autoplay playsinline class="hidden rounded"></video>
                  <canvas id="snapshot" hidden class="rounded"></canvas>
                </div>
                <div class="camera-buttons">
                  <button id="capture" type="button" class="btn btn-primary"><i class="fas fa-camera"></i> Ambil Foto</button>
                  <input type="file" id="file-input" accept="image/*" class="form-control" aria-label="Upload foto" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Location</label>
                <div id="map" class="rounded shadow mb-md" style="height:300px"></div>
                <button id="btn-current-location" type="button" class="btn btn-secondary mb-sm"><i class="fas fa-map-marker-alt"></i> Lokasi Saya</button>
                <p class="form-text" id="location-text">Klik pada peta atau gunakan lokasi saya untuk memilih titik.</p>
              </div>

              <div class="form-group">
                <label for="description" class="form-label">Description</label>
                <textarea id="description" required rows="4" class="form-control" placeholder="Cerita Anda..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Submit</button>
            </form>
          </section>
        </main>
      </div>
    `;
  }

  _captureElements() {
    this.video = this._root.querySelector("#preview");
    this.captureBtn = this._root.querySelector("#capture");
    this.canvas = this._root.querySelector("#snapshot");
    this.fileInput = this._root.querySelector("#file-input");
    this.mapContainer = this._root.querySelector("#map");
    this.btnCurrent = this._root.querySelector("#btn-current-location");
    this.form = this._root.querySelector("#story-form");
    this.descInput = this._root.querySelector("#description");
    this.locationText = this._root.querySelector("#location-text");
    this.btnAddStory = this._root.querySelector("#btn-add-story");
    this._bindNavigationEvents();
  }

  _bindNavigationEvents() {
    const goBack = (e) => {
      e?.preventDefault();
      this._onBack && this._onBack();
    };
    this._root
      .querySelector("#menu-dashboard")
      .addEventListener("click", goBack);
    this.btnAddStory.addEventListener("click", goBack);
    this._root.querySelector("#btn-back").addEventListener("click", goBack);

    this._root.querySelector("#btn-logout").addEventListener("click", () => {
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

    this._root
      .querySelector("#sidebar-toggle")
      .addEventListener("click", () => {
        const sidebar = this._root.querySelector("#sidebar");
        sidebar.classList.toggle("show");
        this._sidebarVisible = !this._sidebarVisible;
      });
  }

  bindStartCamera(handler) {
    this.captureBtn.addEventListener("click", handler);
  }
  bindFileInput(handler) {
    this.fileInput.addEventListener("change", (e) => {
      this.stopCameraStream();
      handler(e);
    });
  }
  bindMapClick(handler) {
    this._onMapClick = handler;
  }
  bindCurrentLocation(handler) {
    this.btnCurrent.addEventListener("click", handler);
  }
  bindFormSubmit(handler) {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler();
    });
  }
  bindBack(handler) {
    this._onBack = handler;
  }
  bindLogout(handler) {
    this._onLogout = handler;
  }

  renderPreview(stream) {
    this._stream = stream;
    this.video.srcObject = stream;
    this.video.classList.remove("hidden");
    this.video.play().catch(() => {});
    this.fileInput.classList.add("hidden");
    this.canvas.hidden = true;
    this.captureBtn.innerHTML = '<i class="fas fa-camera"></i> Ambil Foto';
  }

  stopCameraStream() {
    if (this._stream) this._stream.getTracks().forEach((t) => t.stop());
    this._stream = null;
    this.video.srcObject = null;
    this.video.classList.add("hidden");
    this.fileInput.classList.remove("hidden");
  }

  takeSnapshot() {
    if (!this._stream) return Promise.resolve(null);
    const ctx = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0);
    this.canvas.hidden = false;
    this.video.classList.add("hidden");
    this.stopCameraStream();
    this.captureBtn.innerHTML = '<i class="fas fa-camera"></i> Foto Baru';
    return new Promise((r) => this.canvas.toBlob(r, "image/jpeg", 0.9));
  }

  initMap() {
    this.mapContainer.innerHTML = "";
    this.map = L.map(this.mapContainer).setView([-6.2, 106.816666], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);
    this.map.on("click", (e) => {
      if (this.marker) this.marker.remove();
      this.marker = L.marker(e.latlng).addTo(this.map);
      this.locationText.textContent = `Lokasi terpilih: Lat ${e.latlng.lat.toFixed(
        6
      )}, Lng ${e.latlng.lng.toFixed(6)}`;
      this._onMapClick && this._onMapClick(e.latlng);
    });
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  setSelectedLocation({ lat, lng }) {
    this.marker?.remove();
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.setView([lat, lng], 15);
    this.locationText.textContent = `Lokasi terpilih: Lat ${lat.toFixed(
      6
    )}, Lng ${lng.toFixed(6)}`;
    this.selectedLat = lat;
    this.selectedLng = lng;
  }

  setFile(file) {
    this.photoBlob = file;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.canvas.hidden = false;
          const ctx = this.canvas.getContext("2d");
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFormData() {
    return {
      description: this.descInput.value.trim(),
      latitude: this.selectedLat,
      longitude: this.selectedLng,
      photoBlob: this.photoBlob,
    };
  }

  startViewTransition(cb) {
    this.stopCameraStream();
    if (document.startViewTransition) {
      document.startViewTransition(cb);
    } else cb();
  }

  destroy() {
    this.stopCameraStream();
    this.map?.remove();
    this.map = null;
  }

  // Fungsi untuk update kelas active sidebar menu sesuai URL hash
  _updateActiveMenu() {
    const currentHash = window.location.hash || "#/add";
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
}
