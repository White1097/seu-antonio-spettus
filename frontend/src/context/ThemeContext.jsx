import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    buscarConfiguracoes,
    CONFIGURACAO_PADRAO,
    salvarConfiguracoes
} from '../services/configuracoes';

const ThemeContext = createContext(null);
const CHAVE_LOCAL = 'spettus-configuracoes-sistema';

function lerLocal() {
    try {
        return {
            ...CONFIGURACAO_PADRAO,
            ...JSON.parse(localStorage.getItem(CHAVE_LOCAL) || '{}')
        };
    } catch {
        return CONFIGURACAO_PADRAO;
    }
}

function resolverTema(tema) {
    if (tema === 'automatico') {
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? 'escuro'
            : 'claro';
    }
    return tema === 'escuro' ? 'escuro' : 'claro';
}

function aplicarConfiguracoes(config) {
    const raiz = document.documentElement;
    const temaResolvido = resolverTema(config.tema);
    raiz.dataset.theme = temaResolvido;
    raiz.style.colorScheme = temaResolvido === 'escuro' ? 'dark' : 'light';

    const variaveis = {
        '--cor-primaria': config.cor_primaria,
        '--cor-dourada': config.cor_secundaria,
        '--cor-sidebar': config.cor_sidebar,
        '--cor-botao-personalizado': config.cor_botoes,
        '--cor-card-personalizado': config.cor_cards,
        '--cor-tabela-cabecalho': config.cor_tabela_cabecalho,
        '--cor-tabela-linhas': config.cor_tabela_linhas,
        '--cor-tabela-hover': config.cor_tabela_hover,
        '--cor-texto': config.cor_texto_primario,
        '--cor-texto-secundario': config.cor_texto_secundario
    };

    Object.entries(variaveis).forEach(([nome, valor]) => {
        if (valor) raiz.style.setProperty(nome, valor);
    });

    document.title = config.nome_sistema || CONFIGURACAO_PADRAO.nome_sistema;
}

export function ThemeProvider({ children }) {
    const [configuracoes, setConfiguracoes] = useState(lerLocal);
    const [carregandoConfiguracoes, setCarregandoConfiguracoes] = useState(true);

    const atualizarLocal = useCallback((novas) => {
        const completas = { ...CONFIGURACAO_PADRAO, ...novas };
        setConfiguracoes(completas);
        localStorage.setItem(CHAVE_LOCAL, JSON.stringify(completas));
        aplicarConfiguracoes(completas);
        return completas;
    }, []);

    useEffect(() => {
        aplicarConfiguracoes(configuracoes);

        buscarConfiguracoes()
            .then((remotas) => {
                if (remotas) atualizarLocal(remotas);
            })
            .catch((erro) => console.warn(erro))
            .finally(() => setCarregandoConfiguracoes(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (configuracoes.tema !== 'automatico') return undefined;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const atualizar = () => aplicarConfiguracoes(configuracoes);
        media.addEventListener?.('change', atualizar);
        return () => media.removeEventListener?.('change', atualizar);
    }, [configuracoes]);

    const salvar = useCallback(async (novas) => {
        const completas = atualizarLocal({ ...configuracoes, ...novas });
        try {
            const remotas = await salvarConfiguracoes(completas);
            return atualizarLocal(remotas);
        } catch (erro) {
            console.warn('Configuração salva apenas neste dispositivo:', erro.message);
            throw erro;
        }
    }, [configuracoes, atualizarLocal]);

    const restaurarPadrao = useCallback(() => atualizarLocal(CONFIGURACAO_PADRAO), [atualizarLocal]);

    const definirTema = useCallback((tema) => {
        atualizarLocal({ ...configuracoes, tema });
    }, [configuracoes, atualizarLocal]);

    const alternarTema = useCallback(() => {
        const atual = resolverTema(configuracoes.tema);
        definirTema(atual === 'escuro' ? 'claro' : 'escuro');
    }, [configuracoes.tema, definirTema]);

    const valor = useMemo(() => ({
        configuracoes,
        carregandoConfiguracoes,
        nomeSistema: configuracoes.nome_sistema,
        logoUrl: configuracoes.logo_url || CONFIGURACAO_PADRAO.logo_url,
        metaDiaria: Number(configuracoes.meta_diaria || 0),
        tema: configuracoes.tema,
        temaEscuro: resolverTema(configuracoes.tema) === 'escuro',
        salvarConfiguracoes: salvar,
        restaurarPadrao,
        definirTema,
        alternarTema,
        aplicarPreVisualizacao: atualizarLocal
    }), [configuracoes, carregandoConfiguracoes, salvar, restaurarPadrao, definirTema, alternarTema, atualizarLocal]);

    return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const contexto = useContext(ThemeContext);
    if (!contexto) throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
    return contexto;
}
