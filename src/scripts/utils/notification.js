import { API_BASE } from "../configs/api-config.js";
import { getToken } from "./storage.js";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

export function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function askPermission() {
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function subscribePush() {
  if (!(await askPermission())) {
    console.warn("Notifikasi ditolak user.");
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const rawP256dh = sub.getKey("p256dh");
  const rawAuth = sub.getKey("auth");
  const p256dh = rawP256dh
    ? btoa(String.fromCharCode(...new Uint8Array(rawP256dh)))
    : "";
  const auth = rawAuth
    ? btoa(String.fromCharCode(...new Uint8Array(rawAuth)))
    : "";

  const token = getToken();
  const res = await fetch(`${API_BASE}/notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
      p256dh,
      auth,
      }
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Subscribe gagal:", err.message);
    alert(`Subscribe gagal: ${err.message}`);
    return false;
  }

  const json = await res.json();
  console.log("✅ Berhasil subscribe:", json.message);
  return true;
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  const token = getToken();
  await fetch(`${API_BASE}/notifications/subscribe`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint: sub.endpoint }),
  });

  await sub.unsubscribe();
  console.log("🛑 Berhasil unsubscribe");
}
