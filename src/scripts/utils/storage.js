// src/utils/storage.js

// Token
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");

// User (asumsi kamu menyimpan objek user di localStorage sebagai JSON)
export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};
export const setUser = (user) =>
  localStorage.setItem("user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("user");

// Default export jika kamu butuh
const Storage = {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
};
export default Storage;
