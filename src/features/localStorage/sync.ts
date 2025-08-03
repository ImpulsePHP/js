import type { LocalStoragePayload } from './types';

export let lastSyncTimestamp = Date.now();
let lastHash = '';

function unicodeToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

function hashLocalStorage(): string {
  const json = JSON.stringify(collectLocalStorage());
  return btoa(unicodeToBase64(json));
}

export function collectLocalStorage(): Record<string, string | null> {
  const stores: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) {
      let value = localStorage.getItem(key);
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      stores[key] = value;
    }
  }
  return stores;
}

export async function exportLocalStorageToBackend(forceRefresh = false): Promise<void> {
  try {
    const currentHash = hashLocalStorage();
    if (!forceRefresh && currentHash === lastHash) {
      return;
    }

    lastHash = currentHash;
    const currentTimestamp = Date.now();
    const payload: LocalStoragePayload = {
      _local_storage: collectLocalStorage(),
      _metadata: {
        timestamp: currentTimestamp,
        previous_timestamp: lastSyncTimestamp,
        force_refresh: forceRefresh
      }
    };

    lastSyncTimestamp = currentTimestamp;

    const response = await fetch(window.location.href, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'X-LocalStorage-Sync': '1',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`Synchronization failed: ${response.status}`);
    }

    if (forceRefresh) {
      await response.json();
    }
  } catch (error) {
    console.error('Error while synchronizing localStorage:', error);
  }
}

export function forceSyncLocalStorage(): Promise<void> {
  return exportLocalStorageToBackend(true);
}
