import { useEffect, useState } from 'react';

import Dashboard from './pages/Dashboard/Dashboard';
import Comanda from './pages/comanda/Comanda';
import Historico from './pages/Historico/Historico';
import Produtos from './pages/Produtos/Produtos';

const API_URL = 'https://seu-antonio-spettus-backend.onrender.com';

function App() {
    const [pagina, setPagina] = useState('dashboard');
    const [mesaSelecionada, setMesaSelecionada] = useState(null);

    const [produtos, setProdutos] = useState([]);
    const [vendas, setVendas] = useState([]);

    const [comandas, setComandas] = useState(() => {
        const dadosSalvos = localStorage.getItem('comandas');

        if (dadosSalvos) {
            return JSON.parse(dadosSalvos);
        }

        return {
            1: [], 2: [], 3: [], 4: [], 5: [],
            6: [], 7: [], 8: [], 9: [], 10: []
        };
    });

    useEffect(() => {
        buscarProdutos();
        buscarVendas();
    }, []);

    useEffect(() => {
        localStorage.setItem('comandas', JSON.stringify(comandas));
    }, [comandas]);

    async function buscarProdutos() {
        const resposta = await fetch(`${API_URL}/produtos`);
        const dados = await resposta.json();

        setProdutos(
            dados.map(produto => ({
                ...produto,
                preco: Number(produto.preco)
            }))
        );
    }

    async function buscarVendas() {
        const resposta = await fetch(`${API_URL}/vendas`);
        const dados = await resposta.json();

        const vendasFormatadas = dados.map(venda => ({
            id: venda.id,
            mesa: venda.mesa,
            cliente: venda.cliente || '',
            subtotal: Number(venda.subtotal),
            desconto: Number(venda.desconto),
            acrescimo: Number(venda.acrescimo),
            total: Number(venda.total),
            pagamento: venda.pagamento,
            data: new Date(venda.criado_em).toLocaleString('pt-BR'),
            itens: venda.itens.map(item => ({
                id: item.produto_id,
                nome: item.nome_produto,
                preco: Number(item.preco_unitario),
                quantidade: item.quantidade,
                observacao: item.observacao || ''
            }))
        }));

        setVendas(vendasFormatadas);
    }

    async function limparHistorico() {
        const confirmar = confirm('Deseja apagar todo o histórico de vendas?');

        if (!confirmar) {
            return;
        }

        await fetch(`${API_URL}/vendas`, {
            method: 'DELETE'
        });

        setVendas([]);
    }

    function abrirComanda(numeroMesa) {
        setMesaSelecionada(numeroMesa);
        setPagina('comanda');
    }

    function atualizarComanda(numeroMesa, novosItens) {
        setComandas(comandasAtuais => ({
            ...comandasAtuais,
            [numeroMesa]: novosItens
        }));
    }

    async function fecharConta(numeroMesa, pagamento, resumo) {
        const venda = {
            mesa: numeroMesa,
            cliente: resumo.cliente,
            itens: comandas[numeroMesa],
            subtotal: resumo.subtotal,
            desconto: resumo.desconto,
            acrescimo: resumo.acrescimo,
            total: resumo.total,
            pagamento
        };

        await fetch(`${API_URL}/vendas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venda)
        });

        setComandas(comandasAtuais => ({
            ...comandasAtuais,
            [numeroMesa]: []
        }));

        await buscarVendas();

        setPagina('dashboard');
    }

    if (pagina === 'comanda') {
        return (
            <Comanda
                numeroMesa={mesaSelecionada}
                itens={comandas[mesaSelecionada] || []}
                produtos={produtos}
                atualizarComanda={atualizarComanda}
                fecharConta={fecharConta}
                voltarDashboard={() => setPagina('dashboard')}
            />
        );
    }

    if (pagina === 'historico') {
        return (
            <Historico
                vendas={vendas}
                limparHistorico={limparHistorico}
                voltarDashboard={() => setPagina('dashboard')}
            />
        );
    }

    if (pagina === 'produtos') {
        return (
            <Produtos
                produtos={produtos}
                setProdutos={setProdutos}
                voltarDashboard={() => {
                    buscarProdutos();
                    setPagina('dashboard');
                }}
            />
        );
    }

    return (
        <Dashboard
            comandas={comandas}
            vendas={vendas}
            abrirComanda={abrirComanda}
            abrirHistorico={() => setPagina('historico')}
            abrirProdutos={() => setPagina('produtos')}
        />
    );
}

export default App;