(function(){
  const ws = new WebSocket('ws://' + location.host);
  const list = document.getElementById('events');
  ws.onmessage = (e) => {
    const li = document.createElement('li');
    li.textContent = e.data;
    if (list.firstChild) {
      list.insertBefore(li, list.firstChild);
    } else {
      list.appendChild(li);
    }
  };
})();
