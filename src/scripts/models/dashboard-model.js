import apiConfig, { API_BASE } from "../configs/api-config.js";
export default class DashboardModel {
  async getStories(token) {
    const res = await fetch(`${API_BASE}/stories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }
}
