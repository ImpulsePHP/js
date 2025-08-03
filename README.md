# Impulses

**Impulses** is the official JavaScript engine for the [ImpulsePHP](https://github.com/impuslephp/impulsephp) framework.
It adds dynamic behaviour to server rendered PHP components without any external dependency or JavaScript framework.

---

## 🚀 Features

- ⚡ Automatic DOM handling through `data-action-*` attributes
- 🔁 Partial updates via AJAX
- 🧠 Two way binding between PHP components and the DOM
- 📡 Dynamic action calls (`data-action-click`, `data-action-submit`, ...)
- ♻️ Smart diffing to minimise reloads
- 🧩 Extremely simple to use: a single `<script>` tag

---

## 🔧 Using in an ImpulsePHP project

Simply include the script in your layout or HTML page:
```html
<script src="/assets/impulses/dist/impulse.js" type="module"></script>
```

## 🛠 Development

To build continuously during development:
```shell
npm run watch
```

### Listening to localStorage changes

Impulses dispatches an `impulse-localstorage` event whenever `localStorage` is modified (including from other tabs). Subscribe to this event to update your components in real time:

```javascript
window.addEventListener('impulse-localstorage', (e) => {
  const { key, value } = e.detail;
  console.log('Storage key changed:', key, value);
});
```

### Documentation

Detailed guides for all features are available in the [docs](docs/README.md) directory. This includes the router, event system, local storage synchronisation and interactions without JavaScript.

### Running tests

Install dependencies and run:
```shell
npm test
```

### DevTools (experimental)

A minimal development tool is included to inspect framework activity. Start the server:

```bash
node devtools/server.js
```

Then include `dist/impulse.devtools.js` in your page after `impulse.js` while developing:

```html
<script src="/assets/impulses/dist/impulse.js" type="module"></script>
<script src="/assets/impulses/dist/impulse.devtools.js" type="module"></script>
```

Visit [http://localhost:1337](http://localhost:1337) to view events and network requests in real time.
