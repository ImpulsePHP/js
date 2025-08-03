import { showImpulseError } from './error';
import { initImpulse } from "./events";
import { setLocalStorageItem, collectLocalStorage } from "../features/localStorage";

function collectStates(componentId: string): Record<string, any>
{
  const componentElement = document.querySelector(`[data-impulse-id="${componentId}"]`);
  let states: Record<string, any> = {};

  if (componentElement && componentElement.hasAttribute('data-states')) {
    try {
      states = JSON.parse(componentElement.getAttribute('data-states') || '{}');
    } catch (e) {
      states = {};
    }
  }

  if (componentElement) {
    const isCheckboxRadioComponent = componentElement.classList.contains('ui-checkbox-radio') ||
                                   componentId.includes('checkbox-radio');

    if (isCheckboxRadioComponent) {
      const radioInputs = componentElement.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      const checkboxInputs = componentElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

      if (radioInputs.length > 0) {
        const radioGroupName = radioInputs[0].name;
        radioInputs.forEach((radio) => {
          if (radio.checked && radio.value) {
            states[radioGroupName] = radio.value;
          }
        });
      }

      if (checkboxInputs.length > 0) {
        const statesData = JSON.parse(componentElement.getAttribute('data-states') || '{}');
        const valueStateName = statesData.name || 'value';

        if (checkboxInputs.length === 1) {
          const checkbox = checkboxInputs[0];
          states[valueStateName] = checkbox.checked;
        } else {
          const checkedValues: string[] = [];
          checkboxInputs.forEach((checkbox) => {
            if (checkbox.checked) {
              checkedValues.push(checkbox.name); // Le name est la clé
            }
          });
          states[valueStateName] = checkedValues;
        }
      }

      return states;
    }

    componentElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-action-input], [data-action-change], [name], [id]')
      .forEach((el) => {
        const stateName = el.getAttribute('name') || el.getAttribute('id');
        if (stateName) {
          if (el.type === 'checkbox') {
            states[stateName] = (el as HTMLInputElement).checked;
          } else if (el.type === 'radio') {
            if ((el as HTMLInputElement).checked) {
              states[stateName] = el.value;
            }
          } else if (el.tagName === 'SELECT') {
            const select = el as HTMLSelectElement;
            if (select.multiple) {
              states[stateName] = Array.from(select.selectedOptions).map(opt => opt.value);
            } else {
              states[stateName] = select.value;
            }
          } else {
            states[stateName] = el.value;
          }
        }
      });
  }

  return states;
}

function saveScrollPositions(element: Element): Map<string, number> {
  const scrollPositions = new Map<string, number>();
  const scrollableElements = element.querySelectorAll('[data-save-scroll]');

  scrollableElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.scrollTop > 0) {
      const customId = htmlEl.getAttribute('data-save-scroll');
      const identifier = customId && customId !== '' ? customId : `scroll-${index}`;

      scrollPositions.set(identifier, htmlEl.scrollTop);
    }
  });

  return scrollPositions;
}

function restoreScrollPositions(element: Element, scrollPositions: Map<string, number>): void {
  const restoreWithDelay = (delay: number) => {
    setTimeout(() => {
      const scrollableElements = element.querySelectorAll('[data-save-scroll]');

      scrollableElements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const customId = htmlEl.getAttribute('data-save-scroll');
        const identifier = customId && customId !== '' ? customId : `scroll-${index}`;

        const savedPosition = scrollPositions.get(identifier);
        if (savedPosition !== undefined && savedPosition > 0) {
          htmlEl.scrollTop = savedPosition;

          setTimeout(() => {
            if (Math.abs(htmlEl.scrollTop - savedPosition) > 5) {
              htmlEl.scrollTop = savedPosition;
            }
          }, 10);
        }
      });
    }, delay);
  };

  restoreWithDelay(0);
  restoreWithDelay(10);
  restoreWithDelay(50);
}

function injectStyles(styles: string): void {
  if (!styles) return;

  const cleanedStyles = styles.replace(/<\/?style[^>]*>/g, '').trim();
  if (!cleanedStyles) return;

  const allDynamic = document.querySelectorAll('style#impulse-dynamic-styles');
  allDynamic.forEach((el, idx) => {
    if (idx > 0) el.remove(); // keep only the first one
  });

  let styleTag = document.querySelector('style#impulse-dynamic-styles') as HTMLStyleElement | null;

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'impulse-dynamic-styles';
    document.head.appendChild(styleTag);
  }

  if (!styleTag.textContent?.includes(cleanedStyles)) {
    styleTag.textContent += '\n' + cleanedStyles;
  }
}

async function sendUpdateRequest(payload: any, focusInfo?: any): Promise<string | null>
{
  const impulseComponents = window.__impulseComponents;
  const currentLang = document.documentElement.lang || null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Impulse-Components": Array.isArray(impulseComponents) || impulseComponents instanceof Set
      ? Array.from(impulseComponents).join(',')
      : ''
  };

  if (currentLang) {
    headers['Accept-Language'] = currentLang;
  }

  const res = await fetch("/impulse.php", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (
    res.headers.get("content-type")?.includes("application/json") ||
    (text.trim().startsWith("{") && text.trim().endsWith("}"))
  ) {
    try {
      const data = JSON.parse(text);

      if (data.updates && Array.isArray(data.updates)) {
        data.updates.forEach((update: {component: string, html: string}) => {
          applyUpdate(update.component, update.html, focusInfo);
        })
      }

      if (data.styles) {
        injectStyles(data.styles);
      }

      if (data.events) {
        data.events.forEach(([eventName, payload]: [string, string]) => {
          if (window.Impulse && window.Impulse.emit) {
            window.Impulse.emit(eventName, payload);
          }
        });
      }

      if (data.localStorage && typeof data.localStorage === 'object') {
        for (const [key, value] of Object.entries(data.localStorage)) {
          setLocalStorageItem(key, value);
        }
      }

      if (data.error) {
        showImpulseError(data.message);
        return Promise.reject(data.error);
      }
    } catch (e) {
      console.warn("Impulse: failed to parse response or malformed data.", { text, error: e });
    }
  }

  return null;
}

function findFocusElement(newComponent: Element, focusInfo: any): HTMLElement | null
{
  let elementToFocus: HTMLElement | null = null;

  if (focusInfo.activeElementId && focusInfo.activeElementId.trim() !== '') {
    elementToFocus = document.getElementById(focusInfo.activeElementId);
  }

  if (!elementToFocus && focusInfo.activeElementSelector) {
    try {
      if (focusInfo.activeElementId) {
        elementToFocus = newComponent.querySelector(`#${focusInfo.activeElementId}`);
      }

      if (!elementToFocus) {
        elementToFocus = newComponent.querySelector(focusInfo.activeElementSelector);
      }
    } catch (e) {
      console.warn("Unable to find the element using selector:", focusInfo.activeElementSelector, ". Add an ID to your element to make it accessible. Error:", e);
    }
  }

  return elementToFocus;
}

function restoreFocus(newComponent: Element, focusInfo: any)
{
  setTimeout(() => {
    const elementToFocus = findFocusElement(newComponent, focusInfo);
    if (elementToFocus) {
      if (elementToFocus.tagName === 'SELECT' && typeof focusInfo.selectedIndex === 'number') {
        (elementToFocus as HTMLSelectElement).selectedIndex = focusInfo.selectedIndex;
      }

      if ('focus' in elementToFocus) {
        elementToFocus.focus();
      }

      if ('setSelectionRange' in elementToFocus &&
        typeof focusInfo.selectionStart === 'number' &&
        typeof focusInfo.selectionEnd === 'number') {
        requestAnimationFrame(() => {
          (elementToFocus as HTMLInputElement).setSelectionRange(
            focusInfo.selectionStart,
            focusInfo.selectionEnd
          );
        });
      }
    }
  }, 0);
}

async function applyUpdate(componentId: string, html: string, focusInfo?: any)
{
  const scrollPositions = saveScrollPositions(document.body);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const newComponent = wrapper.querySelector("[data-impulse-id]");

  try {
    const parsed = JSON.parse(html);
    if (parsed && typeof parsed === 'object' && parsed.fragments) {
      Object.entries(parsed.fragments as Record<string, string>).forEach(([key, content]) => {
        const [group, state] = key.split("@");
        const selector = `[data-update^="${group}@"]`;
        const targets = document.querySelectorAll(selector);

        targets.forEach(el => {
          const attr = el.getAttribute("data-update");
          if (!attr) return;
          const stateKey = attr.split("@")[1];
          if (!stateKey) return;
          if (stateKey === state) {
            const wrapper = document.createElement("div");
            wrapper.innerHTML = content.trim();
            const newNode = wrapper.firstElementChild;
            if (newNode) {
              el.replaceWith(newNode);
            } else {
              el.innerHTML = content;
            }
          }
        });
      });

      if (parsed.styles) {
        injectStyles(parsed.styles);
      }

      if (parsed.events) {
        parsed.events.forEach(([eventName, payload]: [string, string]) => {
          if (window.Impulse && window.Impulse.emit) {
            window.Impulse.emit(eventName, payload);
          }
        });
      }

      if (parsed.states) {
        const currentComponent = document.querySelector(`[data-impulse-id="${componentId}"]`);
        if (currentComponent) {
          currentComponent.setAttribute('data-states', JSON.stringify(parsed.states));
        }
      }

      if (parsed.localStorage && typeof parsed.localStorage === 'object') {
        for (const [key, value] of Object.entries(parsed.localStorage)) {
          setLocalStorageItem(key, value);
        }
      }

      initImpulse();

      return;
    }
  } catch (e) {
    // not JSON, continue normally
  }

  restoreScrollPositions(document.body, scrollPositions);

  if (focusInfo?.update) {
    let states = null;

    try {
      const parsed = JSON.parse(html);
      if (parsed && typeof parsed === 'object' && parsed.result) {
        html = parsed.result;
        states = parsed.states;
      }
    } catch (e) {
      // not JSON, continue normally
    }

    const currentComponent = document.querySelector(`[data-impulse-id="${componentId}"]`);
    const target = currentComponent?.querySelector(`[data-update="${focusInfo.update}"]`);
    if (target) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html.trim();
      const fragment = wrapper.firstElementChild;
      if (fragment) {
        target.replaceWith(fragment);
        if (states && currentComponent) {
          currentComponent.setAttribute('data-states', JSON.stringify(states));
        }

        if (focusInfo) {
          restoreFocus(fragment, focusInfo);
        }
      } else {
        target.innerHTML = html;
        if (states && currentComponent) {
          currentComponent.setAttribute('data-states', JSON.stringify(states));
        }

        if (focusInfo) {
          restoreFocus(target, focusInfo);
        }
      }

      // Do not call initImpulse() here otherwise inputs get bound twice
      return;
    }
  }

  const currentComponent = document.querySelector(`[data-impulse-id="${componentId}"]`);
  if (newComponent && currentComponent && currentComponent.parentNode) {
    const originalClasses = currentComponent.getAttribute('class') || '';
    const newClasses = newComponent.getAttribute('class') || '';

    if (originalClasses) {
      const originalClassArray = originalClasses.split(' ').filter(cls => cls.trim() !== '');
      const newClassArray = newClasses.split(' ').filter(cls => cls.trim() !== '');
      const mergedClasses = [...new Set([...originalClassArray, ...newClassArray])];

      if (mergedClasses.length > 0) {
        newComponent.setAttribute('class', mergedClasses.join(' '));
      }
    }

    const attributesToPreserve = ['style', 'title'];
    attributesToPreserve.forEach(attr => {
      const originalValue = currentComponent.getAttribute(attr);
      if (originalValue && !newComponent.hasAttribute(attr)) {
        newComponent.setAttribute(attr, originalValue);
      }
    });

    const systemDataAttributes = ['data-impulse-id', 'data-states', 'data-slot'];

    Array.from(currentComponent.attributes).forEach(attr => {
      if (
        (attr.name.startsWith('data-') && !systemDataAttributes.includes(attr.name)) ||
        attr.name.startsWith('aria-')
      ) {
        if (!newComponent.hasAttribute(attr.name)) {
          newComponent.setAttribute(attr.name, attr.value);
        }
      }
    });

    currentComponent.parentNode.replaceChild(newComponent, currentComponent);

    refreshImpulseComponentList();
    initImpulse();

    if (focusInfo) {
      restoreFocus(newComponent, focusInfo);
    }
  }
}

export async function updateComponent(componentId: string, action: string, value?: string, focusInfo?: any)
{
  const states = collectStates(componentId);
  const payload: any = {
    id: componentId,
    action: action,
    states: states
  };

  if (focusInfo?.update) {
    payload.update = focusInfo.update;
  }

  if (value !== undefined) {
    payload.value = value;
  }

  payload._local_storage = collectLocalStorage();

  const componentElement = document.querySelector(`[data-impulse-id="${componentId}"]`);
  const slotAttr = componentElement?.getAttribute('data-slot');
  if (slotAttr) {
    payload.slot = atob(slotAttr);
  }

  try {
    const html = await sendUpdateRequest(payload, focusInfo);
    if (html) {
      await applyUpdate(componentId, html, focusInfo);
    }
  } catch (err) {
    console.error("Impulse error:", err);
  }
}

function getComponentIds(componentsOption?: string | string[]): string[]
{
  if (componentsOption) {
    return Array.isArray(componentsOption) ? componentsOption : [componentsOption];
  }

  return Array.from(document.querySelectorAll('[data-impulse-id]'))
    .map(el => el.getAttribute('data-impulse-id') as string)
    .filter(Boolean);
}

export async function emit(event: string, payload: any = {}, options: any = {}): Promise<any> {
  const components: string[] = getComponentIds(options.components);
  const local_storage: Record<string, string|null> = collectLocalStorage();
  const currentLang = document.documentElement.lang || null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {}),
  };

  if (currentLang) {
    headers['Accept-Language'] = currentLang;
  }

  const response = await fetch('/impulse.php', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      emit: event,
      payload: payload,
      components: components,
      _local_storage: local_storage,
      ...options.extra
    }),
    credentials: 'same-origin'
  });

  let result: any = {};

  try {
    result = await response.json();

    document.dispatchEvent(new CustomEvent('data-action-emit', {
      detail: {
        event: event,
        payload: payload,
      }
    }));

    if (result.updates) {
      result.updates.forEach((update: {component: string, html: string}): void => {
        applyUpdate(update.component, update.html);
      });

      // Rebind events
      initImpulse();
    }

    if (result.styles) {
      injectStyles(result.styles);
    }

    if (result.localStorage) {
      Object.keys(result.localStorage).forEach((key: string) => {
        const value = result.localStorage[key];
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      });
    }
  } catch (e) {}

  if (typeof options.callback === 'function') {
    options.callback(result);
  }

  return result;
}

export default function refreshImpulseComponentList(): void {
  window.__impulseComponents = new Set<string>(
    Array.from(document.querySelectorAll('[data-impulse-id]'))
      .map(el => el.getAttribute('data-impulse-id'))
      .filter((id): id is string => id !== null)
  );
}
