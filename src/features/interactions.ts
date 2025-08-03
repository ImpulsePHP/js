function queryAll(selector: string): HTMLElement[] {
  let elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    elements = elements.concat(
      Array.from(
        document.querySelectorAll<HTMLElement>(`[data-impulse-id="${id}"]`)
      )
    );
  }
  return Array.from(new Set(elements));
}

function queryOne(selector: string): HTMLElement | null {
  let element = document.querySelector<HTMLElement>(selector);
  if (!element && selector.startsWith('#')) {
    const id = selector.slice(1);
    element = document.querySelector<HTMLElement>(`[data-impulse-id="${id}"]`);
  }
  return element;
}

export function setupInteractions() {
  const clickHandler = (event: Event) => {
    const target = event.target as HTMLElement;
    const el = target.closest<HTMLElement>(
      '[data-toggle], [data-show], [data-hide], [data-close], [data-toggle-class], [data-scrollto]'
    );
    if (!el) return;

    if (el.dataset.toggle) {
      const selector = el.dataset.toggle;
      const group = el.getAttribute('data-toggle-group');
      if (group) {
        document
          .querySelectorAll<HTMLElement>(`[data-toggle][data-toggle-group="${group}"]`)
          .forEach(other => {
            if (other === el) return;
            const s = other.getAttribute('data-toggle');
            if (s) {
              queryAll(s).forEach(t => {
                (t as HTMLElement).style.display = 'none';
              });
            }
          });
      }
      queryAll(selector).forEach(t => {
        const element = t as HTMLElement;
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (el.dataset.show) {
      const selector = el.dataset.show;
      queryAll(selector).forEach(t => {
        (t as HTMLElement).style.display = 'block';
      });
    }

    if (el.dataset.hide) {
      const selector = el.dataset.hide;
      queryAll(selector).forEach(t => {
        (t as HTMLElement).style.display = 'none';
      });
    }

    if (el.dataset.close) {
      if (el.dataset.close === 'parent') {
        const parent = el.parentElement as HTMLElement | null;
        if (parent) parent.style.display = 'none';
      } else {
        queryAll(el.dataset.close!).forEach(t => {
          (t as HTMLElement).style.display = 'none';
        });
      }
    }

    if (el.dataset.toggleClass) {
      const cls = el.dataset.toggleClass;
      const selector = el.getAttribute('data-target');
      if (selector) {
        queryAll(selector).forEach(t => {
          t.classList.toggle(cls);
        });
      }
    }

    if (el.dataset.scrollto) {
      const selector = el.dataset.scrollto;
      const targetEl = queryOne(selector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const clickOutsideHandler = (event: Event) => {
    const target = event.target as HTMLElement;

    document.querySelectorAll<HTMLElement>('[data-close-outside]').forEach(el => {
      if (el.style.display === 'none') return;

      const selector = el.getAttribute('data-close-outside');
      const ignoreSelector = el.getAttribute('data-close-outside-ignore');
      const emitAction = el.getAttribute('data-close-outside-emit');
      const componentAction = el.getAttribute('data-close-outside-action');

      if (ignoreSelector && target.closest(ignoreSelector)) {
        return;
      }

      let shouldClose = false;

      if (selector && selector !== 'self') {
        const targetElement = queryOne(selector);
        if (targetElement && !targetElement.contains(target)) {
          shouldClose = true;
        }
      }
      else if (!el.contains(target)) {
        shouldClose = true;
      }

      if (shouldClose) {
        el.style.display = 'none';

        if (componentAction) {
          const parentComponent = el.closest('[data-impulse-id]');

          if (parentComponent) {
            const componentId = parentComponent.getAttribute('data-impulse-id');

            if (componentId) {
              const actionMatch = componentAction.match(/^(\w+)(?:\((.*)\))?$/);

              if (actionMatch) {
                const [, methodName, params] = actionMatch;
                const paramValue = params ? params.replace(/['"]/g, '') : undefined;

                // @ts-ignore
                if (window.Impulse?.updateComponent) {
                  // @ts-ignore
                  window.Impulse.updateComponent(componentId, methodName, paramValue);
                }
              }
            }
          }
        }

        if (emitAction) {
          const parentComponent = el.closest('[data-impulse-id]');

          if (parentComponent && emitAction.includes('(')) {
            const componentId = parentComponent.getAttribute('data-impulse-id');
            const actionMatch = emitAction.match(/^(\w+)\((.*)\)$/);

            if (actionMatch && componentId) {
              const [, methodName, params] = actionMatch;
              const paramValue = params ? params.replace(/['"]/g, '') : undefined;

              // @ts-ignore
              if (window.Impulse?.updateComponent) {
                // @ts-ignore
                window.Impulse.updateComponent(componentId, methodName, paramValue);
              }
            }
          } else {
            // @ts-ignore
            if (window.Impulse?.emit) {
              // @ts-ignore
              window.Impulse.emit(emitAction, {
                element: el,
                target: target,
                selector: selector
              });
            }
          }
        }
      }
    });
  };

  document.addEventListener('click', clickHandler);
  document.addEventListener('click', clickOutsideHandler);

  document.querySelectorAll<HTMLElement>('[data-if], [data-unless]').forEach(el => {
    const ifAttr = el.getAttribute('data-if');
    const unlessAttr = el.getAttribute('data-unless');
    const expression = ifAttr || unlessAttr;
    if (!expression) return;
    const [selector, prop] = expression.split(':');
    const ref = queryOne(selector) as any;
    if (!ref) return;
    const update = () => {
      const propValue = !!ref[prop as keyof typeof ref];
      const show = ifAttr ? propValue : !propValue;
      (el as HTMLElement).style.display = show ? 'block' : 'none';
    };
    ref.addEventListener('change', update);
    update();
  });
}
