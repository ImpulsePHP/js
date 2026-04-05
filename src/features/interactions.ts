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
  // initialize portal elements moved to body to avoid clipping inside overflow containers
  function positionPortal(el: HTMLElement) {
    const anchorSel = el.getAttribute('data-portal-anchor');
    const align = el.getAttribute('data-portal-align') || 'bottom-left';
    const minWidth = el.getAttribute('data-portal-min-width');
    const anchor = anchorSel ? queryOne(anchorSel) as HTMLElement | null : null;
    if (!anchor) return;

    const aRect = anchor.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let left = aRect.left + scrollX;
    let top = aRect.bottom + scrollY;

    if (align === 'top-left') {
      top = aRect.top + scrollY - el.offsetHeight;
      left = aRect.left + scrollX;
    } else if (align === 'top-right') {
      top = aRect.top + scrollY - el.offsetHeight;
      left = aRect.right + scrollX - el.offsetWidth;
    } else if (align === 'bottom-right') {
      top = aRect.bottom + scrollY;
      left = aRect.right + scrollX - el.offsetWidth;
    } else if (align === 'left') {
      top = aRect.top + scrollY;
      left = aRect.left + scrollX - el.offsetWidth;
    } else if (align === 'right') {
      top = aRect.top + scrollY;
      left = aRect.right + scrollX;
    }

    el.style.position = 'absolute';
    el.style.left = `${Math.max(0, Math.round(left))}px`;
    el.style.top = `${Math.max(0, Math.round(top))}px`;
    if (minWidth === 'anchor') {
      el.style.minWidth = `${Math.round(aRect.width)}px`;
    }
  }

  function repositionAll() {
    document.querySelectorAll<HTMLElement>('[data-portal-target="body"]').forEach(el => {
      if (el.style.display !== 'none') {
        positionPortal(el);
      }
    });
  }

  function initPortals() {
    document.querySelectorAll<HTMLElement>('[data-portal-target="body"]').forEach(el => {
      if (!el.dataset.portalMoved) {
        // move to body to avoid clipping inside overflow containers
        document.body.appendChild(el);
        el.dataset.portalMoved = '1';
        el.style.position = 'absolute';
      }
    });
    window.addEventListener('resize', repositionAll);
    window.addEventListener('scroll', repositionAll, true);
    // initial positioning
    setTimeout(repositionAll, 50);
  }
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
        // if element uses portal, ensure it's positioned
        if (element.getAttribute('data-portal-target') === 'body') {
          initPortals();
          positionPortal(element);
        }
      });
    }

    if (el.dataset.show) {
      const selector = el.dataset.show;
      queryAll(selector).forEach(t => {
        (t as HTMLElement).style.display = 'block';
        const element = t as HTMLElement;
        if (element.getAttribute('data-portal-target') === 'body') {
          initPortals();
          positionPortal(element);
        }
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

  // handle data-print attribute -> window.print()
  document.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const el = t.closest('[data-print]') as HTMLElement | null;
    if (!el) return;
    window.print();
  });

  // handle input actions like data-action-input="method(this.value)"
  document.addEventListener('input', (ev) => {
    const t = ev.target as HTMLElement;
    const el = t.closest<HTMLElement>('[data-action-input]');
    if (!el) return;
    const expr = el.getAttribute('data-action-input');
    if (!expr) return;

    const match = expr.match(/^(\w+)(?:\((.*)\))?$/);
    if (!match) return;
    const [, methodName, params] = match;
    let paramValue: any = undefined;
    if (params) {
      // support 'this.value' placeholder
      if (params.includes('this.value')) {
        // @ts-ignore
        paramValue = (t as any).value;
      } else {
        paramValue = params.replace(/['"]/g, '');
      }
    }

    const parentComponent = el.closest('[data-impulse-id]');
    if (!parentComponent) return;
    const componentId = parentComponent.getAttribute('data-impulse-id');
    if (!componentId) return;
    // @ts-ignore
    if (window.Impulse?.updateComponent) {
      // @ts-ignore
      window.Impulse.updateComponent(componentId, methodName, paramValue);
    }
  });

  // initialize portal elements on setup
  initPortals();

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
