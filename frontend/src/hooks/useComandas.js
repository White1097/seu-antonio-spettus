import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import {
    assinarComandas,
    listarComandas
} from '../services/comandas';

function criarComandaVazia(numeroMesa) {
    return {
        mesa: Number(numeroMesa),
        cliente: '',
        itens: [],
        desconto: 0,
        acrescimo: 0,
        aberto_por: null,
        atualizado_por: null,
        aberto_em: null,
        atualizado_em: null
    };
}

export function useComandas() {
    const [comandas, setComandas] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const primeiraCargaConcluida = useRef(false);
    const mesasEmEdicaoLocal = useRef(new Map());

    const carregarComandas = useCallback(async ({
        mostrarCarregamento = false
    } = {}) => {
        try {
            if (
                mostrarCarregamento ||
                !primeiraCargaConcluida.current
            ) {
                setCarregando(true);
            }

            setErro('');

            const dados = await listarComandas();
            const comandasFormatadas = {};

            dados.forEach(comanda => {
                const numeroMesa = Number(comanda.mesa);

                comandasFormatadas[numeroMesa] = {
                    ...criarComandaVazia(numeroMesa),
                    ...comanda
                };
            });

            setComandas(comandasFormatadas);
            primeiraCargaConcluida.current = true;
        } catch (erroCarregamento) {
            console.error(
                'Erro ao carregar comandas:',
                erroCarregamento
            );

            setErro(
                erroCarregamento.message ||
                'Não foi possível carregar as comandas.'
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarComandas({
            mostrarCarregamento: true
        });

        const cancelarAssinatura = assinarComandas(evento => {
            const numeroMesa = Number(
                evento.nova?.mesa ||
                evento.anterior?.mesa
            );

            if (!numeroMesa) {
                return;
            }

            const bloqueadoAte =
                mesasEmEdicaoLocal.current.get(numeroMesa) || 0;

            // Evita que um evento Realtime atrasado sobrescreva os cliques
            // que ainda estão sendo agrupados e salvos localmente.
            if (Date.now() < bloqueadoAte) {
                return;
            }

            setComandas(comandasAtuais => {
                if (evento.eventType === 'DELETE') {
                    const copia = { ...comandasAtuais };
                    delete copia[numeroMesa];
                    return copia;
                }

                if (!evento.nova) {
                    return comandasAtuais;
                }

                return {
                    ...comandasAtuais,
                    [numeroMesa]: {
                        ...criarComandaVazia(numeroMesa),
                        ...evento.nova
                    }
                };
            });
        });

        return cancelarAssinatura;
    }, [carregarComandas]);

    function obterComanda(numeroMesa) {
        const numero = Number(numeroMesa);

        return (
            comandas[numero] ||
            criarComandaVazia(numero)
        );
    }

    function atualizarComandaLocal(numeroMesa, alteracoes) {
        const numero = Number(numeroMesa);

        // O bloqueio cobre o debounce, a requisição e a chegada do evento
        // Realtime da própria alteração.
        mesasEmEdicaoLocal.current.set(
            numero,
            Date.now() + 2000
        );

        setComandas(comandasAtuais => {
            const comandaAtual =
                comandasAtuais[numero] ||
                criarComandaVazia(numero);

            return {
                ...comandasAtuais,
                [numero]: {
                    ...comandaAtual,
                    ...alteracoes,
                    mesa: numero
                }
            };
        });
    }

    function removerComandaLocal(numeroMesa) {
        const numero = Number(numeroMesa);

        mesasEmEdicaoLocal.current.set(
            numero,
            Date.now() + 2000
        );

        setComandas(comandasAtuais => {
            const copia = { ...comandasAtuais };
            delete copia[numero];
            return copia;
        });
    }

    return {
        comandas,
        carregando,
        erro,
        obterComanda,
        atualizarComandaLocal,
        removerComandaLocal,
        atualizarComandas: () =>
            carregarComandas({
                mostrarCarregamento: false
            })
    };
}
