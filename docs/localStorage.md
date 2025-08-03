# Local Storage Sync

Impulses can keep your server and other browser tabs updated with changes made
to `localStorage`.

## Setup

The feature is enabled automatically when you include the main script. When the
page loads `localStorage` is synchronised with the backend. Any subsequent
changes are exported in the background.

## API

### forceSyncLocalStorage()

Immediately sends the current `localStorage` contents to the server and waits for
the response.

```javascript
import { forceSyncLocalStorage } from 'impulses';
await forceSyncLocalStorage();
```

### Events

A custom `impulse-localstorage` event is dispatched on `document` whenever an
item is added, removed or changed. Listen to it to react to updates from other
tabs:

```javascript
document.addEventListener('impulse-localstorage', e => {
  console.log('Storage changed', e.detail.key, e.detail.value);
});
```
