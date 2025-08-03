# Events

Impulses exposes a lightweight event system through `window.Impulse`. You can
subscribe to custom events dispatched by your PHP components and emit your own
from the client.

## Listening to events

```javascript
window.Impulse.on('user:logged-in', payload => {
  console.log('User logged in:', payload);
});
```

To remove a listener call `off` with the same callback:

```javascript
const handler = data => console.log(data);
window.Impulse.on('cart:updated', handler);
window.Impulse.off('cart:updated', handler);
```

## Emitting events

Use `Impulse.emit(event, payload)` to dispatch an event both on the client and to
the server:

```javascript
window.Impulse.emit('profile:update', { name: 'John' });
```

When used with server-side components the payload is sent to the corresponding
PHP handler. The built-in router also emits `impulse:page-loaded` and
`impulse:page-navigated` as described in [Router](router.md).
