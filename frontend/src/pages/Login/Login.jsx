import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye,
    EyeOff,
    LoaderCircle,
    LockKeyhole,
    Mail
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CONFIGURACAO_PADRAO } from '../../services/configuracoes';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { logoUrl, nomeSistema } = useTheme();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    const logoSistema = logoUrl || CONFIGURACAO_PADRAO.logo_url;
    const nomeExibido = nomeSistema || CONFIGURACAO_PADRAO.nome_sistema;

    async function entrarNoSistema(evento) {
        evento.preventDefault();

        if (!email.trim() || !senha) {
            setErro('Preencha o e-mail e a senha.');
            return;
        }

        try {
            setCarregando(true);
            setErro('');

            const { error } = await login(
                email.trim().toLowerCase(),
                senha
            );

            if (error) {
                if (error.message === 'Invalid login credentials') {
                    setErro('E-mail ou senha incorretos.');
                } else if (error.message === 'Email not confirmed') {
                    setErro('Este usuário ainda não foi confirmado.');
                } else {
                    setErro(
                        error.message ||
                        'Não foi possível entrar no sistema.'
                    );
                }

                return;
            }

            navigate('/', { replace: true });
        } catch (erroLogin) {
            console.error('Erro ao entrar no sistema:', erroLogin);
            setErro(
                'Não foi possível conectar ao sistema. Tente novamente.'
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-apresentacao">
                <div className="login-marca">
                    <img src={logoSistema} alt={nomeExibido} />
                </div>

                <div className="login-texto">
                    <span className="login-etiqueta">
                        Sistema de comandas
                    </span>

                    <h1>
                        Gestão rápida,
                        <br />
                        simples e segura.
                    </h1>

                    <p>
                        Controle mesas, comandas, produtos,
                        funcionários e relatórios em tempo real.
                    </p>
                </div>

                <div className="login-detalhe">
                    <span />
                    <strong>{nomeExibido}</strong>
                </div>
            </section>

            <section className="login-area-formulario">
                <div className="login-card">
                    <header className="login-cabecalho">
                        <div className="login-logo-mobile">
                            <img src={logoSistema} alt={nomeExibido} />
                        </div>

                        <span>Área da equipe</span>
                        <h2>Bem-vindo</h2>
                        <p>
                            Entre com o login fornecido pelo
                            administrador.
                        </p>
                    </header>

                    <form onSubmit={entrarNoSistema}>
                        {erro && (
                            <div
                                className="login-mensagem-erro"
                                role="alert"
                            >
                                {erro}
                            </div>
                        )}

                        <label className="login-campo">
                            <span>E-mail</span>

                            <div className="login-input-container">
                                <Mail size={19} aria-hidden="true" />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(evento) =>
                                        setEmail(evento.target.value)
                                    }
                                    placeholder="admin@seuantonio.com"
                                    autoComplete="email"
                                    disabled={carregando}
                                    required
                                />
                            </div>
                        </label>

                        <label className="login-campo">
                            <span>Senha</span>

                            <div className="login-input-container">
                                <LockKeyhole size={19} aria-hidden="true" />

                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    value={senha}
                                    onChange={(evento) =>
                                        setSenha(evento.target.value)
                                    }
                                    placeholder="Digite sua senha"
                                    autoComplete="current-password"
                                    disabled={carregando}
                                    required
                                />

                                <button
                                    className="botao-mostrar-senha"
                                    type="button"
                                    onClick={() =>
                                        setMostrarSenha((valorAtual) =>
                                            !valorAtual
                                        )
                                    }
                                    aria-label={
                                        mostrarSenha
                                            ? 'Ocultar senha'
                                            : 'Mostrar senha'
                                    }
                                    disabled={carregando}
                                >
                                    {mostrarSenha ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </label>

                        <button
                            className="botao-entrar"
                            type="submit"
                            disabled={carregando}
                        >
                            {carregando ? (
                                <>
                                    <LoaderCircle
                                        className="icone-carregando"
                                        size={21}
                                    />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar no sistema'
                            )}
                        </button>
                    </form>

                    <footer className="login-rodape">
                        <p>
                            Acesso exclusivo para funcionários
                            autorizados.
                        </p>
                        <small>{nomeExibido} © 2026</small>
                    </footer>
                </div>
            </section>
        </main>
    );
}

export default Login;
