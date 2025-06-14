const socket = io();
const nome = sessionStorage.getItem('username');
const sala = sessionStorage.getItem('room');

// Atualiza o nome da sala na tela
document.getElementById('room-name').innerText = "Você está em: " + sala;

// Envia para o servidor que o usuário entrou na sala
socket.emit('joinRoom', { nome, sala });

// Pegando os elementos do HTML
const form = document.getElementById('chat-form');
const input = document.getElementById('msg');
const messages = document.getElementById('chat-messages');

// Quando o usuário envia uma mensagem
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value.trim()) {
    socket.emit('mensagem', input.value);
    input.value = '';
  }
});

// Recebendo mensagem do servidor
socket.on('mensagem', function(msg) {
  const div = document.createElement('div');
  div.classList.add('message');

  const splitIndex = msg.indexOf(':');
  if (splitIndex !== -1) {
    const remetente = msg.substring(0, splitIndex);
    const texto = msg.substring(splitIndex + 1).trim();

    // Se a mensagem for do próprio usuário, adiciona classe 'self', senão 'other'
    div.classList.add(remetente === nome ? 'self' : 'other');

    if (remetente === nome) {
      div.innerHTML = `
        <p class="meta">
          ${remetente}
          <button class="btn-excluir" title="Excluir mensagem">×</button>
        </p>
        <p class="text">${texto}</p>
      `;
    } else {
      div.innerHTML = `
        <p class="meta">${remetente}</p>
        <p class="text">${texto}</p>
      `;
    }
  } else {
    div.textContent = msg;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// Evento para excluir mensagem quando clicar no botão (apaga só no cliente)
messages.addEventListener('click', function(event) {
  if (event.target.classList.contains('btn-excluir')) {
    const messageDiv = event.target.closest('.message');
    if (messageDiv) {
      messageDiv.remove();
    }
  }
});

document.getElementById('leave-btn').addEventListener('click', () => {
  sessionStorage.clear();
  window.location.href = '/'; /
});
