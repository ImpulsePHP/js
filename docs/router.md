# Router

The router enables seamless navigation without full page reloads. When a link
includes `data-router`, Impulses fetches the target URL via `fetch`, swaps
in the returned HTML and updates the browser history.

```html
<a href="/about" data-router>About</a>
```

## How it works

1. Links marked with `data-router` are intercepted.
2. The page is requested through AJAX. The `#app` element in the response
   replaces the existing one in the DOM.
3. Persistent `<meta>`, `<link>`, `<title>` and `<script>` tags are kept to
   avoid duplicate elements.
4. `history.pushState()` updates the URL so back/forward buttons continue to
   work.

## Emitted events

- `impulse:page-loaded` – dispatched on `DOMContentLoaded` with the current URL
  and route path.
- `impulse:page-navigated` – fired after each AJAX navigation with metrics such
  as load time and response size.

Listen to these events if you need to track page views or hook into navigation:

```javascript
window.addEventListener('impulse:page-navigated', (e) => {
  const { url, loadTime } = e.detail;
  console.log('Navigated to', url, 'in', loadTime, 'ms');
});
```
