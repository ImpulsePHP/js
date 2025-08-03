let socket: WebSocket | null = null;

function connect() {
  try {
    socket = new WebSocket('ws://localhost:1337');
  } catch (e) {
    console.warn('DevTools socket connection failed');
    socket = null;
    return;
  }
}

function send(data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

export function initDevTools() {
  if (typeof window === 'undefined') return;
  connect();

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const [input, init] = args;
    const method = init?.method || 'GET';
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const start = performance.now();
    const response = await originalFetch(...args);
    const end = performance.now();
    const log = {
      type: 'fetch',
      method,
      url,
      status: response.status,
      duration: Math.round(end - start)
    };
    send(log);
    return response;
  };

  if (window.Impulse && typeof window.Impulse.emitEvent === 'function') {
    const originalEmit = window.Impulse.emitEvent.bind(window.Impulse);
    window.Impulse.emitEvent = (event: string, payload: any) => {
      send({ type: 'event', event, payload });
      originalEmit(event, payload);
    };
  }
}

initDevTools();
