import { useEffect, useState } from 'react';
import {
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import Dashboard from './pages/Dashboard/Dashboard';
import Comanda from './pages/comanda/Comanda';
import Historico from './pages/Historico/Historico';
import Produtos from './pages/Produtos/Produtos';
import Login from './pages/Login/Login';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const API_URL =
    'https://seu-antonio-spettus-backend.onrender.com';

function criarComandasVazias() {
    const comandasVazias = {};

    for (let mesa = 1; mesa <= 10; mesa += 1) {
        comandasVazias[mesa] = {
            mesa,
            cliente: '',
            itens: [],
            desconto: 0,
            acrescimo: 0
        };
    }

    return comandasVazias;
}

function RotaLogin() {
    const {
        autenticado,
        loading
    } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#f8f4eb',
                    color: '#351c32',
                    fontWeight: '800'
                }}
            >
                Carregando...
            </div>
        );
    }

    if (autenticado) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Login />;
}

function SistemaAtual() {
    const {
        cargo
    } = useAuth();

    const [pagina, setPagina] =
        useState('dashboard');

    const [mesaSelecionada, setMesaSelecionada] =
        useState(null);

    const [produtos, setProdutos] =
        useState([]);

    const [vendas, setVendas] =
        useState([]);

    const [comandas, setComandas] =
        useState(criarComandasVazias);

    useEffect(() => {
        buscarProdutos();
        buscarVendas();
        buscarComandas();

        const atualizacaoAutomatica =
            setInterval(() => {
                buscarComandas();
                buscarVendas();
            }, 3000);

        function atualizarAoVoltarParaAba() {
            if (
                document.visibilityState ===
                'visible'
            ) {
                buscarComandas();
                buscarVendas();
            }
        }

        document.addEventListener(
            'visibilitychange',
            atualizarAoVoltarParaAba
        );

        return () => {
            clearInterval(
                atualizacaoAutomatica
            );

            document.removeEventListener(
                'visibilitychange',
                atualizarAoVoltarParaAba
            );
        };
    }, []);

    async function buscarProdutos() {
        try {
            const resposta = await fetch(
                `${API_URL}/produtos`
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível buscar os produtos.'
                );
            }

            const dados =
                await resposta.json();

            const produtosFormatados =
                dados.map(produto => ({
                    ...produto,
                    preco: Number(
                        produto.preco
                    )
                }));

            setProdutos(
                produtosFormatados
            );
        } catch (erro) {
            console.error(
                'Erro ao buscar produtos:',
                erro
            );
        }
    }

    async function buscarVendas() {
        try {
            const resposta = await fetch(
                `${API_URL}/vendas`
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível buscar as vendas.'
                );
            }

            const dados =
                await resposta.json();

            const vendasFormatadas =
                dados.map(venda => ({
                    id: venda.id,
                    mesa: Number(
                        venda.mesa
                    ),
                    cliente:
                        venda.cliente || '',
                    subtotal: Number(
                        venda.subtotal
                    ),
                    desconto: Number(
                        venda.desconto
                    ),
                    acrescimo: Number(
                        venda.acrescimo
                    ),
                    total: Number(
                        venda.total
                    ),
                    pagamento:
                        venda.pagamento,
                    data: new Date(
                        venda.criado_em
                    ).toLocaleString(
                        'pt-BR'
                    ),

                    itens: Array.isArray(
                        venda.itens
                    )
                        ? venda.itens.map(
                            item => ({
                                id:
                                    item.produto_id,
                                nome:
                                    item.nome_produto,
                                preco: Number(
                                    item.preco_unitario
                                ),
                                quantidade:
                                    Number(
                                        item.quantidade
                                    ),
                                observacao:
                                    item.observacao ||
                                    ''
                            })
                        )
                        : []
                }));

            setVendas(
                vendasFormatadas
            );
        } catch (erro) {
            console.error(
                'Erro ao buscar vendas:',
                erro
            );
        }
    }

    async function buscarComandas() {
        try {
            const resposta = await fetch(
                `${API_URL}/comandas`
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível buscar as comandas.'
                );
            }

            const dados =
                await resposta.json();

            const comandasFormatadas =
                criarComandasVazias();

            dados.forEach(comanda => {
                const numeroMesa =
                    Number(comanda.mesa);

                comandasFormatadas[
                    numeroMesa
                ] = {
                    mesa: numeroMesa,

                    cliente:
                        comanda.cliente ||
                        '',

                    itens:
                        Array.isArray(
                            comanda.itens
                        )
                            ? comanda.itens.map(
                                item => ({
                                    ...item,

                                    id: Number(
                                        item.id
                                    ),

                                    preco:
                                        Number(
                                            item.preco
                                        ),

                                    quantidade:
                                        Number(
                                            item.quantidade
                                        ),

                                    observacao:
                                        item.observacao ||
                                        ''
                                })
                            )
                            : [],

                    desconto: Number(
                        comanda.desconto ||
                        0
                    ),

                    acrescimo: Number(
                        comanda.acrescimo ||
                        0
                    )
                };
            });

            setComandas(
                comandasFormatadas
            );
        } catch (erro) {
            console.error(
                'Erro ao buscar comandas:',
                erro
            );
        }
    }

    function abrirComanda(
        numeroMesa
    ) {
        setMesaSelecionada(
            numeroMesa
        );

        setPagina('comanda');
    }

    function abrirHistorico() {
        const podeVerHistorico =
            cargo === 'caixa' ||
            cargo === 'administrador';

        if (!podeVerHistorico) {
            window.alert(
                'Somente caixas e administradores podem acessar o histórico.'
            );

            return;
        }

        setPagina('historico');
    }

    function abrirProdutos() {
        if (
            cargo !==
            'administrador'
        ) {
            window.alert(
                'Somente administradores podem gerenciar produtos.'
            );

            return;
        }

        setPagina('produtos');
    }

    async function atualizarComanda(
        numeroMesa,
        alteracoes
    ) {
        const comandaAtual =
            comandas[numeroMesa] ||
            criarComandasVazias()[
                numeroMesa
            ];

        const comandaAtualizada = {
            ...comandaAtual,
            ...alteracoes,
            mesa: numeroMesa
        };

        setComandas(
            comandasAtuais => ({
                ...comandasAtuais,

                [numeroMesa]:
                    comandaAtualizada
            })
        );

        try {
            const resposta = await fetch(
                `${API_URL}/comandas/${numeroMesa}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        cliente:
                            comandaAtualizada
                                .cliente ||
                            '',

                        itens:
                            comandaAtualizada
                                .itens ||
                            [],

                        desconto:
                            Number(
                                comandaAtualizada
                                    .desconto ||
                                0
                            ),

                        acrescimo:
                            Number(
                                comandaAtualizada
                                    .acrescimo ||
                                0
                            )
                    })
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível salvar a comanda.'
                );
            }
        } catch (erro) {
            console.error(
                'Erro ao salvar comanda:',
                erro
            );

            window.alert(
                'Não foi possível salvar a alteração da mesa.'
            );

            await buscarComandas();
        }
    }

    async function fecharConta(
        numeroMesa,
        pagamento,
        resumo
    ) {
        const podeFecharConta =
            cargo === 'caixa' ||
            cargo === 'administrador';

        if (!podeFecharConta) {
            window.alert(
                'Somente caixas e administradores podem fechar contas.'
            );

            return;
        }

        try {
            const comanda =
                comandas[numeroMesa];

            const respostaVenda =
                await fetch(
                    `${API_URL}/vendas`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify({
                                mesa:
                                    numeroMesa,

                                cliente:
                                    comanda
                                        .cliente ||
                                    '',

                                itens:
                                    comanda
                                        .itens ||
                                    [],

                                subtotal:
                                    Number(
                                        resumo
                                            .subtotal
                                    ),

                                desconto:
                                    Number(
                                        resumo
                                            .desconto
                                    ),

                                acrescimo:
                                    Number(
                                        resumo
                                            .acrescimo
                                    ),

                                total:
                                    Number(
                                        resumo
                                            .total
                                    ),

                                pagamento
                            })
                    }
                );

            if (
                !respostaVenda.ok
            ) {
                throw new Error(
                    'Não foi possível registrar a venda.'
                );
            }

            const respostaLimpeza =
                await fetch(
                    `${API_URL}/comandas/${numeroMesa}`,
                    {
                        method:
                            'DELETE'
                    }
                );

            if (
                !respostaLimpeza.ok
            ) {
                throw new Error(
                    'A venda foi registrada, mas a mesa não foi liberada.'
                );
            }

            await buscarComandas();
            await buscarVendas();

            setPagina(
                'dashboard'
            );

            setMesaSelecionada(
                null
            );
        } catch (erro) {
            console.error(
                'Erro ao fechar conta:',
                erro
            );

            window.alert(
                'Não foi possível concluir o fechamento da conta.'
            );
        }
    }

    async function limparHistorico() {
        if (
            cargo !==
            'administrador'
        ) {
            window.alert(
                'Somente administradores podem apagar o histórico.'
            );

            return;
        }

        const confirmar =
            window.confirm(
                'Deseja apagar todo o histórico de vendas?'
            );

        if (!confirmar) {
            return;
        }

        try {
            const resposta =
                await fetch(
                    `${API_URL}/vendas`,
                    {
                        method:
                            'DELETE'
                    }
                );

            if (!resposta.ok) {
                throw new Error(
                    'Não foi possível apagar o histórico.'
                );
            }

            await buscarVendas();
        } catch (erro) {
            console.error(
                'Erro ao limpar histórico:',
                erro
            );

            window.alert(
                'Não foi possível apagar o histórico.'
            );
        }
    }

    if (
        pagina ===
        'comanda'
    ) {
        return (
            <Comanda
                numeroMesa={
                    mesaSelecionada
                }
                comanda={
                    comandas[
                        mesaSelecionada
                    ] ||
                    criarComandasVazias()[
                        mesaSelecionada
                    ]
                }
                produtos={produtos}
                atualizarComanda={
                    atualizarComanda
                }
                fecharConta={
                    fecharConta
                }
                voltarDashboard={() => {
                    setPagina(
                        'dashboard'
                    );

                    setMesaSelecionada(
                        null
                    );

                    buscarComandas();
                }}
            />
        );
    }

    if (
        pagina ===
        'historico'
    ) {
        return (
            <Historico
                vendas={vendas}
                limparHistorico={
                    limparHistorico
                }
                voltarDashboard={() => {
                    setPagina(
                        'dashboard'
                    );

                    buscarComandas();
                }}
            />
        );
    }

    if (
        pagina ===
        'produtos'
    ) {
        return (
            <Produtos
                produtos={produtos}
                setProdutos={
                    setProdutos
                }
                voltarDashboard={() => {
                    buscarProdutos();
                    buscarComandas();

                    setPagina(
                        'dashboard'
                    );
                }}
            />
        );
    }

    return (
        <Dashboard
            comandas={comandas}
            vendas={vendas}
            abrirComanda={
                abrirComanda
            }
            abrirHistorico={
                abrirHistorico
            }
            abrirProdutos={
                abrirProdutos
            }
        />
    );
}

function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <RotaLogin />
                }
            />

            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <SistemaAtual />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;