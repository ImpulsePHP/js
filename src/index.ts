import './core/router.ts';
import { emit, updateComponent } from './core/ajax';
import { initImpulse } from "./core/events";
import { forceSyncLocalStorage, setupLocalStorageMonitoring } from './features/localStorage';
import { setupInteractions } from './features/interactions';
import './features/liveSearch';
import { initializeToasts } from './features/toast';
import type { ImpulseInstance } from './types/impulse';

declare global {
  interface Window {
    Impulse: ImpulseInstance;
    __impulseComponents: Set<string>;
    initImpulse?: () => void;
  }
}

(function () {
  const Impulse: ImpulseInstance = {
    emit: emit,
    updateComponent: updateComponent,
    _eventListeners: {},

    on(event, callback) {
      if (!this._eventListeners[event]) {
        this._eventListeners[event] = [];
      }
      this._eventListeners[event].push(callback);
    },

    off(event, callback) {
      if (!this._eventListeners[event]) return;
      this._eventListeners[event] = this._eventListeners[event].filter(cb => cb !== callback);
    },

    emitEvent(event, payload) {
      const listeners = this._eventListeners[event] || [];
      for (const listener of listeners) {
        listener(payload);
      }
    }
  };

  const originalEmit = Impulse.emit;
  Impulse.emit = (event, payload, options = {}) => {
    Impulse.emitEvent(event, payload);
    return originalEmit(event, payload, options);
  };

  if (typeof window !== 'undefined') {
    window.Impulse = Impulse;

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('data-action-ready', {
        detail: { Impulse: window.Impulse }
      }));
    }, 0);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Impulse };
  }
})();

function initialize() {
  initImpulse();
  setupInteractions();
  initializeToasts();

  window.__impulseComponents ??= new Set();
  document.querySelectorAll('[data-impulse-id]').forEach(el => {
    const id = el.getAttribute('data-impulse-id');
    if (id) {
      window.__impulseComponents.add(id);
    }
  });

  setTimeout(() => {
    initImpulse();
  }, 100);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", async () => {
      setupLocalStorageMonitoring();
      await forceSyncLocalStorage();
      initialize();
    });
  } else {
    setupLocalStorageMonitoring();
    forceSyncLocalStorage().then(() => {
      initialize();
    });
  }
}

export {};
