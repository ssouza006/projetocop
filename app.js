require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const initDatabase = require('./src/database/initDB');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco de dados
initDatabase();

// Rotas
const authRoutes = require('./src/routes/authRoutes');
const placesRoutes = require('./src/routes/placesRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);

// Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Erro interno no servidor' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});