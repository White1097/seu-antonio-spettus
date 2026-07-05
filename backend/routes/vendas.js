const express = require('express');
const db = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const vendas = await db.query(
            `SELECT * FROM vendas ORDER BY criado_em DESC`
        );

        const itens = await db.query(
            `SELECT * FROM itens_venda ORDER BY id ASC`
        );

        const vendasComItens = vendas.rows.map(venda => ({
            ...venda,
            subtotal: Number(venda.subtotal),
            desconto: Number(venda.desconto),
            acrescimo: Number(venda.acrescimo),
            total: Number(venda.total),
            cliente: venda.cliente || '',
            itens: itens.rows
                .filter(item => item.venda_id === venda.id)
                .map(item => ({
                    ...item,
                    preco_unitario: Number(item.preco_unitario)
                }))
        }));

        res.json(vendasComItens);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao listar vendas', mensagem: erro.message });
    }
});

router.post('/', async (req, res) => {
    const client = await db.connect();

    try {
        const { mesa, cliente, itens, subtotal, desconto, acrescimo, total, pagamento } = req.body;

        await client.query('BEGIN');

        const vendaResultado = await client.query(
            `INSERT INTO vendas
            (mesa, cliente, subtotal, desconto, acrescimo, total, pagamento)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [mesa, cliente || '', subtotal, desconto, acrescimo, total, pagamento]
        );

        const venda = vendaResultado.rows[0];

        for (const item of itens) {
            await client.query(
                `INSERT INTO itens_venda
                (venda_id, produto_id, nome_produto, preco_unitario, quantidade, observacao)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    venda.id,
                    item.id || null,
                    item.nome,
                    item.preco,
                    item.quantidade,
                    item.observacao || ''
                ]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ mensagem: 'Venda registrada com sucesso', venda });
    } catch (erro) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: 'Erro ao registrar venda', mensagem: erro.message });
    } finally {
        client.release();
    }
});

router.delete('/', async (req, res) => {
    try {
        await db.query('DELETE FROM vendas');

        res.json({ mensagem: 'Histórico apagado com sucesso' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao apagar histórico', mensagem: erro.message });
    }
});

module.exports = router;