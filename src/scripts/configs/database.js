// src/storage/indexedDBUtil.js
import { openDB } from "idb";

const DB_NAME = "storyAppDB";
const STORE_NAME = "savedStories";
const DB_VERSION = 1;

// Buka (atau buat) database
const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

export const indexedDBUtil = {
  async saveStory(story) {
    const db = await dbPromise;
    return db.put(STORE_NAME, story);
  },

  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },

  async deleteStory(id) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
  },
};
