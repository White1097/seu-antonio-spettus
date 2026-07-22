import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

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
import Funcionarios from './pages/Funcionarios/Funcionarios';
import Caixa from './pages/Caixa/Caixa';
import Relatorios from './pages/Relatorios/Relatorios';
import PainelExecutivo from './pages/PainelExecutivo/PainelExecutivo';
import GerenciarMesas from './pages/Configuracoes/Mesas/GerenciarMesas';
import Aparencia from './pages/Configuracoes/Aparencia/Aparencia';

import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';

import { useAuth } from './context/AuthContext';
import { useComandas } from './hooks/useComandas';
import { useVendas } from './hooks/useVendas';

import {
    excluirComanda,
    salvarComanda
} from './services/comandas';

import {
    listarProdutos
} from './services/produtos';

import {
    apagarHistorico,
    registrarVenda
} from './services/vendas';

function TelaCarregamento() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: 'var(--cor-fundo)',
                color: 'var(--cor-texto)',
                fontWeight: '800'
            }}
        >
            Carregando...
        </div>
    );
}

function RotaLogin() {
    const {
        autenticado,
        loading
    } = useAuth();

    if (loading) {
        return <TelaCarregamento />;
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

    const {
        comandas,
        carregando: carregandoComandas,
        erro: erroComandas,
        obterComanda,
        atualizarComandaLocal,
        removerComandaLocal,
        atualizarComandas
    } = useComandas();

    const {
        vendas,
        carregando: carregandoVendas,
        erro: erroVendas,
        atualizarVendas
    } = useVendas();

    const salvamentosPendentes = useRef(new Map());

    const [
        pagina,
        setPagina
    ] = useState('dashboard');

    const [
        mesaSelecionada,
        setMesaSelecionada
    ] = useState(null);

    const [
        produtos,
        setProdutos
    ] = useState([]);

    const [
        carregandoProdutos,
        setCarregandoProdutos
    ] = useState(true);

    const [
        erroProdutos,
        setErroProdutos
    ] = useState('');

    const buscarProdutos =
        useCallback(async () => {
            try {
                setCarregandoProdutos(true);
                setErroProdutos('');

                const dados =
                    await listarProdutos({
                        incluirInativos: false
                    });

                setProdutos(dados);
            } catch (erro) {
                console.error(
                    'Erro ao carregar produtos:',
                    erro
                );

                setErroProdutos(
                    erro.message ||
                    'Não foi possível carregar os produtos.'
                );
            } finally {
                setCarregandoProdutos(false);
            }
        }, []);

    useEffect(() => {
        buscarProdutos();
    }, [buscarProdutos]);

    const carregandoSistema =
        carregandoComandas ||
        carregandoVendas ||
        carregandoProdutos;

    const erroSistema =
        erroComandas ||
        erroVendas ||
        erroProdutos;

    function abrirComanda(numeroMesa) {
        setMesaSelecionada(
            Number(numeroMesa)
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
        if (cargo !== 'administrador') {
            window.alert(
                'Somente administradores podem gerenciar produtos.'
            );

            return;
        }

        setPagina('produtos');
    }

    function abrirGerenciamentoMesas() {
        if (cargo !== 'administrador') {
            window.alert(
                'Somente administradores podem gerenciar mesas.'
            );

            return;
        }

        setPagina('gerenciar-mesas');
    }

    function abrirFuncionarios() {
        if (cargo !== 'administrador') {
            window.alert(
                'Somente administradores podem gerenciar funcionários.'
            );

            return;
        }

        setPagina('funcionarios');
    }

    function abrirCaixa() {
        const podeVerCaixa =
            cargo === 'caixa' ||
            cargo === 'administrador';

        if (!podeVerCaixa) {
            window.alert(
                'Somente caixas e administradores podem acessar o caixa.'
            );

            return;
        }

        setPagina('caixa');
    }

    function abrirRelatorios() {
        const podeVerRelatorios =
            cargo === 'caixa' ||
            cargo === 'administrador';

        if (!podeVerRelatorios) {
            window.alert(
                'Somente caixas e administradores podem acessar os relatórios.'
            );

            return;
        }

        setPagina('relatorios');
    }

    function abrirPainelExecutivo() {
        const podeVerPainel =
            cargo === 'caixa' ||
            cargo === 'administrador';

        if (!podeVerPainel) {
            window.alert(
                'Somente caixas e administradores podem acessar o Painel Executivo.'
            );
            return;
        }

        setPagina('executivo');
    }

    function mudarPaginaSistema(
        novaPagina
    ) {
        if (
            novaPagina === 'dashboard' ||
            novaPagina === 'mesas' ||
            novaPagina === 'comandas'
        ) {
            setPagina('dashboard');
            return;
        }

        if (novaPagina === 'executivo') {
            abrirPainelExecutivo();
            return;
        }

        if (novaPagina === 'cardapio') {
            abrirProdutos();
            return;
        }

        if (novaPagina === 'historico') {
            abrirHistorico();
            return;
        }

        if (novaPagina === 'caixa') {
            abrirCaixa();
            return;
        }

        if (
            novaPagina ===
            'configuracoes'
        ) {
            setPagina('configuracoes');
            return;
        }

        if (novaPagina === 'gerenciar-mesas') {
            abrirGerenciamentoMesas();
            return;
        }

        if (
            novaPagina ===
            'funcionarios'
        ) {
            abrirFuncionarios();
            return;
        }

        if (
            novaPagina ===
            'relatorios'
        ) {
            abrirRelatorios();
        }
    }

    function atualizarComanda(numeroMesa, alteracoes) {
        const numero = Number(numeroMesa);
        const comandaAtualizada = {
            ...obterComanda(numero),
            ...alteracoes,
            mesa: numero
        };

        atualizarComandaLocal(numero, comandaAtualizada);

        const pendenteAnterior = salvamentosPendentes.current.get(numero);
        if (pendenteAnterior?.timer) {
            window.clearTimeout(pendenteAnterior.timer);
        }

        const timer = window.setTimeout(async () => {
            try {
                await salvarComanda(numero, comandaAtualizada);
            } catch (erro) {
                console.error('Erro ao salvar comanda:', erro);
                window.alert(erro.message || 'Não foi possível salvar a alteração da mesa.');
                await atualizarComandas();
            } finally {
                const atual = salvamentosPendentes.current.get(numero);
                if (atual?.timer === timer) {
                    salvamentosPendentes.current.delete(numero);
                }
            }
        }, 250);

        salvamentosPendentes.current.set(numero, {
            timer,
            dados: comandaAtualizada
        });
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

        const numero =
            Number(numeroMesa);

        const salvamentoPendente = salvamentosPendentes.current.get(numero);
        if (salvamentoPendente?.timer) {
            window.clearTimeout(salvamentoPendente.timer);
            salvamentosPendentes.current.delete(numero);
        }

        const comanda =
            obterComanda(numero);

        if (
            !Array.isArray(comanda.itens) ||
            comanda.itens.length === 0
        ) {
            window.alert(
                'A comanda não possui itens.'
            );

            return;
        }

        try {
            await registrarVenda({
                mesa: numero,
                cliente:
                    comanda.cliente || '',
                itens:
                    comanda.itens || [],
                subtotal: Number(
                    resumo.subtotal || 0
                ),
                desconto: Number(
                    resumo.desconto || 0
                ),
                acrescimo: Number(
                    resumo.acrescimo || 0
                ),
                total: Number(
                    resumo.total || 0
                ),
                pagamento
            });

            await excluirComanda(
                numero
            );

            removerComandaLocal(
                numero
            );

            await Promise.all([
                atualizarComandas(),
                atualizarVendas()
            ]);

            setPagina('dashboard');
            setMesaSelecionada(null);
        } catch (erro) {
            console.error(
                'Erro ao fechar conta:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível concluir o fechamento da conta.'
            );
        }
    }

    async function limparHistorico() {
        if (cargo !== 'administrador') {
            throw new Error(
                'Somente administradores podem apagar o histórico.'
            );
        }

        await apagarHistorico();
        await atualizarVendas();

        return true;
    }

    function voltarAoDashboard() {
        setPagina('dashboard');
        setMesaSelecionada(null);
    }

    if (carregandoSistema) {
        return <TelaCarregamento />;
    }

    if (erroSistema) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '24px',
                    background: '#f8f4eb'
                }}
            >
                <div
                    style={{
                        maxWidth: '560px',
                        padding: '24px',
                        border: '1px solid #efb4b4',
                        borderRadius: '16px',
                        background: '#fff0f0',
                        color: '#a52a2a',
                        fontWeight: '800',
                        textAlign: 'center'
                    }}
                >
                    {erroSistema}
                </div>
            </div>
        );
    }

    function envolverComLayout(conteudo, paginaAtual, titulo) {
        return (
            <Layout
                paginaAtual={paginaAtual}
                mudarPagina={mudarPaginaSistema}
                titulo={titulo}
            >
                {conteudo}
            </Layout>
        );
    }

    if (pagina === 'comanda') {
        return envolverComLayout((
            <Comanda
                numeroMesa={mesaSelecionada}
                comanda={obterComanda(
                    mesaSelecionada
                )}
                produtos={produtos}
                atualizarComanda={
                    atualizarComanda
                }
                fecharConta={fecharConta}
                voltarDashboard={
                    voltarAoDashboard
                }
            />
        ), 'dashboard', `Comanda - Mesa ${mesaSelecionada}`);
    }

    if (pagina === 'historico') {
        return envolverComLayout((
            <Historico
                vendas={vendas}
                limparHistorico={limparHistorico}
                voltarDashboard={voltarAoDashboard}
            />
        ), 'historico', 'Histórico');
    }

    if (pagina === 'produtos') {
        return envolverComLayout((
            <Produtos
                produtos={produtos}
                setProdutos={setProdutos}
                voltarDashboard={async () => {
                    await buscarProdutos();
                    voltarAoDashboard();
                }}
            />
        ), 'cardapio', 'Cardápio');
    }

    if (pagina === 'funcionarios') {
        return envolverComLayout((
            <Funcionarios voltarDashboard={voltarAoDashboard} />
        ), 'funcionarios', 'Funcionários');
    }

    if (pagina === 'caixa') {
        return envolverComLayout((
            <Caixa voltarDashboard={voltarAoDashboard} />
        ), 'caixa', 'Caixa');
    }

    if (pagina === 'executivo') {
        return (
            <PainelExecutivo
                comandas={comandas}
                mudarPaginaSistema={mudarPaginaSistema}
            />
        );
    }

    if (pagina === 'relatorios') {
    return (
        <Relatorios
            voltarDashboard={
                voltarAoDashboard
            }
            mudarPaginaSistema={
                mudarPaginaSistema
            }
        />
    );
}

    if (pagina === 'configuracoes') {
        return (
            <Aparencia mudarPagina={mudarPaginaSistema} />
        );
    }

    if (pagina === 'gerenciar-mesas') {
        return (
            <GerenciarMesas
                mudarPagina={
                    mudarPaginaSistema
                }
            />
        );
    }

    return (
        <Dashboard
            comandas={comandas}
            vendas={vendas}
            abrirComanda={abrirComanda}
            abrirHistorico={
                abrirHistorico
            }
            abrirProdutos={
                abrirProdutos
            }
            abrirConfiguracoesMesas={
                abrirGerenciamentoMesas
            }
            abrirFuncionarios={
                abrirFuncionarios
            }
            abrirCaixa={
                abrirCaixa
            }
            abrirRelatorios={
                abrirRelatorios
            }
            mudarPaginaSistema={
                mudarPaginaSistema
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