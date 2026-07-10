require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const produtosRoutes = require('./routes/produtos');
const vendasRoutes = require('./routes/vendas');
const comandasRoutes = require('./routes/comandas');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/produtos', produtosRoutes);
app.use('/vendas', vendasRoutes);
app.use('/comandas', comandasRoutes);

app.get('/', (req, res) => {
    res.json({
        sistema: 'Seu Antônio Spettus',
        backend: 'online'
    });
});

app.get('/teste-banco', async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT NOW() AS horario'
        );

        res.json({
            banco: 'conectado',
            horario: resultado.rows[0].horario
        });
    } catch (erro) {
        console.error('Erro no banco:', erro);

        res.status(500).json({
            banco: 'erro',
            mensagem: erro.message
        });
    }
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await db.query('SELECT 1');

        app.listen(PORT, () => {
            console.log('');
            console.log('====================================');
            console.log('   SEU ANTÔNIO SPETTUS - BACKEND');
            console.log('====================================');
            console.log('PostgreSQL conectado com sucesso!');
            console.log(`Backend rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
            console.log('====================================');
            console.log('');
        });
    } catch (erro) {
        console.error('');
        console.error('ERRO AO CONECTAR COM O POSTGRESQL');
        console.error(erro.message);
        console.error('');
    }
}

iniciarServidor();