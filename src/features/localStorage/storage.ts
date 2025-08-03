export function setLocalStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    document.dispatchEvent(
      new CustomEvent('impulse-local-storage', { detail: { key, value } })
    );
  } catch (e) {
    console.warn(`Error storing ${key} in localStorage`, e);
  }
}
