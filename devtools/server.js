const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const clients = new Set();

function decodeMessage(buffer) {
  const secondByte = buffer[1];
  let length = secondByte & 0x7f;
  let offset = 2;
  if (length === 126) {
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    length = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }
  const mask = buffer.slice(offset, offset + 4);
  offset += 4;
  const data = buffer.slice(offset, offset + length);
  const unmasked = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    unmasked[i] = data[i] ^ mask[i % 4];
  }
  return unmasked.toString('utf8');
}

function sendMessage(socket, message) {
  const msg = Buffer.from(message);
  const frame = Buffer.alloc(2 + msg.length);
  frame[0] = 0x81; // fin + text
  frame[1] = msg.length;
  msg.copy(frame, 2);
  socket.write(frame);
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const html = fs.readFileSync(__dirname + '/public/index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(html);
  } else if (req.url === '/app.js') {
    const js = fs.readFileSync(__dirname + '/public/app.js');
    res.writeHead(200, {'Content-Type': 'application/javascript'});
    res.end(js);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.on('upgrade', (req, socket) => {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.destroy();
    return;
  }
  const key = req.headers['sec-websocket-key'];
  const hash = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${hash}\r\n` +
    '\r\n'
  );

  clients.add(socket);

  socket.on('data', (buffer) => {
    const message = decodeMessage(buffer);
    for (const client of clients) {
      if (client !== socket) sendMessage(client, message);
    }
  });

  socket.on('close', () => clients.delete(socket));
});

server.listen(1337, () => {
  console.log('Impulse DevTools running on http://localhost:1337');
});
