export function readStorage(key, fallback, storage = "localStorage") {
  try { return JSON.parse(window[storage].getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function writeStorage(key, value, storage = "localStorage") {
  try { window[storage].setItem(key, JSON.stringify(value)); }
  catch { /* Private mode or storage quota. The current session can continue. */ }
}
