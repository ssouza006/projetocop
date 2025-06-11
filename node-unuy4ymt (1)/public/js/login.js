const form = document.getElementById('auth-form');
const messageP = document.getElementById('message');

form.addEventListener('submit', e => {
  e.preventDefault();

  const nome = document.getElementById('username').value.trim();
  const sala = document.getElementById('room').value;

  if (!nome || !sala) {
    messageP.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  sessionStorage.setItem('username', nome);
  sessionStorage.setItem('room', sala);

  window.location.href = '/chat.html';
});
