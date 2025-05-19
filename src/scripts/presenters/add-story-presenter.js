import L from "leaflet";

export default class AddStoryPresenter {
  constructor(view, model, router) {
    this._view = view;
    this._model = model;
    this._router = router;
    this._bindViewEvents();

    this._handleRouteChange = this._handleRouteChange.bind(this);
    window.addEventListener("hashchange", this._handleRouteChange);
  }

  init({ route }) {
    if (route !== "/add") return;

    this._view.startViewTransition(() => {
      this._view._initTemplate();
      this._view._captureElements();
      this._view.initMap();
      this._bindViewEvents();
    });
  }

  _bindViewEvents() {
    this._view.bindStartCamera(this._handleCapture.bind(this));
    this._view.bindFileInput(this._handleFileChange.bind(this));
    this._view.bindMapClick(this._handleMapClick.bind(this));
    this._view.bindCurrentLocation(this._handleUseMyLocation.bind(this));
    this._view.bindFormSubmit(this._handleSubmit.bind(this));
    this._view.bindBack(this._handleBack.bind(this));
    this._view.bindLogout(this._handleLogout.bind(this));
  }

  _handleRouteChange() {
    if (!location.hash.includes("#/add")) {
      this._view.stopCameraStream();
    }
  }

  async _handleCapture() {
    try {
      if (this._view._stream) {
        const blob = await this._view.takeSnapshot();
        if (blob) this._view.setFile(blob);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        this._view.renderPreview(stream);
      }
    } catch (err) {
      console.error(err);
      alert(`Gagal mengakses kamera: ${err.message}`);
    }
  }

  _handleFileChange(evt) {
    const file = evt.target.files[0];
    if (!file) return;

    if (file.size > 1_000_000) {
      alert("Ukuran file maksimal 1 MB.");
      evt.target.value = "";
      return;
    }

    this._view.stopCameraStream();
    this._view.setFile(file);
  }

  _handleMapClick(latlng) {
    this._view.setSelectedLocation(latlng);
  }

  _handleUseMyLocation() {
    if (!navigator.geolocation) {
      return alert("Geolocation tidak didukung di browser ini.");
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this._view.setSelectedLocation(latlng);
        this._view.map.setView(latlng, 13);
        if (this._view.marker) this._view.marker.remove();
        this._view.marker = L.marker(latlng).addTo(this._view.map);
      },
      () => alert("Gagal mendapatkan lokasi Anda.")
    );
  }

  async _handleSubmit() {
    try {
      let photo = this._view.photoBlob;

      if (!photo && this._view._stream) {
        photo = await this._view.takeSnapshot();
      }

      if (!photo)
        return alert("Silakan ambil foto atau upload gambar terlebih dahulu.");

      const { description, latitude, longitude } = this._view.getFormData();

      if (!description) return alert("Deskripsi harus diisi.");
      if (!latitude || !longitude)
        return alert("Silakan pilih lokasi pada peta.");

      await this._model.addStory({
        photoBlob: photo,
        description,
        latitude,
        longitude,
      });

      location.hash = "#/dashboard";
    } catch (e) {
      alert(e.message);
    }
  }

  _handleBack() {
    location.hash = "#/dashboard";
  }

  _handleLogout() {
    window.location.hash = "#/login";
  }

  destroy() {
    window.removeEventListener("hashchange", this._handleRouteChange);
    this._view.stopCameraStream();
  }
}
