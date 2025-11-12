let keys = []; // simpan sementara

function generateKey() {
  const key = Math.random().toString(36).substring(2, 10).toUpperCase();
  keys.push(key);

  const list = document.getElementById('key-list');
  const li = document.createElement('li');
  li.textContent = key;
  list.appendChild(li);
}
