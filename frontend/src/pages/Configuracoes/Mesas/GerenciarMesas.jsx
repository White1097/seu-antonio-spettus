import { useMemo, useState } from 'react';
import {
    Edit3,
    Plus,
    Power,
    PowerOff,
    Search,
    Target
} from 'lucide-react';

import Layout from '../../../components/Layout/Layout';
import { useAuth } from '../../../context/AuthContext';
import { useMesas } from '../../../hooks/useMesas';
import { useMetaDiaria } from '../../../hooks/useMetaDiaria';
import {
    atualizarMesa,
    criarMesa
} from '../../../services/mesas';

import './GerenciarMesas.css';

function GerenciarMesas({
    mudarPagina
}) {
    const { cargo } = useAuth();
    const { metaDiaria, definirMetaDiaria } = useMetaDiaria();

    const {
        mesas,
        carregando,
        erro,
        atualizarMesas
    } = useMesas();

    const [pesquisa, setPesquisa] = useState('');
    const [metaDigitada, setMetaDigitada] = useState(String(metaDiaria));
    const [mensagemMeta, setMensagemMeta] = useState('');
    const [erroMeta, setErroMeta] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erroFormulario, setErroFormulario] = useState('');

    const [formulario, setFormulario] = useState({
        id: null,
        numero: '',
        nome: '',
        ordem: ''
    });

    const editando = Boolean(formulario.id);

    const mesasFiltradas = useMemo(() => {
        const termo = pesquisa
            .trim()
            .toLowerCase();

        return [...mesas]
            .sort(
                (mesaA, mesaB) =>
                    Number(mesaA.ordem) -
                    Number(mesaB.ordem)
            )
            .filter(mesa => {
                if (!termo) {
                    return true;
                }

                return (
                    String(mesa.numero).includes(termo) ||
                    String(mesa.nome)
                        .toLowerCase()
                        .includes(termo)
                );
            });
    }, [mesas, pesquisa]);


    function salvarMeta(evento) {
        evento.preventDefault();

        const valor = Number(
            String(metaDigitada).replace(',', '.')
        );

        if (!Number.isFinite(valor) || valor < 0) {
            setErroMeta('Informe uma meta diária válida.');
            setMensagemMeta('');
            return;
        }

        try {
            definirMetaDiaria(valor);
            setMetaDigitada(String(valor));
            setErroMeta('');
            setMensagemMeta('Meta diária salva com sucesso.');
        } catch (erroSalvarMeta) {
            setMensagemMeta('');
            setErroMeta(
                erroSalvarMeta.message ||
                'Não foi possível salvar a meta diária.'
            );
        }
    }

    function limparFormulario() {
        setFormulario({
            id: null,
            numero: '',
            nome: '',
            ordem: ''
        });

        setErroFormulario('');
    }

    function editarMesa(mesa) {
        setFormulario({
            id: mesa.id,
            numero: String(mesa.numero),
            nome: mesa.nome,
            ordem: String(mesa.ordem)
        });

        setMensagem('');
        setErroFormulario('');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    async function salvarMesa(evento) {
        evento.preventDefault();

        const numero = Number(formulario.numero);
        const ordem = Number(formulario.ordem || numero);
        const nome = formulario.nome.trim();

        if (
            !Number.isInteger(numero) ||
            numero <= 0
        ) {
            setErroFormulario(
                'Informe um número de mesa válido.'
            );
            return;
        }

        if (!nome) {
            setErroFormulario(
                'Informe o nome da mesa.'
            );
            return;
        }

        if (
            !Number.isInteger(ordem) ||
            ordem <= 0
        ) {
            setErroFormulario(
                'Informe uma ordem válida.'
            );
            return;
        }

        try {
            setSalvando(true);
            setMensagem('');
            setErroFormulario('');

            if (editando) {
                await atualizarMesa(
                    formulario.id,
                    {
                        numero,
                        nome,
                        ordem
                    }
                );

                setMensagem(
                    'Mesa atualizada com sucesso.'
                );
            } else {
                await criarMesa({
                    numero,
                    nome
                });

                if (ordem !== numero) {
                    const mesasAtualizadas =
                        await atualizarMesas();

                    const mesaCriada =
                        mesasAtualizadas?.find(
                            mesa =>
                                Number(mesa.numero) ===
                                numero
                        );

                    if (mesaCriada) {
                        await atualizarMesa(
                            mesaCriada.id,
                            {
                                ordem
                            }
                        );
                    }
                }

                setMensagem(
                    'Mesa criada com sucesso.'
                );
            }

            limparFormulario();
            await atualizarMesas();
        } catch (erroSalvar) {
            console.error(
                'Erro ao salvar mesa:',
                erroSalvar
            );

            const mensagemErro =
                String(
                    erroSalvar.message || ''
                ).toLowerCase();

            if (
                mensagemErro.includes('duplicate') ||
                mensagemErro.includes('unique')
            ) {
                setErroFormulario(
                    'Já existe uma mesa com esse número.'
                );
            } else {
                setErroFormulario(
                    erroSalvar.message ||
                    'Não foi possível salvar a mesa.'
                );
            }
        } finally {
            setSalvando(false);
        }
    }

    async function alterarStatus(mesa) {
        const novaSituacao = !mesa.ativa;

        const acao =
            novaSituacao
                ? 'reativar'
                : 'desativar';

        const confirmar = window.confirm(
            `Deseja ${acao} ${mesa.nome}?`
        );

        if (!confirmar) {
            return;
        }

        try {
            setMensagem('');
            setErroFormulario('');

            await atualizarMesa(
                mesa.id,
                {
                    ativa: novaSituacao
                }
            );

            await atualizarMesas();

            setMensagem(
                novaSituacao
                    ? 'Mesa reativada com sucesso.'
                    : 'Mesa desativada com sucesso.'
            );
        } catch (erroStatus) {
            console.error(
                'Erro ao alterar mesa:',
                erroStatus
            );

            setErroFormulario(
                erroStatus.message ||
                'Não foi possível alterar a mesa.'
            );
        }
    }

    if (cargo !== 'administrador') {
        return (
            <Layout
                paginaAtual="configuracoes"
                mudarPagina={mudarPagina}
                titulo="Configurações"
            >
                <div className="gerenciar-mesas-acesso-negado">
                    Somente administradores podem
                    gerenciar mesas.
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            paginaAtual="configuracoes"
            mudarPagina={mudarPagina}
            titulo="Gerenciar mesas"
        >
            <section className="gerenciar-mesas">
                <header className="gerenciar-mesas-cabecalho">
                    <div>
                        <span>Configurações</span>

                        <h2>
                            Mesas do restaurante
                        </h2>

                        <p>
                            Adicione, edite, organize,
                            desative ou reative mesas.
                        </p>
                    </div>

                    <div className="gerenciar-mesas-total">
                        <strong>{mesas.length}</strong>
                        <span>mesas cadastradas</span>
                    </div>
                </header>


                <form
                    className="gerenciar-meta-diaria"
                    onSubmit={salvarMeta}
                >
                    <div className="gerenciar-meta-titulo">
                        <Target size={22} />
                        <div>
                            <strong>Meta diária de faturamento</strong>
                            <span>Defina o valor usado no Painel Executivo.</span>
                        </div>
                    </div>

                    <div className="gerenciar-meta-conteudo">
                        <label>
                            <span>Valor da meta</span>
                            <div className="gerenciar-meta-campo">
                                <b>R$</b>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={metaDigitada}
                                    onChange={evento => {
                                        setMetaDigitada(evento.target.value);
                                        setMensagemMeta('');
                                        setErroMeta('');
                                    }}
                                    placeholder="2000,00"
                                    required
                                />
                            </div>
                        </label>

                        <button type="submit">Salvar meta</button>
                    </div>

                    {erroMeta && (
                        <div className="gerenciar-mesas-erro gerenciar-meta-mensagem">
                            {erroMeta}
                        </div>
                    )}

                    {mensagemMeta && (
                        <div className="gerenciar-mesas-sucesso gerenciar-meta-mensagem">
                            {mensagemMeta}
                        </div>
                    )}
                </form>

                <form
                    className="gerenciar-mesas-formulario"
                    onSubmit={salvarMesa}
                >
                    <div className="gerenciar-mesas-formulario-titulo">
                        <Plus size={21} />

                        <div>
                            <strong>
                                {editando
                                    ? 'Editar mesa'
                                    : 'Adicionar mesa'}
                            </strong>

                            <span>
                                Preencha os dados abaixo.
                            </span>
                        </div>
                    </div>

                    {erroFormulario && (
                        <div className="gerenciar-mesas-erro">
                            {erroFormulario}
                        </div>
                    )}

                    {mensagem && (
                        <div className="gerenciar-mesas-sucesso">
                            {mensagem}
                        </div>
                    )}

                    <div className="gerenciar-mesas-campos">
                        <label>
                            <span>Número</span>

                            <input
                                type="number"
                                min="1"
                                value={formulario.numero}
                                onChange={evento =>
                                    setFormulario(
                                        estado => ({
                                            ...estado,
                                            numero:
                                                evento.target.value
                                        })
                                    )
                                }
                                placeholder="Ex.: 9"
                                disabled={salvando}
                                required
                            />
                        </label>

                        <label>
                            <span>Nome</span>

                            <input
                                type="text"
                                value={formulario.nome}
                                onChange={evento =>
                                    setFormulario(
                                        estado => ({
                                            ...estado,
                                            nome:
                                                evento.target.value
                                        })
                                    )
                                }
                                placeholder="Ex.: Mesa 9"
                                disabled={salvando}
                                required
                            />
                        </label>

                        <label>
                            <span>Ordem</span>

                            <input
                                type="number"
                                min="1"
                                value={formulario.ordem}
                                onChange={evento =>
                                    setFormulario(
                                        estado => ({
                                            ...estado,
                                            ordem:
                                                evento.target.value
                                        })
                                    )
                                }
                                placeholder="Ex.: 9"
                                disabled={salvando}
                            />
                        </label>
                    </div>

                    <div className="gerenciar-mesas-botoes">
                        {editando && (
                            <button
                                type="button"
                                className="botao-cancelar-mesa"
                                onClick={limparFormulario}
                                disabled={salvando}
                            >
                                Cancelar
                            </button>
                        )}

                        <button
                            type="submit"
                            className="botao-salvar-mesa"
                            disabled={salvando}
                        >
                            {salvando
                                ? 'Salvando...'
                                : editando
                                    ? 'Salvar alterações'
                                    : 'Adicionar mesa'}
                        </button>
                    </div>
                </form>

                <section className="gerenciar-mesas-lista">
                    <div className="gerenciar-mesas-lista-topo">
                        <div>
                            <span>Mesas cadastradas</span>

                            <h3>
                                Organização atual
                            </h3>
                        </div>

                        <label className="gerenciar-mesas-pesquisa">
                            <Search size={18} />

                            <input
                                type="search"
                                value={pesquisa}
                                onChange={evento =>
                                    setPesquisa(
                                        evento.target.value
                                    )
                                }
                                placeholder="Pesquisar mesa..."
                            />
                        </label>
                    </div>

                    {carregando ? (
                        <div className="gerenciar-mesas-estado">
                            Carregando mesas...
                        </div>
                    ) : erro ? (
                        <div className="gerenciar-mesas-estado erro">
                            {erro}
                        </div>
                    ) : mesasFiltradas.length === 0 ? (
                        <div className="gerenciar-mesas-estado">
                            Nenhuma mesa encontrada.
                        </div>
                    ) : (
                        <div className="gerenciar-mesas-grid">
                            {mesasFiltradas.map(mesa => (
                                <article
                                    key={mesa.id}
                                    className={
                                        mesa.ativa
                                            ? 'gerenciar-mesa-card ativa'
                                            : 'gerenciar-mesa-card inativa'
                                    }
                                >
                                    <div className="gerenciar-mesa-card-topo">
                                        <div>
                                            <span>
                                                Mesa {mesa.numero}
                                            </span>

                                            <h4>
                                                {mesa.nome}
                                            </h4>
                                        </div>

                                        <span className="gerenciar-mesa-status">
                                            {mesa.ativa
                                                ? 'Ativa'
                                                : 'Inativa'}
                                        </span>
                                    </div>

                                    <div className="gerenciar-mesa-dados">
                                        <span>
                                            Ordem
                                        </span>

                                        <strong>
                                            {mesa.ordem}
                                        </strong>
                                    </div>

                                    <div className="gerenciar-mesa-acoes">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                editarMesa(mesa)
                                            }
                                        >
                                            <Edit3 size={17} />
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                mesa.ativa
                                                    ? 'desativar'
                                                    : 'reativar'
                                            }
                                            onClick={() =>
                                                alterarStatus(
                                                    mesa
                                                )
                                            }
                                        >
                                            {mesa.ativa ? (
                                                <PowerOff
                                                    size={17}
                                                />
                                            ) : (
                                                <Power
                                                    size={17}
                                                />
                                            )}

                                            {mesa.ativa
                                                ? 'Desativar'
                                                : 'Reativar'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </Layout>
    );
}

export default GerenciarMesas;