export default class AddStoryModel {
  constructor(apiConfig, storage) {
    this._baseUrl = apiConfig.API_BASE;
    this._storage = storage;
  }

  async addStory({ photoBlob, description, latitude, longitude }) {
    const token = this._storage.getToken();
    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");
    }

    const formData = new FormData();
    formData.append("photo", photoBlob, "photo.jpg");
    formData.append("description", description);
    if (latitude && longitude) {
      formData.append("lat", latitude);
      formData.append("lon", longitude);
    }

    console.log("[AddStoryModel] baseUrl:", this._baseUrl);

    const response = await fetch(`${this._baseUrl}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Gagal menambahkan story");
    }

    return response.json();
  }
}
