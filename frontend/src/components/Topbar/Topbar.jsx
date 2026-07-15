import {
    Bell,
    ChevronDown,
    Menu,
    Search
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

function formatarCargo(cargo) {
    const cargos = {
        garcom: 'Garçom',
        caixa: 'Caixa',
        administrador: 'Administrador'
    };

    return cargos[cargo] || 'Funcionário';
}

function Topbar({
    abrirMenu,
    titulo = 'Dashboard'
}) {
    const {
        perfil,
        cargo
    } = useAuth();

    const hora = new Date().getHours();

    let saudacao = 'Boa noite';

    if (hora < 12) {
        saudacao = 'Bom dia';
    } else if (hora < 18) {
        saudacao = 'Boa tarde';
    }

    return (
        <header className="topbar">
            <div className="topbar-esquerda">
                <button
                    className="topbar-menu"
                    onClick={abrirMenu}
                    type="button"
                    aria-label="Abrir menu"
                >
                    <Menu size={23} />
                </button>

                <div className="topbar-titulo">
                    <span className="topbar-saudacao">
                        {saudacao},
                    </span>

                    <h1>{titulo}</h1>
                </div>
            </div>

            <div className="topbar-direita">
                <label className="topbar-pesquisa">
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Pesquisar..."
                        aria-label="Pesquisar"
                    />
                </label>

                <button
                    className="topbar-notificacao"
                    type="button"
                    aria-label="Notificações"
                >
                    <Bell size={20} />

                    <span className="topbar-notificacao-badge">
                        3
                    </span>
                </button>

                <button
                    className="topbar-usuario"
                    type="button"
                >
                    <div className="topbar-avatar">
                        <img
                            src="/logo-seu-antonio.png"
                            alt=""
                        />
                    </div>

                    <div className="topbar-usuario-info">
                        <strong>
                            {perfil?.nome || 'Funcionário'}
                        </strong>

                        <span>
                            {formatarCargo(cargo)}
                        </span>
                    </div>

                    <ChevronDown
                        className="topbar-usuario-seta"
                        size={18}
                    />
                </button>
            </div>
        </header>
    );
}

export default Topbar;