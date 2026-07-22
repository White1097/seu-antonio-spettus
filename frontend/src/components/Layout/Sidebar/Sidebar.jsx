import {
    BarChart3,
    Gauge,
    BookOpen,
    History,
    Home,
    LogOut,
    Settings,
    Users,
    WalletCards
} from 'lucide-react';

import {
    useLayoutEffect,
    useRef
} from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import './Sidebar.css';

const CHAVE_SCROLL_MENU = 'spettus-sidebar-menu-scroll';
let ultimaPosicaoMenu = Number(
    sessionStorage.getItem(CHAVE_SCROLL_MENU) || 0
);

const ITENS_MENU = [
    { id: 'dashboard', label: 'Dashboard', icone: Home, cargos: ['garçom', 'caixa', 'administrador'] },
    { id: 'executivo', label: 'Painel Executivo', icone: Gauge, cargos: ['caixa', 'administrador'] },
    { id: 'cardapio', label: 'Cardápio', icone: BookOpen, cargos: ['administrador'] },
    { id: 'historico', label: 'Histórico', icone: History, cargos: ['caixa', 'administrador'] },
    { id: 'caixa', label: 'Caixa', icone: WalletCards, cargos: ['caixa', 'administrador'] },
    { id: 'relatorios', label: 'Relatórios', icone: BarChart3, cargos: ['caixa', 'administrador'] },
    { id: 'funcionarios', label: 'Funcionários', icone: Users, cargos: ['administrador'] },
    { id: 'configuracoes', label: 'Configurações', icone: Settings, cargos: ['administrador'] }
];

function nomeCargo(cargo) {
    const cargos = {
        garçom: 'Garçom',
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
    const { perfil, cargo, logout } = useAuth();
    const { logoUrl, nomeSistema } = useTheme();
    const menuRef = useRef(null);

    function salvarPosicaoMenu() {
        const menu = menuRef.current;
        if (!menu) return;

        ultimaPosicaoMenu = menu.scrollTop;
        sessionStorage.setItem(
            CHAVE_SCROLL_MENU,
            String(ultimaPosicaoMenu)
        );
    }

    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return undefined;

        const restaurar = () => {
            menu.scrollTop = ultimaPosicaoMenu;
        };

        restaurar();
        const quadro = window.requestAnimationFrame(restaurar);

        menu.addEventListener(
            'scroll',
            salvarPosicaoMenu,
            { passive: true }
        );

        return () => {
            window.cancelAnimationFrame(quadro);
            salvarPosicaoMenu();
            menu.removeEventListener(
                'scroll',
                salvarPosicaoMenu
            );
        };
    }, [paginaAtual]);

    const itensVisiveis = ITENS_MENU.filter(
        item => item.cargos.includes(cargo)
    );

    async function sairDoSistema() {
        sessionStorage.removeItem(CHAVE_SCROLL_MENU);
        ultimaPosicaoMenu = 0;

        const { error } = await logout();

        if (error) {
            window.alert('Não foi possível sair do sistema.');
        }
    }

    function selecionarPagina(id) {
        salvarPosicaoMenu();
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

            <aside className={aberta ? 'sidebar aberta' : 'sidebar'}>
                <div className="sidebar-logo">
                    <img src={logoUrl} alt={nomeSistema} />
                </div>

                <nav ref={menuRef} className="sidebar-menu">
                    {itensVisiveis.map(item => {
                        const Icone = item.icone;
                        const ativo = paginaAtual === item.id;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={ativo ? 'sidebar-item ativo' : 'sidebar-item'}
                                onClick={() => selecionarPagina(item.id)}
                            >
                                <Icone size={21} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-final">
                    <button className="sidebar-sair" type="button" onClick={sairDoSistema}>
                        <LogOut size={21} />
                        <span>Sair</span>
                    </button>

                    <div className="sidebar-usuario">
                        <div className="sidebar-avatar">
                            {perfil?.nome?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="sidebar-usuario-info">
                            <strong>{perfil?.nome || 'Funcionário'}</strong>
                            <span>{nomeCargo(cargo)}</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
