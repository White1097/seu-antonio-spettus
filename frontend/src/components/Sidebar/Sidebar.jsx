import {
    BarChart3,
    BookOpen,
    ClipboardList,
    History,
    Home,
    LogOut,
    Settings,
    Table2,
    Users
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const ITENS_MENU = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icone: Home,
        cargos: ['garcom', 'caixa', 'administrador']
    },
    {
        id: 'mesas',
        label: 'Mesas',
        icone: Table2,
        cargos: ['garcom', 'caixa', 'administrador']
    },
    {
        id: 'cardapio',
        label: 'Cardápio',
        icone: BookOpen,
        cargos: ['administrador']
    },
    {
        id: 'comandas',
        label: 'Comandas',
        icone: ClipboardList,
        cargos: ['garcom', 'caixa', 'administrador']
    },
    {
        id: 'historico',
        label: 'Histórico',
        icone: History,
        cargos: ['caixa', 'administrador']
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        icone: BarChart3,
        cargos: ['caixa', 'administrador']
    },
    {
        id: 'funcionarios',
        label: 'Funcionários',
        icone: Users,
        cargos: ['administrador']
    },
    {
        id: 'configuracoes',
        label: 'Configurações',
        icone: Settings,
        cargos: ['administrador']
    }
];

function nomeCargo(cargo) {
    const cargos = {
        garcom: 'Garçom',
        caixa: 'Caixa',
        administrador: 'Administrador'
    };

    return cargos[cargo] || 'Funcionário';
}

function Sidebar({
    paginaAtual,
    mudarPagina,
    aberta,
    fecharNoMobile
}) {
    const {
        perfil,
        cargo,
        logout
    } = useAuth();

    const itensVisiveis = ITENS_MENU.filter(item =>
        item.cargos.includes(cargo)
    );

    async function sairDoSistema() {
        const { error } = await logout();

        if (error) {
            window.alert(
                'Não foi possível sair do sistema.'
            );
        }
    }

    function selecionarPagina(id) {
        mudarPagina(id);

        if (fecharNoMobile) {
            fecharNoMobile();
        }
    }

    return (
        <>
            {aberta && (
                <button
                    className="sidebar-overlay"
                    type="button"
                    onClick={fecharNoMobile}
                    aria-label="Fechar menu"
                />
            )}

            <aside
                className={
                    aberta
                        ? 'sidebar aberta'
                        : 'sidebar'
                }
            >
                <div className="sidebar-logo">
                    <img
                        src="/logo-seu-antonio.png"
                        alt="Seu Antônio Spettus"
                    />
                </div>

                <nav className="sidebar-menu">
                    {itensVisiveis.map(item => {
                        const Icone = item.icone;
                        const ativo =
                            paginaAtual === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={
                                    ativo
                                        ? 'sidebar-item ativo'
                                        : 'sidebar-item'
                                }
                                onClick={() =>
                                    selecionarPagina(item.id)
                                }
                            >
                                <Icone size={21} />

                                <span>
                                    {item.label}
                                </span>

                                {item.id === 'relatorios' && (
                                    <small>
                                        NOVO
                                    </small>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-final">
                    <button
                        className="sidebar-sair"
                        type="button"
                        onClick={sairDoSistema}
                    >
                        <LogOut size={21} />
                        <span>Sair</span>
                    </button>

                    <div className="sidebar-usuario">
                        <div className="sidebar-avatar">
                            {perfil?.nome
                                ?.charAt(0)
                                .toUpperCase() || 'U'}
                        </div>

                        <div className="sidebar-usuario-info">
                            <strong>
                                {perfil?.nome || 'Funcionário'}
                            </strong>

                            <span>
                                {nomeCargo(cargo)}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;