import { useTheme } from '../context/ThemeContext';

export function useMetaDiaria() {
    const { metaDiaria, configuracoes, salvarConfiguracoes } = useTheme();

    async function definirMetaDiaria(valor) {
        const novaMeta = Number(valor);
        if (!Number.isFinite(novaMeta) || novaMeta < 0) {
            throw new Error('Informe uma meta diária válida.');
        }
        await salvarConfiguracoes({ ...configuracoes, meta_diaria: novaMeta });
        return novaMeta;
    }

    return { metaDiaria, definirMetaDiaria };
}
