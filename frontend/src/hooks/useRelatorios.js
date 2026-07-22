import { useCallback, useEffect, useState } from 'react';
import { buscarDadosRelatorios, criarRelatorioVazio } from '../services/relatorios';

function dataInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function periodoAnterior(periodo) {
    const inicio = new Date(periodo.inicio);
    const fim = new Date(periodo.fim);
    const duracao = fim.getTime() - inicio.getTime() + 1;
    const fimAnterior = new Date(inicio.getTime() - 1);
    const inicioAnterior = new Date(fimAnterior.getTime() - duracao + 1);
    return { inicio: dataInput(inicioAnterior), fim: dataInput(fimAnterior) };
}

export default function useRelatorios() {
    const [relatorio, setRelatorio] = useState(criarRelatorioVazio());
    const [comparativo, setComparativo] = useState(criarRelatorioVazio());
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [filtro, setFiltro] = useState('hoje');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');

    const carregarRelatorio = useCallback(async () => {
        try {
            setCarregando(true);
            setErro('');
            const dados = await buscarDadosRelatorios({ filtro, dataInicial, dataFinal });
            setRelatorio(dados);

            const anterior = periodoAnterior(dados.periodo);
            const dadosAnteriores = await buscarDadosRelatorios({
                filtro: 'personalizado',
                dataInicial: anterior.inicio,
                dataFinal: anterior.fim
            });
            setComparativo(dadosAnteriores);
        } catch (error) {
            console.error(error);
            setErro(error.message || 'Erro ao carregar os relatórios.');
            setRelatorio(criarRelatorioVazio());
            setComparativo(criarRelatorioVazio());
        } finally {
            setCarregando(false);
        }
    }, [filtro, dataInicial, dataFinal]);

    useEffect(() => { carregarRelatorio(); }, [carregarRelatorio]);

    function atualizarFiltro(novoFiltro, inicio = '', fim = '') {
        setFiltro(novoFiltro);
        setDataInicial(inicio);
        setDataFinal(fim);
    }

    return {
        relatorio,
        comparativo,
        carregando,
        erro,
        filtro,
        dataInicial,
        dataFinal,
        atualizarFiltro,
        carregarRelatorio
    };
}
