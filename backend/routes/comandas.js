const express = require('express');
const db = require('../config/database');

const router = express.Router();

function formatarComanda(comanda) {
    return {
        mesa: Number(comanda.mesa),
        cliente: comanda.cliente || '',
        itens: Array.isArray(comanda.itens)
            ? comanda.itens.map(item => ({
                ...item,
                id: Number(item.id),
                preco: Number(item.preco),
                quantidade: Number(item.quantidade)
            }))
            : [],
        desconto: Number(comanda.desconto || 0),
        acrescimo: Number(comanda.acrescimo || 0),
        atualizado_em: comanda.atualizado_em
    };
}

router.get('/', async (req, res) => {
    try {
        const resultado = await db.query(`
            SELECT
                mesa,
                cliente,
                itens,
                desconto,
                acrescimo,
                atualizado_em
            FROM comandas_abertas
            ORDER BY mesa
        `);

        res.json(
            resultado.rows.map(formatarComanda)
        );
    } catch (erro) {
        console.error('Erro ao listar comandas:', erro);

        res.status(500).json({
            erro: 'Erro ao listar comandas',
            mensagem: erro.message
        });
    }
});

router.get('/:mesa', async (req, res) => {
    try {
        const mesa = Number(req.params.mesa);

        if (!Number.isInteger(mesa) || mesa < 1 || mesa > 10) {
            return res.status(400).json({
                erro: 'Número da mesa inválido'
            });
        }

        const resultado = await db.query(
            `SELECT
                mesa,
                cliente,
                itens,
                desconto,
                acrescimo,
                atualizado_em
             FROM comandas_abertas
             WHERE mesa = $1`,
            [mesa]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: 'Mesa não encontrada'
            });
        }

        res.json(
            formatarComanda(resultado.rows[0])
        );
    } catch (erro) {
        console.error('Erro ao buscar comanda:', erro);

        res.status(500).json({
            erro: 'Erro ao buscar comanda',
            mensagem: erro.message
        });
    }
});

router.put('/:mesa', async (req, res) => {
    try {
        const mesa = Number(req.params.mesa);

        if (!Number.isInteger(mesa) || mesa < 1 || mesa > 10) {
            return res.status(400).json({
                erro: 'Número da mesa inválido'
            });
        }

        const {
            cliente = '',
            itens = [],
            desconto = 0,
            acrescimo = 0
        } = req.body;

        if (!Array.isArray(itens)) {
            return res.status(400).json({
                erro: 'A lista de itens é inválida'
            });
        }

        const resultado = await db.query(
            `INSERT INTO comandas_abertas (
                mesa,
                cliente,
                itens,
                desconto,
                acrescimo,
                atualizado_em
            )
            VALUES (
                $1,
                $2,
                $3::jsonb,
                $4,
                $5,
                CURRENT_TIMESTAMP
            )
            ON CONFLICT (mesa)
            DO UPDATE SET
                cliente = EXCLUDED.cliente,
                itens = EXCLUDED.itens,
                desconto = EXCLUDED.desconto,
                acrescimo = EXCLUDED.acrescimo,
                atualizado_em = CURRENT_TIMESTAMP
            RETURNING *`,
            [
                mesa,
                cliente,
                JSON.stringify(itens),
                Number(desconto || 0),
                Number(acrescimo || 0)
            ]
        );

        res.json(
            formatarComanda(resultado.rows[0])
        );
    } catch (erro) {
        console.error('Erro ao atualizar comanda:', erro);

        res.status(500).json({
            erro: 'Erro ao atualizar comanda',
            mensagem: erro.message
        });
    }
});

router.delete('/:mesa', async (req, res) => {
    try {
        const mesa = Number(req.params.mesa);

        if (!Number.isInteger(mesa) || mesa < 1 || mesa > 10) {
            return res.status(400).json({
                erro: 'Número da mesa inválido'
            });
        }

        const resultado = await db.query(
            `UPDATE comandas_abertas
             SET
                cliente = '',
                itens = '[]'::jsonb,
                desconto = 0,
                acrescimo = 0,
                atualizado_em = CURRENT_TIMESTAMP
             WHERE mesa = $1
             RETURNING *`,
            [mesa]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: 'Mesa não encontrada'
            });
        }

        res.json(
            formatarComanda(resultado.rows[0])
        );
    } catch (erro) {
        console.error('Erro ao limpar comanda:', erro);

        res.status(500).json({
            erro: 'Erro ao limpar comanda',
            mensagem: erro.message
        });
    }
});

module.exports = router;