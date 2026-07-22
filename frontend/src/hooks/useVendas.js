import {
    useCallback,
    useEffect,
    useState
} from 'react';

import {
    listarVendas
} from '../services/vendas';

export function useVendas() {
    const [vendas, setVendas] =
        useState([]);

    const [carregando, setCarregando] =
        useState(true);

    const [erro, setErro] =
        useState('');

    const carregarVendas =
        useCallback(async () => {
            try {
                setCarregando(true);
                setErro('');

                const dados =
                    await listarVendas();

                setVendas(dados);
            } catch (erroCarregamento) {
                console.error(
                    'Erro ao carregar vendas:',
                    erroCarregamento
                );

                setErro(
                    erroCarregamento.message ||
                    'Não foi possível carregar as vendas.'
                );
            } finally {
                setCarregando(false);
            }
        }, []);

    useEffect(() => {
        carregarVendas();
    }, [carregarVendas]);

    return {
        vendas,
        carregando,
        erro,
        atualizarVendas:
            carregarVendas
    };
}