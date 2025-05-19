import apiConfig from "../configs/api-config.js";
import Storage from "../utils/storage.js";
console.debug("Imported apiConfig:", apiConfig);
console.debug("API_BASE:", apiConfig?.API_BASE);

export default class DetailModel {
  constructor() {
    if (!apiConfig || !apiConfig.API_BASE) {
      console.error("API configuration missing or invalid");
    } else {
      this._apiBase = apiConfig.API_BASE;
    }
    console.debug("DetailModel initialized with _apiBase:", this._apiBase);
  }

  async getStoryDetail(id) {
    console.debug("[DetailModel] getStoryDetail called with id:", id);

    if (!this._apiBase) {
      console.error("[DetailModel] API base URL is not defined");
      throw new Error("API base URL is not defined");
    }

    if (!id) {
      console.error("[DetailModel] Story ID is not provided");
      throw new Error("Story ID is not provided");
    }

    const token = Storage.getToken();
    console.debug("[DetailModel] token retrieved:", !!token);

    if (!token) {
      console.error("[DetailModel] Authentication token is missing");
      throw new Error("Authentication token is missing");
    }

    const url = `${this._apiBase}/stories/${id}`;
    console.debug("[DetailModel] fetching URL:", url);

    try {
      console.debug("[DetailModel] Making fetch request...");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.debug("[DetailModel] Response status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[DetailModel] Error ${response.status}:`, errText);
        throw new Error(`Error ${response.status}: ${errText}`);
      }

      const result = await response.json();
      console.debug("[DetailModel] Data received:", result);

      if (!result.story) {
        console.error(
          "[DetailModel] Story data not found in response:",
          result
        );
      }

      return result.story;
    } catch (error) {
      console.error("[DetailModel] Error fetching story details:", error);
      throw error;
    }
  }
}
