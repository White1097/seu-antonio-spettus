import {
    useEffect,
    useMemo,
    useState
} from 'react';

import CaixaResumo from '../../components/Caixa/CaixaResumo';
import CaixaMovimentacoes from '../../components/Caixa/CaixaMovimentacoes';
import CaixaModal from '../../components/Caixa/CaixaModal';
import CaixaToolbar from '../../components/Caixa/CaixaToolbar';

import {
    abrirCaixa,
    buscarCaixaAberto,
    calcularResumoCaixa,
    criarMovimentacao,
    fecharCaixa,
    listarMovimentacoes
} from '../../services/caixa';

import './Caixa.css';

const FORMULARIO_INICIAL = {
    valor: '',
    descricao: ''
};

function Caixa({
    voltarDashboard
}) {
    const [caixaAberto, setCaixaAberto] =
        useState(null);

    const [
        movimentacoes,
        setMovimentacoes
    ] = useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [modalAberto, setModalAberto] =
        useState(false);

    const [tipoModal, setTipoModal] =
        useState('');

    const [formulario, setFormulario] =
        useState(FORMULARIO_INICIAL);

    const [salvando, setSalvando] =
        useState(false);

    const [erroModal, setErroModal] =
        useState('');

    useEffect(() => {
        carregarCaixa();
    }, []);

    async function carregarCaixa() {
        try {
            setCarregando(true);

            const caixa =
                await buscarCaixaAberto();

            setCaixaAberto(caixa);

            if (caixa) {
                const dados =
                    await listarMovimentacoes(
                        caixa.id
                    );

                setMovimentacoes(dados);
            } else {
                setMovimentacoes([]);
            }
        } catch (erro) {
            console.error(
                'Erro ao carregar caixa:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível carregar o caixa.'
            );
        } finally {
            setCarregando(false);
        }
    }

    const resumo = useMemo(() => {
        return calcularResumoCaixa(
            caixaAberto,
            movimentacoes
        );
    }, [
        caixaAberto,
        movimentacoes
    ]);

    function abrirModal(tipo) {
        setTipoModal(tipo);
        setFormulario(
            FORMULARIO_INICIAL
        );
        setErroModal('');
        setModalAberto(true);
    }

    function fecharModal() {
        if (salvando) {
            return;
        }

        setModalAberto(false);
        setTipoModal('');
        setFormulario(
            FORMULARIO_INICIAL
        );
        setErroModal('');
    }

    async function confirmarModal(
        evento
    ) {
        evento.preventDefault();

        const valor = tipoModal === 'fechar'
            ? Number(resumo.saldoCalculado || 0)
            : Number(formulario.valor);

        if (
            !Number.isFinite(valor) ||
            valor < 0
        ) {
            setErroModal(
                'Informe um valor válido.'
            );

            return;
        }

        try {
            setSalvando(true);
            setErroModal('');

            if (tipoModal === 'abrir') {
                await abrirCaixa(valor);
            }

            if (
                tipoModal === 'suprimento' ||
                tipoModal === 'sangria'
            ) {
                if (!caixaAberto) {
                    throw new Error(
                        'Não existe um caixa aberto.'
                    );
                }

                await criarMovimentacao({
                    caixaId:
                        caixaAberto.id,
                    tipo: tipoModal,
                    descricao:
                        formulario.descricao,
                    valor
                });
            }

            if (tipoModal === 'fechar') {
                if (!caixaAberto) {
                    throw new Error(
                        'Não existe um caixa aberto.'
                    );
                }

                await fecharCaixa({
                    caixaId:
                        caixaAberto.id,
                    saldoInformado: resumo.saldoCalculado,
                    saldoCalculado:
                        resumo.saldoCalculado
                });
            }

            fecharModal();
            await carregarCaixa();
        } catch (erro) {
            console.error(
                'Erro na operação do caixa:',
                erro
            );

            setErroModal(
                erro.message ||
                'Não foi possível concluir a operação.'
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="caixa-page">
            <header className="caixa-cabecalho">
                <div>
                    <span>
                        Financeiro
                    </span>

                    <h1>
                        Controle de caixa
                    </h1>

                    <p>
                        Abra, acompanhe e feche o caixa
                        do restaurante.
                    </p>
                </div>

                <button
                    type="button"
                    className="caixa-voltar"
                    onClick={voltarDashboard}
                >
                    Voltar ao dashboard
                </button>
            </header>

            <CaixaToolbar
                caixaAberto={caixaAberto}
                abrirModal={abrirModal}
            />

            {carregando ? (
                <div className="caixa-estado">
                    Carregando caixa...
                </div>
            ) : (
                <>
                    <CaixaResumo
                        resumo={resumo}
                    />

                    <CaixaMovimentacoes
                        movimentacoes={
                            movimentacoes
                        }
                        carregando={
                            carregando
                        }
                    />
                </>
            )}

            <CaixaModal
                aberto={modalAberto}
                tipo={tipoModal}
                formulario={formulario}
                setFormulario={
                    setFormulario
                }
                salvando={salvando}
                erro={erroModal}
                fecharModal={fecharModal}
                confirmar={confirmarModal}
            />
        </main>
    );
}

export default Caixa;