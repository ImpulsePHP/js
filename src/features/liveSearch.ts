export interface SearchableItem {
  element: HTMLElement;
  searchText: string;
  value?: string;
  data?: Record<string, any>;
}

class LiveSearchEngine {
  private searchInput: HTMLInputElement;
  private itemsContainer: HTMLElement;
  private items: SearchableItem[] = [];
  private noResultsElement: HTMLElement | null = null;
  private config: {
    caseSensitive: boolean;
    exactMatch: boolean;
    wordSearch: boolean;
    minLength: number;
    noResultsMessage: string;
    hiddenClass: string;
    searchFields: string[];
    mode: 'contains' | 'startsWith' | 'fuzzy';
  };

  constructor(
    searchInput: HTMLInputElement,
    itemsContainer: HTMLElement,
    config: any = {}
  ) {
    this.searchInput = searchInput;
    this.itemsContainer = itemsContainer;

    this.config = {
      caseSensitive: config.caseSensitive === 'true',
      exactMatch: config.exactMatch === 'true',
      wordSearch: config.wordSearch === 'true',
      minLength: parseInt(config.minLength) || 0,
      noResultsMessage: config.noResultsMessage || 'Aucun résultat trouvé',
      hiddenClass: config.hiddenClass || 'hidden',
      searchFields: config.searchFields?.split(',') || ['textContent', 'data-search-text', 'data-label'],
      mode: config.mode || 'contains'
    };

    this.init();
  }

  private init(): void {
    this.refreshItems();
    this.attachEvents();
  }

  private attachEvents(): void {
    this.searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.performSearch(query);
    });

    // Clear avec Escape
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  private refreshItems(): void {
    const itemSelector = this.itemsContainer.getAttribute('data-search-items') ||
      'li, [data-searchable], .searchable-item';

    const elements = this.itemsContainer.querySelectorAll(itemSelector);

    this.items = Array.from(elements).map(el => ({
      element: el as HTMLElement,
      searchText: this.extractSearchText(el as HTMLElement),
      value: this.extractValue(el as HTMLElement),
      data: this.extractData(el as HTMLElement)
    }));
  }

  private extractSearchText(element: HTMLElement): string {
    for (const field of this.config.searchFields) {
      let text = '';

      if (field === 'textContent') {
        text = element.textContent?.trim() || '';
      } else if (field.startsWith('data-')) {
        text = element.getAttribute(field) || '';
      } else {
        const targetEl = element.querySelector(field);
        text = targetEl?.textContent?.trim() || '';
      }

      if (text) return text;
    }

    return element.textContent?.trim() || '';
  }

  private extractValue(element: HTMLElement): string {
    return element.getAttribute('data-value') ||
      element.getAttribute('value') ||
      this.extractSearchText(element);
  }

  private extractData(element: HTMLElement): Record<string, any> {
    const data: Record<string, any> = {};
    const attributes = Array.from(element.attributes);

    for (const attr of attributes) {
      if (attr.name.startsWith('data-')) {
        data[attr.name.slice(5)] = attr.value;
      }
    }

    return data;
  }

  private performSearch(query: string): void {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < this.config.minLength) {
      this.showAllItems();
      this.hideNoResults();
      return;
    }

    const searchQuery = this.config.caseSensitive ? trimmedQuery : trimmedQuery.toLowerCase();
    const visibleItems: SearchableItem[] = [];

    for (const item of this.items) {
      const searchText = this.config.caseSensitive ?
        item.searchText : item.searchText.toLowerCase();

      const matches = this.matchesQuery(searchText, searchQuery);

      if (matches) {
        this.showItem(item.element);
        visibleItems.push(item);
      } else {
        this.hideItem(item.element);
      }
    }

    if (visibleItems.length === 0) {
      this.showNoResults();
    } else {
      this.hideNoResults();
    }

    this.itemsContainer.dispatchEvent(new CustomEvent('live-search', {
      detail: { query: trimmedQuery, visibleItems, totalItems: this.items.length }
    }));
  }

  private matchesQuery(text: string, query: string): boolean {
    switch (this.config.mode) {
      case 'startsWith':
        return text.startsWith(query);
      case 'fuzzy':
        return this.fuzzyMatch(text, query);
      case 'contains':
      default:
        if (this.config.wordSearch) {
          const queryWords = query.split(/\s+/);
          const textWords = text.split(/\s+/);
          return queryWords.every(qWord =>
            textWords.some(tWord => tWord.includes(qWord))
          );
        }
        return text.includes(query);
    }
  }

  private fuzzyMatch(text: string, query: string): boolean {
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === query.length;
  }

  private showItem(element: HTMLElement): void {
    if (this.config.hiddenClass) {
      element.classList.remove(this.config.hiddenClass);
    }
    element.style.display = '';
  }

  private hideItem(element: HTMLElement): void {
    if (this.config.hiddenClass) {
      element.classList.add(this.config.hiddenClass);
    } else {
      element.style.display = 'none';
    }
  }

  private showAllItems(): void {
    this.items.forEach(item => this.showItem(item.element));
  }

  private showNoResults(): void {
    this.noResultsElement = this.itemsContainer.querySelector('[data-no-results]');

    if (!this.noResultsElement) {
      this.noResultsElement = document.createElement('div');
      this.noResultsElement.setAttribute('data-no-results', '');
      this.noResultsElement.className = 'p-3 text-sm text-slate-500 text-center';
      this.itemsContainer.appendChild(this.noResultsElement);
    }

    this.noResultsElement.textContent = this.config.noResultsMessage;
    this.noResultsElement.style.display = '';
  }

  private hideNoResults(): void {
    if (this.noResultsElement) {
      this.noResultsElement.style.display = 'none';
    }
  }

  private clearSearch(): void {
    this.searchInput.value = '';
    this.showAllItems();
    this.hideNoResults();
  }

  public refresh(): void {
    this.refreshItems();
  }

  public destroy(): void {
    // Cleanup si nécessaire
  }
}

function initLiveSearch(): void {
  const searchContainers = document.querySelectorAll('[data-live-search]');

  searchContainers.forEach(container => {
    const searchInput = container.querySelector('[data-search-input]') as HTMLInputElement;
    const itemsContainer = container.querySelector('[data-search-container]') as HTMLElement || container as HTMLElement;

    if (!searchInput) {
      console.warn('LiveSearch: data-search-input not found in container', container);
      return;
    }

    const config = {
      caseSensitive: container.getAttribute('data-search-case-sensitive'),
      exactMatch: container.getAttribute('data-search-exact-match'),
      wordSearch: container.getAttribute('data-search-word-match'),
      minLength: container.getAttribute('data-search-min-length'),
      noResultsMessage: container.getAttribute('data-search-no-results-message'),
      hiddenClass: container.getAttribute('data-search-hidden-class'),
      searchFields: container.getAttribute('data-search-fields'),
      mode: container.getAttribute('data-search-mode')
    };

    new LiveSearchEngine(searchInput, itemsContainer, config);
  });
}

function setupLiveSearch(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveSearch);
  } else {
    initLiveSearch();
  }

  document.addEventListener('impulse:component-updated', initLiveSearch);

  function setupMutationObserver(): void {
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMutationObserver);
      }
      return;
    }

    const observer = new MutationObserver(() => {
      setTimeout(initLiveSearch, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  setupMutationObserver();
}

setupLiveSearch();

export default LiveSearchEngine;
