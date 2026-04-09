import refreshImpulseComponentList, { updateComponent } from "./ajax";
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
      const errCode = error && (error.code || (error.data && error.data.code)) ? (error.code || error.data.code) : null;
      // action_not_found is handled by the caller or by explicit targeting rules.
      if (errCode === 'action_not_found') return;
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

  finalTarget.setAttribute('data-action-origin', 'propagated');
}

function propagateAllActionAttributes() {
  // Find all elements that declare data-action-* and try to propagate to inner actionable element
  const nodes = document.querySelectorAll('[data-action-click], [data-action-input], [data-action-change], [data-action-blur], [data-action-keydown], [data-action-submit], [data-action-emit]');
  nodes.forEach((el) => propagateDataActionAttributes(el));
}

function toKebabCase(value: string): string {
  return value
    .replace(/[\s_]+/g, '-')
    .replace(/(?!^)([A-Z])/g, '-$1')
    .replace(/--+/g, '-')
    .toLowerCase();
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

function resolveExplicitComponentId(value: string, chain: string[]): string | null {
  const raw = value.trim();
  if (!raw) {
    return null;
  }

  const normalized = toKebabCase(raw);
  const candidates = Array.from(new Set([
    raw,
    raw.toLowerCase(),
    normalized,
    normalized.endsWith('-component') ? normalized : `${normalized}-component`,
  ]));

  const matchesCandidate = (id: string) => candidates.some((candidate) =>
    id === candidate || id.startsWith(`${candidate}_`)
  );

  for (const id of chain) {
    if (matchesCandidate(id)) {
      return id;
    }
  }

  const allIds = Array.from(document.querySelectorAll('[data-impulse-id]'))
    .map((node) => node.getAttribute('data-impulse-id'))
    .filter((id): id is string => !!id);

  return allIds.find((id) => matchesCandidate(id)) || null;
}

function resolveActionComponentIds(el: Element): string[] {
  const chain = getComponentChainFromElement(el);
  if (chain.length === 0) {
    return [];
  }

  const explicitTarget = (el as HTMLElement).getAttribute('data-action-call');
  if (explicitTarget) {
    const componentId = resolveExplicitComponentId(explicitTarget, chain);
    if (!componentId) {
      throw new Error(`Component target not found for data-action-call="${explicitTarget}"`);
    }

    return [componentId];
  }

  if ((el as HTMLElement).getAttribute('data-action-origin') === 'propagated') {
    return chain;
  }

  return [chain[0]];
}

async function callAction(el: Element, action: string, value?: any, options?: any): Promise<any> {
  try {
    refreshImpulseComponentList();
  } catch (e) {}

  const componentIds = resolveActionComponentIds(el);
  if (componentIds.length === 0) {
    return Promise.reject(new Error('No component id'));
  }

  if ((window as any).__impulseDebug) {
    console.debug('[impulse] calling action on component ids:', componentIds, 'action:', action);
  }

  for (let index = 0; index < componentIds.length; index += 1) {
    const componentId = componentIds[index];

    try {
      return await updateComponent(componentId, action, value, options);
    } catch (error: any) {
      const errCode = error && (error.code || (error.data && error.data.code)) ? (error.code || error.data.code) : null;

      if (errCode === 'action_not_found' && index < componentIds.length - 1) {
        continue;
      }

      throw error;
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

      let update = el.getAttribute("data-action-update") || undefined;

      performAction(el, () => {
        return callAction(el, method!, undefined, { update });
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
      const value = (event.target as HTMLInputElement).value;

      let update = el.getAttribute("data-action-update") || undefined;
      const activeElement = document.activeElement as HTMLInputElement;
      const isCurrentInput = activeElement === el;
      const selectionStart = isCurrentInput ? activeElement.selectionStart : null;
      const selectionEnd = isCurrentInput ? activeElement.selectionEnd : null;

      performAction(el, () => {
        return callAction(el, method!, value, {
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
      const value = (event.target as HTMLSelectElement | HTMLInputElement).value;
      let update = el.getAttribute("data-action-update") || undefined;

      const selectedIndex = (el as HTMLSelectElement).selectedIndex !== undefined
        ? (el as HTMLSelectElement).selectedIndex
        : -1;

      performAction(el, () => {
        return callAction(el, method!, value, {
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
      const value = (event.target as HTMLInputElement).value;
      let update = el.getAttribute("data-action-update") || undefined;

      performAction(el, () => {
        return callAction(el, method!, value, { update });
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
      let update = el.getAttribute("data-action-update") || undefined;
      const key = event.key;

      performAction(el, () => {
        return callAction(el, `${method}('${key}')`, undefined, { update });
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
        return callAction(form, method!, undefined, { update });
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
