const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const userInput = document.getElementById('user');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && userInput.value) {
    socket.emit('message', { user: userInput.value, content: input.value });
    input.value = '';
  }
});

socket.on('init', (msgs) => {
  msgs.forEach(msg => addMessage(msg));
});

socket.on('message', (msg) => {
  addMessage(msg);
});

function addMessage(msg) {
  const el = document.createElement('div');
  el.innerHTML = `<strong>${msg.user}:</strong> ${msg.content}`;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}