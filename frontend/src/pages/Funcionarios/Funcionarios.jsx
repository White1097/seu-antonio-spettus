import {
    useEffect,
    useMemo,
    useState
} from 'react';

import FuncionariosToolbar from '../../components/Funcionarios/FuncionariosToolbar';
import FuncionariosGrid from '../../components/Funcionarios/FuncionariosGrid';
import FuncionarioModal from '../../components/Funcionarios/FuncionarioModal';

import {
    alterarStatusFuncionario,
    atualizarFuncionario,
    criarFuncionario,
    excluirFuncionario,
    listarFuncionarios
} from '../../services/funcionarios';

import './Funcionarios.css';

const FORMULARIO_INICIAL = {
    id: null,
    nome: '',
    email: '',
    senha: '',
    cargo: 'garçom',
    ativo: true,
    avatar: ''
};

function Funcionarios({
    voltarDashboard
}) {
    const [funcionarios, setFuncionarios] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [busca, setBusca] =
        useState('');

    const [cargo, setCargo] =
        useState('todos');

    const [
        mostrarInativos,
        setMostrarInativos
    ] = useState(false);

    const [
        modalAberto,
        setModalAberto
    ] = useState(false);

    const [salvando, setSalvando] =
        useState(false);

    const [erroModal, setErroModal] =
        useState('');

    const [
        formulario,
        setFormulario
    ] = useState(FORMULARIO_INICIAL);

    const editando = Boolean(
        formulario.id
    );

    useEffect(() => {
        carregarFuncionarios();
    }, []);

    async function carregarFuncionarios() {
        try {
            setCarregando(true);

            const dados =
                await listarFuncionarios();

            setFuncionarios(dados);
        } catch (erro) {
            console.error(
                'Erro ao carregar funcionários:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível carregar os funcionários.'
            );
        } finally {
            setCarregando(false);
        }
    }

    const funcionariosFiltrados =
        useMemo(() => {
            const termo = busca
                .trim()
                .toLowerCase();

            return funcionarios.filter(
                funcionario => {
                    const correspondeBusca =
                        !termo ||
                        String(
                            funcionario.nome || ''
                        )
                            .toLowerCase()
                            .includes(termo) ||
                        String(
                            funcionario.email || ''
                        )
                            .toLowerCase()
                            .includes(termo);

                    const correspondeCargo =
                        cargo === 'todos' ||
                        funcionario.cargo ===
                            cargo;

                    const correspondeStatus =
                        mostrarInativos ||
                        funcionario.ativo;

                    return (
                        correspondeBusca &&
                        correspondeCargo &&
                        correspondeStatus
                    );
                }
            );
        }, [
            funcionarios,
            busca,
            cargo,
            mostrarInativos
        ]);

    function abrirNovoFuncionario() {
        setFormulario(
            FORMULARIO_INICIAL
        );

        setErroModal('');
        setModalAberto(true);
    }

    function editarFuncionario(
        funcionario
    ) {
        setFormulario({
            id: funcionario.id,
            nome: funcionario.nome || '',
            email: funcionario.email || '',
            senha: '',
            cargo:
                funcionario.cargo ||
                'garçom',
            ativo:
                funcionario.ativo !==
                false,
            avatar:
                funcionario.avatar || ''
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

    async function salvarFuncionario(
        evento
    ) {
        evento.preventDefault();

        const nome =
            formulario.nome.trim();

        const email =
            formulario.email
                .trim()
                .toLowerCase();

        const senha =
            formulario.senha;

        if (!nome) {
            setErroModal(
                'Informe o nome do funcionário.'
            );

            return;
        }

        if (!email) {
            setErroModal(
                'Informe o e-mail do funcionário.'
            );

            return;
        }

        if (
            !editando &&
            senha.length < 6
        ) {
            setErroModal(
                'A senha deve ter pelo menos 6 caracteres.'
            );

            return;
        }

        if (
            ![
                'garçom',
                'caixa',
                'administrador'
            ].includes(
                formulario.cargo
            )
        ) {
            setErroModal(
                'Selecione um cargo válido.'
            );

            return;
        }

        try {
            setSalvando(true);
            setErroModal('');

            if (editando) {
                await atualizarFuncionario(
                    formulario.id,
                    {
                        nome,
                        cargo:
                            formulario.cargo,
                        ativo:
                            formulario.ativo,
                        avatar:
                            formulario.avatar
                    }
                );
            } else {
                await criarFuncionario({
                    nome,
                    email,
                    senha,
                    cargo:
                        formulario.cargo,
                    ativo:
                        formulario.ativo,
                    avatar:
                        formulario.avatar
                });
            }

            await carregarFuncionarios();

            setModalAberto(false);
            setFormulario(
                FORMULARIO_INICIAL
            );
        } catch (erro) {
            console.error(
                'Erro ao salvar funcionário:',
                erro
            );

            const mensagem =
                String(
                    erro.message || ''
                );

            if (
                mensagem
                    .toLowerCase()
                    .includes(
                        'already registered'
                    )
            ) {
                setErroModal(
                    'Este e-mail já está cadastrado.'
                );
            } else {
                setErroModal(
                    mensagem ||
                    'Não foi possível salvar o funcionário.'
                );
            }
        } finally {
            setSalvando(false);
        }
    }

    async function alternarStatus(
        funcionario
    ) {
        const acao =
            funcionario.ativo
                ? 'desativar'
                : 'ativar';

        const confirmar =
            window.confirm(
                `Deseja ${acao} "${funcionario.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await alterarStatusFuncionario(
                funcionario
            );

            await carregarFuncionarios();
        } catch (erro) {
            console.error(
                'Erro ao alterar status:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível alterar o status do funcionário.'
            );
        }
    }

    async function removerFuncionario(
        funcionario
    ) {
        const confirmar =
            window.confirm(
                `Deseja excluir permanentemente "${funcionario.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await excluirFuncionario(
                funcionario.id
            );

            await carregarFuncionarios();
        } catch (erro) {
            console.error(
                'Erro ao excluir funcionário:',
                erro
            );

            window.alert(
                erro.message ||
                'Não foi possível excluir o funcionário.'
            );
        }
    }

    const totalAtivos =
        funcionarios.filter(
            funcionario =>
                funcionario.ativo
        ).length;

    return (
        <main className="funcionarios-page">
            <header className="funcionarios-cabecalho">
                <div>
                    <span>
                        Administração
                    </span>

                    <h1>
                        Gerenciar funcionários
                    </h1>

                    <p>
                        Crie acessos, defina cargos e
                        controle os funcionários ativos.
                    </p>
                </div>

                <div className="funcionarios-cabecalho-acoes">
                    <div className="funcionarios-resumo">
                        <strong>
                            {totalAtivos}
                        </strong>

                        <span>
                            funcionários ativos
                        </span>
                    </div>

                    <button
                        type="button"
                        className="funcionarios-voltar"
                        onClick={
                            voltarDashboard
                        }
                    >
                        Voltar ao dashboard
                    </button>
                </div>
            </header>

            <FuncionariosToolbar
                busca={busca}
                setBusca={setBusca}
                cargo={cargo}
                setCargo={setCargo}
                mostrarInativos={
                    mostrarInativos
                }
                setMostrarInativos={
                    setMostrarInativos
                }
                abrirNovoFuncionario={
                    abrirNovoFuncionario
                }
            />

            <FuncionariosGrid
                funcionarios={
                    funcionariosFiltrados
                }
                carregando={carregando}
                editarFuncionario={
                    editarFuncionario
                }
                excluirFuncionario={
                    removerFuncionario
                }
                alternarStatus={
                    alternarStatus
                }
            />

            <FuncionarioModal
                aberto={modalAberto}
                editando={editando}
                formulario={formulario}
                setFormulario={
                    setFormulario
                }
                salvando={salvando}
                erro={erroModal}
                fecharModal={fecharModal}
                salvarFuncionario={
                    salvarFuncionario
                }
            />
        </main>
    );
}

export default Funcionarios;