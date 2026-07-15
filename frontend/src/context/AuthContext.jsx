import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let ativo = true;

        async function iniciarAutenticacao() {
            try {
                const {
                    data,
                    error
                } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                const sessaoAtual = data.session ?? null;

                if (!ativo) {
                    return;
                }

                setSession(sessaoAtual);
                setUser(sessaoAtual?.user ?? null);

                if (sessaoAtual?.user) {
                    await carregarPerfil(
                        sessaoAtual.user.id
                    );
                } else {
                    setPerfil(null);
                }
            } catch (erro) {
                console.error(
                    'Erro ao recuperar a sessão:',
                    erro
                );

                if (ativo) {
                    setSession(null);
                    setUser(null);
                    setPerfil(null);
                }
            } finally {
                if (ativo) {
                    setLoading(false);
                }
            }
        }

        iniciarAutenticacao();

        const {
            data: {
                subscription
            }
        } = supabase.auth.onAuthStateChange(
            async (_evento, novaSessao) => {
                if (!ativo) {
                    return;
                }

                setSession(novaSessao);
                setUser(novaSessao?.user ?? null);

                if (novaSessao?.user) {
                    await carregarPerfil(
                        novaSessao.user.id
                    );
                } else {
                    setPerfil(null);
                }

                setLoading(false);
            }
        );

        return () => {
            ativo = false;
            subscription.unsubscribe();
        };
    }, []);

    async function carregarPerfil(userId) {
        try {
            const {
                data,
                error
            } = await supabase
                .from('perfis')
                .select(`
                    id,
                    nome,
                    email,
                    cargo,
                    ativo,
                    criado_em,
                    atualizado_em
                `)
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                setPerfil(null);
                return null;
            }

            if (!data.ativo) {
                await supabase.auth.signOut();

                setSession(null);
                setUser(null);
                setPerfil(null);

                throw new Error(
                    'Este funcionário está desativado.'
                );
            }

            setPerfil(data);

            return data;
        } catch (erro) {
            console.error(
                'Erro ao carregar o perfil:',
                erro
            );

            setPerfil(null);

            throw erro;
        }
    }

    async function login(email, password) {
        const {
            data,
            error
        } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return {
                data: null,
                error
            };
        }

        try {
            const perfilCarregado =
                await carregarPerfil(
                    data.user.id
                );

            if (!perfilCarregado) {
                await supabase.auth.signOut();

                return {
                    data: null,
                    error: new Error(
                        'O usuário não possui perfil de funcionário.'
                    )
                };
            }

            setSession(data.session);
            setUser(data.user);

            return {
                data: {
                    ...data,
                    perfil: perfilCarregado
                },
                error: null
            };
        } catch (erroPerfil) {
            await supabase.auth.signOut();

            return {
                data: null,
                error: erroPerfil
            };
        }
    }

    async function logout() {
        const {
            error
        } = await supabase.auth.signOut();

        if (!error) {
            setSession(null);
            setUser(null);
            setPerfil(null);
        }

        return {
            error
        };
    }

    async function atualizarPerfil() {
        if (!user?.id) {
            return null;
        }

        return carregarPerfil(user.id);
    }

    const autenticado = Boolean(
        session &&
        user &&
        perfil &&
        perfil.ativo
    );

    const cargo = perfil?.cargo ?? null;

    const value = useMemo(
        () => ({
            session,
            user,
            perfil,
            cargo,
            loading,
            autenticado,
            login,
            logout,
            atualizarPerfil
        }),
        [
            session,
            user,
            perfil,
            cargo,
            loading,
            autenticado
        ]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error(
            'useAuth deve ser usado dentro de AuthProvider.'
        );
    }

    return contexto;
}