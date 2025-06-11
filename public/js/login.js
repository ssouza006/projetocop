
document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const nome = document.getElementById('username').value;
  const sala = document.getElementById('room').value;
  sessionStorage.setItem('username', nome);
  sessionStorage.setItem('room', sala);
  window.location.href = '/chat.html';
});
