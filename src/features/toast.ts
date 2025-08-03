// Toast auto-dismiss feature for ImpulseJS
interface ToastTimer {
  intervalId: number;
  startTime: number;
  pauseTime: number | null;
  totalPauseDuration: number;
}

class ToastManager {
  private activeTimers = new Map<string, ToastTimer>();
  private config = {
    animationDuration: 300,
    progressUpdateInterval: 100,
  };

  public initializeToast(toastElement: HTMLElement): void {
    const autoHide = toastElement.dataset.toastAutoHide === 'true';
    const duration = parseInt(toastElement.dataset.toastTimer || '0', 10);
    const toastId = toastElement.dataset.toastId || toastElement.id || `toast-${Date.now()}`;

    if (!autoHide || duration <= 0) {
      return;
    }

    this.clearTimer(toastId);

    const timer: ToastTimer = {
      intervalId: 0,
      startTime: Date.now(),
      pauseTime: null,
      totalPauseDuration: 0,
    };

    const updateTimer = () => {
      const elapsed = Date.now() - timer.startTime - timer.totalPauseDuration;
      const remainingTime = Math.max(0, duration - elapsed);

      this.updateProgressBar(toastElement, remainingTime, duration);

      if (remainingTime <= 0) {
        this.dismissToast(toastElement, toastId);
        return;
      }

      timer.intervalId = window.setTimeout(updateTimer, this.config.progressUpdateInterval);
    };

    timer.intervalId = window.setTimeout(updateTimer, this.config.progressUpdateInterval);
    this.activeTimers.set(toastId, timer);

    this.setupHoverHandlers(toastElement, toastId, timer, duration);
  }

   private updateProgressBar(toastElement: HTMLElement, remainingTime: number, duration: number): void {
    const progressBar = toastElement.querySelector<HTMLElement>('[data-toast-progress]');
    if (!progressBar) return;

    const percentage = (remainingTime / duration) * 100;
    progressBar.style.width = `${percentage}%`;
  }

  private setupHoverHandlers(
    toastElement: HTMLElement,
    toastId: string,
    timer: ToastTimer,
    duration: number
  ): void {
    const pauseTimer = () => {
      if (timer.pauseTime !== null) return;

      timer.pauseTime = Date.now();
      clearTimeout(timer.intervalId);
      toastElement.classList.add('toast-paused');

      this.emitLocalEvent('toast:paused', { toastId, element: toastElement });
    };

    const resumeTimer = () => {
      if (timer.pauseTime === null) return;

      timer.totalPauseDuration += Date.now() - timer.pauseTime;
      timer.pauseTime = null;
      toastElement.classList.remove('toast-paused');

      const elapsed = Date.now() - timer.startTime - timer.totalPauseDuration;
      const remainingTime = Math.max(0, duration - elapsed);

      if (remainingTime > 0) {
        this.restartTimer(toastElement, toastId, timer, duration);
        this.emitLocalEvent('toast:resumed', { toastId, element: toastElement });
      } else {
        this.dismissToast(toastElement, toastId);
      }
    };

    toastElement.addEventListener('mouseenter', pauseTimer);
    toastElement.addEventListener('mouseleave', resumeTimer);
    toastElement.addEventListener('focusin', pauseTimer);
    toastElement.addEventListener('focusout', resumeTimer);
  }

  private restartTimer(
    toastElement: HTMLElement,
    toastId: string,
    timer: ToastTimer,
    duration: number
  ): void {
    const updateTimer = () => {
      const elapsed = Date.now() - timer.startTime - timer.totalPauseDuration;
      const remainingTime = Math.max(0, duration - elapsed);

      this.updateProgressBar(toastElement, remainingTime, duration);

      if (remainingTime <= 0) {
        this.dismissToast(toastElement, toastId);
        return;
      }

      timer.intervalId = window.setTimeout(updateTimer, this.config.progressUpdateInterval);
    };

    timer.intervalId = window.setTimeout(updateTimer, this.config.progressUpdateInterval);
  }

  private dismissToast(toastElement: HTMLElement, toastId: string): void {
    this.clearTimer(toastId);

    toastElement.style.transition = `all ${this.config.animationDuration}ms ease-out`;
    toastElement.style.transform = 'translateX(100%)';
    toastElement.style.opacity = '0';

    setTimeout(() => {
      const impulseId = toastElement.closest('[data-impulse-id]')?.getAttribute('data-impulse-id');
      if (impulseId && window.Impulse?.emit) {
        window.Impulse.emit('component:call', {
          componentId: impulseId,
          method: 'hide',
          params: []
        });
      }

      this.emitLocalEvent('toast:dismissed', { toastId, element: toastElement });
    }, this.config.animationDuration);
  }

  private emitLocalEvent(eventName: string, payload: any): void {
    if (window.Impulse?.emitEvent) {
      window.Impulse.emitEvent(eventName, payload);
    }

    document.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  }

  public clearTimer(toastId: string): void {
    const timer = this.activeTimers.get(toastId);
    if (timer) {
      clearTimeout(timer.intervalId);
      this.activeTimers.delete(toastId);
    }
  }

  public clearAllTimers(): void {
    this.activeTimers.forEach((timer) => clearTimeout(timer.intervalId));
    this.activeTimers.clear();
  }

  public observeToasts(): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            if (element.classList?.contains('ui-toast')) {
              this.initializeToast(element);
            }

            const toasts = element.querySelectorAll?.('.ui-toast');
            toasts?.forEach((toast) => this.initializeToast(toast as HTMLElement));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return observer;
  }

  public initializeExistingToasts(): void {
    const existingToasts = document.querySelectorAll<HTMLElement>('.ui-toast');
    existingToasts.forEach((toast) => this.initializeToast(toast));
  }
}

const toastManager = new ToastManager();

export function initializeToasts(): void {
  toastManager.initializeExistingToasts();
  toastManager.observeToasts();
}

export function clearAllToastTimers(): void {
  toastManager.clearAllTimers();
}

if (window.Impulse) {
  window.addEventListener('beforeunload', clearAllToastTimers);
  window.Impulse.on('toast:show', () => {
    setTimeout(() => toastManager.initializeExistingToasts(), 50);
  });
}

declare global {
  interface Window {
    ImpulseToast: {
      init: (element: HTMLElement) => void;
      clearTimer: (toastId: string) => void;
      clearAllTimers: () => void;
    };
  }
}

window.ImpulseToast = {
  init: (element: HTMLElement) => toastManager.initializeToast(element),
  clearTimer: (toastId: string) => toastManager.clearTimer(toastId),
  clearAllTimers: () => toastManager.clearAllTimers(),
};
