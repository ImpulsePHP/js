import { updateComponent } from "./ajax";
import { getUniqueSelector } from "../utils/dom";
import { characterCounter } from "../features/characterCounter";

const debounceMap: WeakMap<Element, ReturnType<typeof setTimeout>> = new WeakMap();
const throttleMap: WeakMap<Element, number> = new WeakMap();

function performAction(el: Element, action: () => Promise<any> | void) {
  const debounceDelay = parseInt((el as HTMLElement).dataset.actionDebounce || '0', 10);
  const throttleDelay = parseInt((el as HTMLElement).dataset.actionThrottle || '0', 10);

  if (debounceDelay > 0) {
    clearTimeout(debounceMap.get(el));
    const timer = setTimeout(() => runAction(el, action, throttleDelay), debounceDelay);
    debounceMap.set(el, timer);
    return;
  }

  runAction(el, action, throttleDelay);
}

function runAction(el: Element, action: () => Promise<any> | void, throttleDelay: number) {
  const last = throttleMap.get(el) || 0;
  const now = Date.now();
  if (throttleDelay > 0 && now - last < throttleDelay) {
    return;
  }

  throttleMap.set(el, now);

  // Execute the action
  const result = action();

  // Handle promises if necessary
  if (result && typeof result.then === 'function') {
    result.catch((error: any) => {
      console.error('❌ Action failed:', error);
    });
  }
}

function isNativeActionable(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === 'button' || tag === 'a' || tag === 'form' || tag === 'select' || tag === 'textarea') return true;
  if (tag === 'input') return true;
  if ((el as HTMLElement).hasAttribute('role') && (el as HTMLElement).getAttribute('role') === 'button') return true;
  if ((el as HTMLElement).hasAttribute('tabindex')) return true;
  return false;
}

function findActionableDescendant(el: Element): HTMLElement | null {
  const selector = 'button, a, input[type="button"], input[type="submit"], input[type="image"], [role="button"], [tabindex]';
  return el.querySelector<HTMLElement>(selector);
}

function propagateDataActionAttributes(el: Element): void {
  const attrs = Array.from(el.attributes).filter(a => a.name.startsWith('data-action-'));
  if (attrs.length === 0) return;
  if (isNativeActionable(el)) return; // already on an actionable element

  const target = findActionableDescendant(el);
  // If no native actionable descendant, try to find a child component root
  let finalTarget = target;
  if (!finalTarget) {
    const childComponent = el.querySelector('[data-impulse-id]') as HTMLElement | null;
    if (childComponent) {
      finalTarget = childComponent;
    }
  }
  if (!finalTarget) return;

  attrs.forEach(a => {
    if (!finalTarget!.hasAttribute(a.name)) {
      finalTarget!.setAttribute(a.name, a.value);
      // remove from wrapper to avoid double-binding when clicking the inner element
      try {
        el.removeAttribute(a.name);
      } catch (e) {}
    }
  });
}

function propagateAllActionAttributes() {
  // Find all elements that declare data-action-* and try to propagate to inner actionable element
  const nodes = document.querySelectorAll('[data-action-click], [data-action-input], [data-action-change], [data-action-blur], [data-action-keydown], [data-action-submit], [data-action-emit]');
  nodes.forEach((el) => propagateDataActionAttributes(el));
}

function getComponentChainFromElement(el: Element): string[] {
  const chain: string[] = [];
  let node: Element | null = el.closest('[data-impulse-id]');
  while (node) {
    const id = node.getAttribute('data-impulse-id');
    if (id && !chain.includes(id)) {
      chain.push(id);
    }
    node = node.parentElement ? node.parentElement.closest('[data-impulse-id]') : null;
  }
  return chain;
}

async function attemptActionOnChain(componentIds: string[], action: string, value?: any, options?: any): Promise<any> {
  if (!componentIds || componentIds.length === 0) return Promise.reject(new Error('No component id'));

  for (let i = 0; i < componentIds.length; i++) {
    const id = componentIds[i];
    try {
      return await updateComponent(id, action, value, options);
    } catch (err: any) {
      const errMsg = typeof err === 'string' ? err : (err && (err.message || err.error)) ? (err.message || err.error) : '';
      // If error is action/method not found, try next component in chain
      if (/non trouv[eé]e|not found|introuvable/i.test(errMsg)) {
        // continue to next
        if (i === componentIds.length - 1) {
          // last, rethrow
          throw err;
        }
        continue;
      }
      // other errors -> rethrow immediately
      throw err;
    }
  }
}

function bindClickEvents() {
  document.querySelectorAll<HTMLElement>("[data-action-click]").forEach((el) => {
    if ((el as any)._impulseBoundClick) return;
    (el as any)._impulseBoundClick = true;

    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const method = el.getAttribute("data-action-click");
      const parent = el.closest("[data-impulse-id]");
      if (!method || !parent) return;

      const componentId = parent.getAttribute("data-impulse-id");
      let update = el.getAttribute("data-action-update") || undefined;

      performAction(el, () => {
        const chain = getComponentChainFromElement(el);
        return attemptActionOnChain(chain, method!, undefined, { update });
      });
    });
  });
}

function bindInputEvents() {
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-action-input]").forEach((el) => {
    if ((el as any)._impulseBoundInput) return;
    (el as any)._impulseBoundInput = true;

    el.addEventListener("input", (event) => {
      const method = el.getAttribute("data-action-input");
      const parent = el.closest("[data-impulse-id]");
      if (!method || !parent) return;
      const componentId = parent.getAttribute("data-impulse-id");
      const value = (event.target as HTMLInputElement).value;

      let update = el.getAttribute("data-action-update") || undefined;
      const activeElement = document.activeElement as HTMLInputElement;
      const isCurrentInput = activeElement === el;
      const selectionStart = isCurrentInput ? activeElement.selectionStart : null;
      const selectionEnd = isCurrentInput ? activeElement.selectionEnd : null;

      performAction(el, () => {
        const chain = getComponentChainFromElement(el);
        return attemptActionOnChain(chain, method!, value, {
          activeElementId: isCurrentInput && activeElement.id?.trim() !== '' ? activeElement.id : null,
          activeElementSelector: isCurrentInput ? getUniqueSelector(activeElement) : null,
          selectionStart,
          selectionEnd,
          caretPosition: selectionStart,
          update,
        });
      });
    });
  });
}

function bindChangeEvents() {
  document.querySelectorAll<HTMLSelectElement | HTMLInputElement>("[data-action-change]").forEach((el) => {
    if ((el as any)._impulseBoundChange) return;
    (el as any)._impulseBoundChange = true;

    el.addEventListener("change", (event) => {
      const method = el.getAttribute("data-action-change");
      const parent = el.closest("[data-impulse-id]");
      if (!method || !parent) return;
      const componentId = parent.getAttribute("data-impulse-id");
      const value = (event.target as HTMLSelectElement | HTMLInputElement).value;
      let update = el.getAttribute("data-action-update") || undefined;

      const selectedIndex = (el as HTMLSelectElement).selectedIndex !== undefined
        ? (el as HTMLSelectElement).selectedIndex
        : -1;

      performAction(el, () => {
        const chain = getComponentChainFromElement(el);
        return attemptActionOnChain(chain, method!, value, {
          activeElementId: el.id,
          activeElementSelector: getUniqueSelector(el),
          selectedIndex: selectedIndex,
          update,
        });
      });
    });
  });
}

function bindBlurEvents() {
  document.querySelectorAll<HTMLElement>("[data-action-blur]").forEach((el) => {
    if ((el as any)._impulseBoundBlur) return;
    (el as any)._impulseBoundBlur = true;

    el.addEventListener("blur", (event) => {
      const method = el.getAttribute("data-action-blur");
      const parent = el.closest("[data-impulse-id]");
      if (!method || !parent) return;
      const componentId = parent.getAttribute("data-impulse-id");
      const value = (event.target as HTMLInputElement).value;
      let update = el.getAttribute("data-action-update") || undefined;

      performAction(el, () => {
        const chain = getComponentChainFromElement(el);
        return attemptActionOnChain(chain, method!, value, { update });
      });
    });
  });
}

function bindKeyDownEvents() {
  document.querySelectorAll<HTMLElement>("[data-action-keydown]").forEach((el) => {
    if ((el as any)._impulseBoundKeyDown) return;
    (el as any)._impulseBoundKeyDown = true;

    el.addEventListener("keydown", (event: KeyboardEvent) => {
      const method = el.getAttribute("data-action-keydown");
      const parent = el.closest("[data-impulse-id]");
      if (!method || !parent) return;
      const componentId = parent.getAttribute("data-impulse-id");
      let update = el.getAttribute("data-action-update") || undefined;
      const key = event.key;

      performAction(el, () => {
        const chain = getComponentChainFromElement(el);
        return attemptActionOnChain(chain, `${method}('${key}')`, undefined, { update });
      });
    });
  });
}

function bindSubmitEvents() {
  document.querySelectorAll<HTMLFormElement>("[data-action-submit]").forEach((form) => {
    if ((form as any)._impulseBoundSubmit) return;
    (form as any)._impulseBoundSubmit = true;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const method = form.getAttribute("data-action-submit");
      const componentId = form.closest("[data-impulse-id]")?.getAttribute("data-impulse-id");
      if (!method || !componentId) return;
      let update = form.getAttribute("data-action-update") || undefined;
      performAction(form, () => {
        const chain = getComponentChainFromElement(form);
        return attemptActionOnChain(chain, method!, undefined, { update });
      });
    });
  });
}

function bindEmitEvents() {
  document.querySelectorAll<HTMLElement>("[data-action-emit]").forEach((el) => {
    if ((el as any)._impulseBoundEmit) return;
    (el as any)._impulseBoundEmit = true;

    const isForm = el.tagName.toLowerCase() === "form";
    const eventName = isForm ? "submit" : "click";

    el.addEventListener(eventName, (event) => {
      event.preventDefault();
      const emitEvent = el.getAttribute("data-action-emit");
      if (!emitEvent) return;

      let payload: Record<string, any> = {};

      if (isForm) {
        const formData = new FormData(el as HTMLFormElement);
        formData.forEach((v, k) => (payload[k] = v));
      } else {
        const attrPayload = el.getAttribute("data-payload");
        if (attrPayload) {
          try {
            payload = JSON.parse(attrPayload);
          } catch (e) {
            payload = { value: attrPayload };
          }
        }
      }

      performAction(el, () =>
        // @ts-ignore
        Impulse.emit(emitEvent, payload, {
          callback: (result: any) => {
            if (typeof (el as any)._onImpulseResult === "function") {
              (el as any)._onImpulseResult(result);
            } else {
              el.dispatchEvent(
                new CustomEvent("data-emit-result", {
                  detail: result,
                  bubbles: true,
                })
              );
            }
          },
        })
      );
    });
  });
}

export function bindImpulseEvents() {
  // Propagate data-action-* attributes from custom wrapper components to their
  // inner actionable descendants so attributes work regardless of component
  // implementation (current and future components).
  propagateAllActionAttributes();
  bindClickEvents();
  bindInputEvents();
  bindChangeEvents();
  bindBlurEvents();
  bindKeyDownEvents();
  bindSubmitEvents();
  bindEmitEvents();
  characterCounter.init();
}
