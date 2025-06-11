const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const db = require('./db');

app.use(express.static('public'));
app.use(express.json()); // para ler JSON no body

// Rotas de páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Socket.io
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ nome, sala }) => {
    socket.join(sala);
    socket.to(sala).emit('mensagem', `${nome} entrou na sala.`);
    socket.nome = nome;
    socket.sala = sala;
  });

  socket.on('mensagem', (msg) => {
    if (socket.sala && socket.nome) {
      const fullMsg = `${socket.nome}: ${msg}`;
      
      // Envia para todos da sala
      io.to(socket.sala).emit('mensagem', fullMsg);

      // Salva no banco
      db.run(`INSERT INTO mensagens (nome, sala, texto) VALUES (?, ?, ?)`,
        [socket.nome, socket.sala, msg],
        (err) => {
          if (err) console.error('Erro ao salvar mensagem:', err.message);
        });
    }
  });
});

// API REST - CRUD completo
app.get('/api/mensagens', (req, res) => {
  db.all('SELECT * FROM mensagens', (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.get('/api/mensagens/:id', (req, res) => {
  db.get('SELECT * FROM mensagens WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(row);
  });
});

app.post('/api/mensagens', (req, res) => {
  const { nome, sala, texto } = req.body;
  db.run('INSERT INTO mensagens (nome, sala, texto) VALUES (?, ?, ?)',
    [nome, sala, texto],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ id: this.lastID, nome, sala, texto });
    });
});

app.put('/api/mensagens/:id', (req, res) => {
  const { texto } = req.body;
  db.run('UPDATE mensagens SET texto = ? WHERE id = ?',
    [texto, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ atualizado: this.changes > 0 });
    });
});

app.delete('/api/mensagens/:id', (req, res) => {
  db.run('DELETE FROM mensagens WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ deletado: this.changes > 0 });
  });
});

// Start
http.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
