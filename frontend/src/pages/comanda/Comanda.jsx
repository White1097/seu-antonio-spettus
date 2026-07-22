import {
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import CabecalhoComanda from '../../components/Comanda/CabecalhoComanda';
import CategoriasComanda from '../../components/Comanda/CategoriasComanda';
import ProdutosComanda from '../../components/Comanda/ProdutosComanda';
import CarrinhoComanda from '../../components/Comanda/CarrinhoComanda';
import ResumoComanda from '../../components/Comanda/ResumoComanda';
import PagamentoComanda from '../../components/Comanda/PagamentoComanda';

import './Comanda.css';

function Comanda({
    numeroMesa,
    comanda,
    produtos = [],
    atualizarComanda,
    fecharConta,
    voltarDashboard
}) {
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] =
        useState('todos');

    const [pagamentoAberto, setPagamentoAberto] =
        useState(false);

    const [processandoPagamento, setProcessandoPagamento] =
        useState(false);

    const [estadoLocal, setEstadoLocal] = useState(() => ({
        ...(comanda || {}),
        itens: Array.isArray(comanda?.itens) ? comanda.itens : []
    }));

    const estadoRef = useRef(estadoLocal);

    useEffect(() => {
        const proximoEstado = {
            ...(comanda || {}),
            itens: Array.isArray(comanda?.itens) ? comanda.itens : []
        };

        estadoRef.current = proximoEstado;
        setEstadoLocal(proximoEstado);
    }, [comanda]);

    const itens = estadoLocal.itens;

    const cliente = estadoLocal.cliente || '';

    const desconto = Number(estadoLocal.desconto || 0);
    const acrescimo = Number(estadoLocal.acrescimo || 0);

    const produtosAtivos = useMemo(() => {
        return produtos.filter(produto => {
            if (
                produto.ativo === false ||
                produto.ativo === 'false'
            ) {
                return false;
            }

            return true;
        });
    }, [produtos]);

    const categorias = useMemo(() => {
        return [
            ...new Set(
                produtosAtivos
                    .map(produto =>
                        String(
                            produto.categoria || 'Outros'
                        ).trim()
                    )
                    .filter(Boolean)
            )
        ].sort((categoriaA, categoriaB) =>
            categoriaA.localeCompare(
                categoriaB,
                'pt-BR'
            )
        );
    }, [produtosAtivos]);

    const produtosFiltrados = useMemo(() => {
        const normalizar = valor => String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

        const termo = normalizar(busca);

        const resultados = produtosAtivos
            .filter(produto => {
                return (
                    categoriaAtiva === 'todos' ||
                    produto.categoria === categoriaAtiva
                );
            })
            .map((produto, indiceOriginal) => {
                const nomeNormalizado = normalizar(produto.nome);
                const palavras = nomeNormalizado
                    .split(/\s+/)
                    .filter(Boolean);

                const posicaoPalavra = termo
                    ? palavras.findIndex(palavra =>
                        palavra.startsWith(termo)
                    )
                    : 0;

                return {
                    produto,
                    indiceOriginal,
                    posicaoPalavra,
                    nomeNormalizado
                };
            })
            .filter(resultado => {
                return !termo || resultado.posicaoPalavra >= 0;
            });

        if (!termo) {
            return resultados.map(resultado => resultado.produto);
        }

        return resultados
            .sort((resultadoA, resultadoB) => {
                // Quanto mais cedo a palavra pesquisada aparece no nome,
                // maior a prioridade. Ex.: "Carne de Sol" vem antes de
                // "Espeto de Carne" ao pesquisar "carne".
                if (
                    resultadoA.posicaoPalavra !==
                    resultadoB.posicaoPalavra
                ) {
                    return (
                        resultadoA.posicaoPalavra -
                        resultadoB.posicaoPalavra
                    );
                }

                const ordemAlfabetica =
                    resultadoA.nomeNormalizado.localeCompare(
                        resultadoB.nomeNormalizado,
                        'pt-BR'
                    );

                if (ordemAlfabetica !== 0) {
                    return ordemAlfabetica;
                }

                return (
                    resultadoA.indiceOriginal -
                    resultadoB.indiceOriginal
                );
            })
            .map(resultado => resultado.produto);
    }, [
        produtosAtivos,
        busca,
        categoriaAtiva
    ]);

    const subtotal = useMemo(() => {
        return itens.reduce(
            (soma, item) => {
                return (
                    soma +
                    Number(item.preco || 0) *
                    Number(item.quantidade || 0)
                );
            },
            0
        );
    }, [itens]);

    const total = Math.max(
        subtotal - desconto + acrescimo,
        0
    );

    function salvarAlteracoes(alteracoes) {
        const proximoEstado = {
            ...estadoRef.current,
            ...alteracoes,
            mesa: Number(numeroMesa)
        };

        estadoRef.current = proximoEstado;
        setEstadoLocal(proximoEstado);
        atualizarComanda(numeroMesa, proximoEstado);
    }

    function atualizarCliente(novoCliente) {
        salvarAlteracoes({
            cliente: novoCliente
        });
    }

    function adicionarItem(produto) {
        const produtoId = Number(
            produto.id
        );

        const itensAtuais = Array.isArray(estadoRef.current.itens) ? estadoRef.current.itens : [];

        const itemExistente =
            itensAtuais.find(
                item =>
                    Number(item.id) ===
                    produtoId
            );

        let novosItens;

        if (itemExistente) {
            novosItens = itensAtuais.map(
                item =>
                    Number(item.id) ===
                    produtoId
                        ? {
                            ...item,
                            quantidade:
                                Number(
                                    item.quantidade ||
                                    0
                                ) + 1
                        }
                        : item
            );
        } else {
            novosItens = [
                ...itensAtuais,
                {
                    id: produtoId,
                    nome:
                        produto.nome,
                    preco: Number(
                        produto.preco ||
                        0
                    ),
                    quantidade: 1,
                    observacao: ''
                }
            ];
        }

        salvarAlteracoes({
            itens: novosItens
        });
    }

    function diminuirItem(itemId) {
        const idNumerico =
            Number(itemId);

        const itensAtuais = Array.isArray(estadoRef.current.itens) ? estadoRef.current.itens : [];

        const novosItens = itensAtuais
            .map(item =>
                Number(item.id) ===
                idNumerico
                    ? {
                        ...item,
                        quantidade:
                            Number(
                                item.quantidade ||
                                0
                            ) - 1
                    }
                    : item
            )
            .filter(
                item =>
                    Number(
                        item.quantidade
                    ) > 0
            );

        salvarAlteracoes({
            itens: novosItens
        });
    }

    function removerItem(itemId) {
        const idNumerico =
            Number(itemId);

        const itensAtuais = Array.isArray(estadoRef.current.itens) ? estadoRef.current.itens : [];

        const novosItens =
            itensAtuais.filter(
                item =>
                    Number(item.id) !==
                    idNumerico
            );

        salvarAlteracoes({
            itens: novosItens
        });
    }

    function alterarObservacao(
        itemId,
        observacao
    ) {
        const idNumerico =
            Number(itemId);

        const itensAtuais = Array.isArray(estadoRef.current.itens) ? estadoRef.current.itens : [];

        const novosItens =
            itensAtuais.map(item =>
                Number(item.id) ===
                idNumerico
                    ? {
                        ...item,
                        observacao
                    }
                    : item
            );

        salvarAlteracoes({
            itens: novosItens
        });
    }

    function atualizarDesconto(valor) {
        salvarAlteracoes({
            desconto: Math.max(
                Number(valor || 0),
                0
            )
        });
    }

    function atualizarAcrescimo(valor) {
        salvarAlteracoes({
            acrescimo: Math.max(
                Number(valor || 0),
                0
            )
        });
    }

    function aplicarAcrescimo10() {
        salvarAlteracoes({
            desconto: 0,
            acrescimo: Number(
                (
                    subtotal *
                    0.10
                ).toFixed(2)
            )
        });
    }

    function aplicarDesconto20() {
        salvarAlteracoes({
            desconto: Number(
                (
                    subtotal *
                    0.20
                ).toFixed(2)
            ),
            acrescimo: 0
        });
    }

    function removerPorcentagens() {
        salvarAlteracoes({
            desconto: 0,
            acrescimo: 0
        });
    }

    function abrirPagamento() {
        if (itens.length === 0) {
            return;
        }

        setPagamentoAberto(true);
    }

    function fecharPagamento() {
        if (
            processandoPagamento
        ) {
            return;
        }

        setPagamentoAberto(false);
    }

    async function confirmarPagamento(
        formaPagamento
    ) {
        try {
            setProcessandoPagamento(
                true
            );

            await fecharConta(
                numeroMesa,
                formaPagamento,
                {
                    subtotal,
                    desconto,
                    acrescimo,
                    total
                }
            );

            setPagamentoAberto(
                false
            );
        } catch (erro) {
            console.error(
                'Erro ao finalizar pagamento:',
                erro
            );
        } finally {
            setProcessandoPagamento(
                false
            );
        }
    }

    return (
        <div className="comanda2">

            <CabecalhoComanda
                numeroMesa={numeroMesa}
                cliente={cliente}
                atualizarCliente={atualizarCliente}
                voltarDashboard={voltarDashboard}
            />

            <div className="comanda2-layout">

                <aside className="comanda2-esquerda">

                    <CategoriasComanda
                        categorias={categorias}
                        categoriaAtiva={categoriaAtiva}
                        selecionarCategoria={
                            setCategoriaAtiva
                        }
                    />

                    <ProdutosComanda
                        busca={busca}
                        setBusca={setBusca}
                        produtos={produtosFiltrados}
                        adicionarItem={adicionarItem}
                    />

                </aside>

                <section className="comanda2-direita">

                    <CarrinhoComanda
                        itens={itens}
                        adicionarItem={adicionarItem}
                        diminuirItem={diminuirItem}
                        removerItem={removerItem}
                        alterarObservacao={
                            alterarObservacao
                        }
                    />

                    <ResumoComanda
                        subtotal={subtotal}
                        desconto={desconto}
                        acrescimo={acrescimo}
                        atualizarDesconto={
                            atualizarDesconto
                        }
                        atualizarAcrescimo={
                            atualizarAcrescimo
                        }
                        aplicarAcrescimo10={
                            aplicarAcrescimo10
                        }
                        aplicarDesconto20={
                            aplicarDesconto20
                        }
                        removerPorcentagens={
                            removerPorcentagens
                        }
                        itens={itens}
                        fecharConta={
                            abrirPagamento
                        }
                    />

                </section>

            </div>

            <PagamentoComanda
                aberto={pagamentoAberto}
                fecharModal={fecharPagamento}
                confirmarPagamento={
                    confirmarPagamento
                }
                processando={
                    processandoPagamento
                }
            />

        </div>
    );
}

export default Comanda;