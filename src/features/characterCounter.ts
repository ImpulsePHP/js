interface CharacterCounterConfig {
  maxLength: number;
  mode: 'count' | 'countdown';
  target?: string;
}

interface CounterElements {
  input: HTMLInputElement | HTMLTextAreaElement;
  counter: HTMLElement;
  config: CharacterCounterConfig;
}

class CharacterCounter {
  private counters: Map<string, CounterElements> = new Map();

  public init(): void {
    this.bindElements();
    this.setupMutationObserver();
  }

  private bindElements(): void {
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-character-counter]')
      .forEach(element => this.bindElement(element));
  }

  private bindElement(element: HTMLInputElement | HTMLTextAreaElement): void {
    const configData = element.getAttribute('data-character-counter');
    if (!configData) return;

    try {
      const config: CharacterCounterConfig = JSON.parse(configData);
      const counterId = element.id || `counter_${Date.now()}_${Math.random()}`;

      let counterElement: HTMLElement | null;

      if (config.target) {
        counterElement = document.querySelector(config.target);
      } else {
        counterElement = element.parentElement?.querySelector('[data-character-display]') || null;
      }

      if (!counterElement) {
        console.warn('Counter display element not found for:', element);
        return;
      }

      this.counters.set(counterId, {
        input: element,
        counter: counterElement,
        config
      });

      this.bindEvents(counterId);
      this.updateCounter(counterId);

    } catch (error) {
      console.error('Invalid character counter configuration:', configData, error);
    }
  }

  private bindEvents(counterId: string): void {
    const elements = this.counters.get(counterId);
    if (!elements) return;

    const { input } = elements;

    ['input', 'keyup', 'paste', 'cut'].forEach(eventType => {
      input.addEventListener(eventType, () => {
        setTimeout(() => this.updateCounter(counterId), 0);
      });
    });
  }

  private updateCounter(counterId: string): void {
    const elements = this.counters.get(counterId);
    if (!elements) return;

    const { input, counter, config } = elements;
    const currentLength = this.getTextLength(input.value);
    const { maxLength, mode } = config;

    let displayText: string;
    let cssClass: string;

    if (mode === 'countdown') {
      const remaining = maxLength - currentLength;
      if (remaining >= 0) {
        displayText = `${remaining} caractères restants`;
        cssClass = remaining < (maxLength * 0.1) ? 'text-yellow-600' : 'text-slate-500';
      } else {
        displayText = `Dépassement de ${Math.abs(remaining)} caractères`;
        cssClass = 'text-red-600';
      }
    } else {
      displayText = `${currentLength}/${maxLength} caractères`;
      cssClass = currentLength > maxLength ? 'text-red-600' :
        currentLength > (maxLength * 0.9) ? 'text-yellow-600' : 'text-slate-500';
    }

    counter.textContent = displayText;
    counter.className = counter.className.replace(/text-(slate|yellow|red)-\d+/g, '') + ` ${cssClass}`;
  }

  private getTextLength(text: string): number {
    return [...text].length;
  }

  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (element.hasAttribute('data-character-counter')) {
              this.bindElement(element as HTMLInputElement | HTMLTextAreaElement);
            }

            element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-character-counter]')
              .forEach(child => this.bindElement(child));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  public destroy(elementId?: string): void {
    if (elementId) {
      this.counters.delete(elementId);
    } else {
      this.counters.clear();
    }
  }
}

export const characterCounter = new CharacterCounter();
