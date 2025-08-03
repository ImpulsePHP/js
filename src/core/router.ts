import refreshImpulseComponentList from './ajax';
import { collectLocalStorage, exportLocalStorageToBackend } from '../features/localStorage';

(() => {
  function fetchPage(url: string, push: boolean): void {
    const startTime = performance.now();
    let responseSize = 0;
    const currentLang = document.documentElement.lang || null;

    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    };

    if (currentLang) {
      headers['Accept-Language'] = currentLang;
    }

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        _local_storage: collectLocalStorage(),
        _locale: currentLang
      })
    })
      .then(async response => {
        const contentType = response.headers.get('Content-Type') || '';

        if (contentType.includes('application/json')) {
          const json = await response.json();

          if (json.redirect) {
            window.location.replace(json.redirect);
            return Promise.reject('ImpulseRedirect');
          }

          if (json.redirect === false || !response.ok) {
            return Promise.reject('ImpulseBlocked');
          }

          console.warn('Unrecognized JSON:', json);
          return '';
        }

        if (!response.ok) {
          return Promise.reject('HttpError');
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          responseSize = parseInt(contentLength, 10);
        }

        return response.text();
      })
      .then(html => {
        const endTime = performance.now();
        const loadTime = Math.round(endTime - startTime);

        if (responseSize === 0) {
          responseSize = new Blob([html]).size;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        if (doc.head) {
          const allowedTags = ['META', 'LINK', 'TITLE', 'SCRIPT'];

          const newHeadElements = Array.from(doc.head.children)
            .filter(child => allowedTags.includes(child.tagName));

          const bodyChildren = Array.from(document.body.children);
          bodyChildren.forEach(el => {
            if (
              allowedTags.includes(el.tagName) &&
              newHeadElements.some(newEl => newEl.isEqualNode(el))
            ) {
              el.remove();
            }
          });

          const currentHeadElements = Array.from(document.head.children)
            .filter(el => el.hasAttribute('data-persistent'));

          const mergedHead = [...currentHeadElements, ...newHeadElements];
          document.head.innerHTML = '';
          mergedHead.forEach(el => {
            document.head.appendChild(el.cloneNode(true));
          });
        }

        const newApp = doc.querySelector('#app');
        const currentApp = document.querySelector('#app');

        if (newApp && currentApp) {
          currentApp.replaceWith(newApp);
        } else {
          console.warn('Router: unable to find #app');
        }

        refreshImpulseComponentList();

        import('./bind').then(module => {
          module.bindImpulseEvents();
        });

        if (push) {
          history.pushState(null, '', url);
        }
      })
      .catch(err => {
        if (err === 'ImpulseRedirect') return;
        if (err === 'ImpulseBlocked') return;
        if (err === 'HttpError') return;

        console.error('Failed to fetch page:', err);
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    exportLocalStorageToBackend();

    window.dispatchEvent(new CustomEvent('impulse:page-loaded', {
      detail: { url: window.location.href, route: window.location.pathname }
    }));
  });

  // Intercept all clicks on <a data-router>
  document.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as Element;
    const link = target.closest('a') as HTMLAnchorElement | null;
    if (!link) return;

    if (link.getAttribute('data-router')) {
      return;
    }

    event.preventDefault();
    fetchPage(link.href, true);
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    fetchPage(window.location.href, false);
  });
})();
