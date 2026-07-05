const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM produtos WHERE ativo = TRUE ORDER BY categoria, nome'
        );

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({
            erro: 'Erro ao listar produtos',
            mensagem: erro.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, preco, categoria } = req.body;

        const resultado = await db.query(
            `INSERT INTO produtos (nome, preco, categoria)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nome, preco, categoria]
        );

        res.status(201).json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({
            erro: 'Erro ao criar produto',
            mensagem: erro.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { nome, preco, categoria } = req.body;
        const { id } = req.params;

        const resultado = await db.query(
            `UPDATE produtos
             SET nome = $1, preco = $2, categoria = $3
             WHERE id = $4
             RETURNING *`,
            [nome, preco, categoria, id]
        );

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({
            erro: 'Erro ao editar produto',
            mensagem: erro.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE produtos SET ativo = FALSE WHERE id = $1',
            [id]
        );

        res.json({
            mensagem: 'Produto excluído com sucesso'
        });
    } catch (erro) {
        res.status(500).json({
            erro: 'Erro ao excluir produto',
            mensagem: erro.message
        });
    }
});

module.exports = router;