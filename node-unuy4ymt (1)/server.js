const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const db = require('./db');

app.use(express.static('public'));
app.use(express.json()); 

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
      db.run(`INSERT INTO mensagens (nome, sala, texto) VALUES (?, ?, ?)`,
        [socket.nome, socket.sala, msg],
        function (err) {
          if (err) {
            console.error('Erro ao salvar mensagem:', err.message);
          } else {
            io.to(socket.sala).emit('mensagem', {
              id: this.lastID,
              nome: socket.nome,
              texto: msg
            });
          }
        });
    }
  });

  socket.on('excluirMensagem', (idMsg) => {
    if (!socket.sala) return;
    db.run('DELETE FROM mensagens WHERE id = ?', [idMsg], function (err) {
      if (err) {
        console.error('Erro ao excluir mensagem:', err.message);
      } else if (this.changes > 0) {
        io.to(socket.sala).emit('mensagemExcluida', idMsg);
      }
    });
  });
});

// API REST 
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

// Rota para registrar usuário
app.post('/register', (req, res) => {
  const { nome, senha } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
  }

  db.get('SELECT * FROM usuarios WHERE nome = ?', [nome], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    db.run('INSERT INTO usuarios (nome, senha) VALUES (?, ?)', [nome, senha], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuário registrado com sucesso' });
    });
  });
});

// Rota para login
app.post('/login', (req, res) => {
  const { nome, senha } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ error: 'Nome e senha são obrigatórios' });
  }

  db.get('SELECT * FROM usuarios WHERE nome = ?', [nome], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row || row.senha !== senha) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    res.json({ message: 'Login realizado com sucesso' });
  });
});

// Start
http.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
