const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rota da API para consultar o banco de dados local
app.get('/api/produtos', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'produtos.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao ler o banco de dados." });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando localmente em http://localhost:${PORT}`);
});
