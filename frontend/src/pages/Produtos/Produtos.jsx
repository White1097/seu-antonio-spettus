import {
    useEffect,
    useMemo,
    useState
} from 'react';

import ProdutosToolbar from '../../components/Produtos/ProdutosToolbar';
import ProdutosGrid from '../../components/Produtos/ProdutosGrid';
import ProdutoModal from '../../components/Produtos/ProdutoModal';

import {
    atualizarProduto,
    criarProduto,
    excluirProduto,
    listarProdutos
} from '../../services/produtos';

import './Produtos.css';

const FORMULARIO_INICIAL = {
    id: null,
    nome: '',
    preco: '',
    categoria: '',
    descricao: '',
    imagem: '',
    ativo: true,
    destaque: false,
    ordem: ''
};

function Produtos({
    voltarDashboard
}) {
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [busca, setBusca] = useState('');
    const [categoria, setCategoria] = useState('todas');
    const [mostrarInativos, setMostrarInativos] =
        useState(false);

    const [modalAberto, setModalAberto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erroModal, setErroModal] = useState('');

    const [formulario, setFormulario] =
        useState(FORMULARIO_INICIAL);

    const editando = Boolean(formulario.id);

    useEffect(() => {
        carregarProdutos();
    }, []);

    async function carregarProdutos() {
        try {
            setCarregando(true);

            const dados = await listarProdutos({
                incluirInativos: true
            });

            setProdutos(dados);
        } catch (erro) {
            console.error(
                'Erro ao carregar produtos:',
                erro
            );

            window.alert(
                'Não foi possível carregar os produtos.'
            );
        } finally {
            setCarregando(false);
        }
    }

    const categorias = useMemo(() => {
        return [
            ...new Set(
                produtos
                    .map(produto =>
                        String(
                            produto.categoria || ''
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
    }, [produtos]);

    const produtosFiltrados = useMemo(() => {
        const normalizar = (valor) => String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

        const termo = normalizar(busca);

        return produtos.filter(produto => {
            const nomeNormalizado = normalizar(produto.nome);
            const palavrasDoNome = nomeNormalizado
                .split(/\s+/)
                .filter(Boolean);

            // Pesquisa somente no NOME do produto.
            // O termo precisa iniciar o nome ou iniciar alguma palavra.
            // Não pesquisa categoria, descrição nem o meio das palavras.
            const correspondeBusca =
                !termo ||
                nomeNormalizado.startsWith(termo) ||
                palavrasDoNome.some(
                    palavra => palavra.startsWith(termo)
                );

            const correspondeCategoria =
                categoria === 'todas' ||
                produto.categoria === categoria;

            const correspondeStatus =
                mostrarInativos ||
                produto.ativo;

            return (
                correspondeBusca &&
                correspondeCategoria &&
                correspondeStatus
            );
        });
    }, [
        produtos,
        busca,
        categoria,
        mostrarInativos
    ]);

    function abrirNovoProduto() {
        setFormulario({
            ...FORMULARIO_INICIAL,
            ordem: String(
                produtos.length + 1
            )
        });

        setErroModal('');
        setModalAberto(true);
    }

    function editarProduto(produto) {
        setFormulario({
            id: produto.id,
            nome: produto.nome || '',
            preco: String(
                produto.preco ?? ''
            ),
            categoria:
                produto.categoria || '',
            descricao:
                produto.descricao || '',
            imagem:
                produto.imagem || '',
            ativo:
                produto.ativo !== false,
            destaque:
                Boolean(produto.destaque),
            ordem: String(
                produto.ordem ?? ''
            )
        });

        setErroModal('');
        setModalAberto(true);
    }

    function fecharModal() {
        if (salvando) {
            return;
        }

        setModalAberto(false);
        setErroModal('');
        setFormulario(
            FORMULARIO_INICIAL
        );
    }

    async function salvarProduto(evento) {
        evento.preventDefault();

        const nome =
            formulario.nome.trim();

        const categoriaProduto =
            formulario.categoria.trim();

        const preco =
            Number(formulario.preco);

        const ordem =
            Number(formulario.ordem);

        if (!nome) {
            setErroModal(
                'Informe o nome do produto.'
            );
            return;
        }

        if (
            !Number.isFinite(preco) ||
            preco < 0
        ) {
            setErroModal(
                'Informe um preço válido.'
            );
            return;
        }

        if (!categoriaProduto) {
            setErroModal(
                'Informe a categoria do produto.'
            );
            return;
        }

        if (
            !Number.isInteger(ordem) ||
            ordem <= 0
        ) {
            setErroModal(
                'Informe uma ordem válida.'
            );
            return;
        }

        const dadosProduto = {
            nome,
            preco,
            categoria:
                categoriaProduto,
            descricao:
                formulario.descricao,
            imagem:
                formulario.imagem,
            ativo:
                formulario.ativo,
            destaque:
                formulario.destaque,
            ordem
        };

        try {
            setSalvando(true);
            setErroModal('');

            if (editando) {
                await atualizarProduto(
                    formulario.id,
                    dadosProduto
                );
            } else {
                await criarProduto(
                    dadosProduto
                );
            }

            await carregarProdutos();
            fecharModal();
        } catch (erro) {
            console.error(
                'Erro ao salvar produto:',
                erro
            );

            setErroModal(
                erro.message ||
                'Não foi possível salvar o produto.'
            );
        } finally {
            setSalvando(false);
        }
    }

    async function removerProduto(produto) {
        const confirmar =
            window.confirm(
                `Deseja excluir "${produto.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await excluirProduto(
                produto.id
            );

            await carregarProdutos();
        } catch (erro) {
            console.error(
                'Erro ao excluir produto:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível excluir o produto.'
            );
        }
    }

    async function alternarDisponibilidade(
        produto
    ) {
        try {
            await atualizarProduto(
                produto.id,
                {
                    ativo:
                        !produto.ativo
                }
            );

            await carregarProdutos();
        } catch (erro) {
            console.error(
                'Erro ao alterar disponibilidade:',
                erro
            );

            window.alert(
                'Não foi possível alterar a disponibilidade.'
            );
        }
    }

    async function alternarDestaque(
        produto
    ) {
        try {
            await atualizarProduto(
                produto.id,
                {
                    destaque:
                        !produto.destaque
                }
            );

            await carregarProdutos();
        } catch (erro) {
            console.error(
                'Erro ao alterar destaque:',
                erro
            );

            window.alert(
                'Não foi possível alterar o destaque.'
            );
        }
    }

    return (
        <main className="produtos-page produtos-page-nova">
            <header className="produtos-cabecalho">
                <div>
                    <span>
                        Cardápio
                    </span>

                    <h1>
                        Gerenciar produtos
                    </h1>

                    <p>
                        Cadastre, edite e organize os produtos
                        disponíveis no sistema.
                    </p>
                </div>

                <button
                    type="button"
                    className="botao-voltar-produtos"
                    onClick={voltarDashboard}
                >
                    Voltar ao dashboard
                </button>
            </header>

            <ProdutosToolbar
                busca={busca}
                setBusca={setBusca}
                categoria={categoria}
                setCategoria={setCategoria}
                categorias={categorias}
                mostrarInativos={
                    mostrarInativos
                }
                setMostrarInativos={
                    setMostrarInativos
                }
                abrirNovoProduto={
                    abrirNovoProduto
                }
            />

            <ProdutosGrid
                produtos={produtosFiltrados}
                carregando={carregando}
                editarProduto={editarProduto}
                excluirProduto={removerProduto}
                alternarDisponibilidade={
                    alternarDisponibilidade
                }
                alternarDestaque={
                    alternarDestaque
                }
            />

            <ProdutoModal
                aberto={modalAberto}
                editando={editando}
                formulario={formulario}
                setFormulario={setFormulario}
                categorias={categorias}
                salvando={salvando}
                erro={erroModal}
                fecharModal={fecharModal}
                salvarProduto={salvarProduto}
            />
        </main>
    );
}

export default Produtos;