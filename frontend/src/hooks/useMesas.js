import {
    useCallback,
    useEffect,
    useState
} from 'react';

import { supabase } from '../services/supabase';
import { listarMesas } from '../services/mesas';

export function useMesas() {
    const [mesas, setMesas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const carregarMesas = useCallback(async () => {
        try {
            setCarregando(true);
            setErro('');

            const dados = await listarMesas();

            setMesas(dados);
        } catch (erroCarregamento) {
            console.error(
                'Erro ao carregar mesas:',
                erroCarregamento
            );

            setErro(
                erroCarregamento.message ||
                'Não foi possível carregar as mesas.'
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarMesas();

        const canal = supabase
            .channel('mesas-tempo-real')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mesas'
                },
                () => {
                    carregarMesas();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(canal);
        };
    }, [carregarMesas]);

    return {
        mesas,
        carregando,
        erro,
        atualizarMesas: carregarMesas
    };
}