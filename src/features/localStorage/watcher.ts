import { collectLocalStorage, exportLocalStorageToBackend, lastSyncTimestamp } from './sync';

const deletedKeys: Set<string> = new Set();
let knownKeys: Set<string> = new Set();

function initKnownKeys(): void {
  knownKeys.clear();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) {
      knownKeys.add(key);
    }
  }
}

export function setupLocalStorageMonitoring(): void {
  initKnownKeys();

  const originalSetItem = localStorage.setItem;
  const originalRemoveItem = localStorage.removeItem;
  const originalClear = localStorage.clear;
  const currentLang = document.documentElement.lang || null;

  localStorage.setItem = function(key, value) {
    originalSetItem.call(localStorage, key, value);
    knownKeys.add(key);
    deletedKeys.delete(key);
    setTimeout(() => exportLocalStorageToBackend(), 0);
  };

  localStorage.removeItem = function(key) {
    if (localStorage.getItem(key) !== null) {
      deletedKeys.add(key);
      knownKeys.delete(key);
    }
    originalRemoveItem.call(localStorage, key);
    setTimeout(() => exportLocalStorageToBackend(), 0);
  };

  localStorage.clear = function() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        deletedKeys.add(key);
      }
    }
    knownKeys.clear();
    originalClear.call(localStorage);
    setTimeout(() => exportLocalStorageToBackend(), 0);
  };

  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      initKnownKeys();
    } else if (event.newValue === null) {
      knownKeys.delete(event.key);
      deletedKeys.add(event.key);
    } else {
      knownKeys.add(event.key);
      deletedKeys.delete(event.key);
    }
    setTimeout(() => exportLocalStorageToBackend(), 0);
  });

  document.addEventListener('DOMContentLoaded', () => {
    exportLocalStorageToBackend(true).then(() => {
      console.log('localStorage synchronised on initial load');
    });
  });

  window.addEventListener('beforeunload', () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', window.location.href, false);

    if (currentLang) {
      xhr.setRequestHeader('Accept-Language', currentLang);
    }

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-LocalStorage-Sync', '1');
    xhr.send(
      JSON.stringify({
        _local_storage: collectLocalStorage(),
        _metadata: {
          timestamp: Date.now(),
          previous_timestamp: lastSyncTimestamp,
          deleted_keys: Array.from(deletedKeys),
        },
      })
    );
  });

  const originalPushState = history.pushState;
  history.pushState = function() {
    exportLocalStorageToBackend();
    return originalPushState.apply(this, [...arguments] as [any, string, (string | URL)?]);
  };
}
