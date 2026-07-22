import { useState } from 'react';

function Historico({
    vendas = [],
    limparHistorico,
    voltarDashboard
}) {
    const [limpando, setLimpando] = useState(false);
    const [mensagemErro, setMensagemErro] = useState('');

    const totalVendido = vendas.reduce((soma, venda) => {
        return soma + Number(venda.total || 0);
    }, 0);

    const produtosVendidos = {};

    vendas.forEach((venda) => {
        const itens = Array.isArray(venda.itens)
            ? venda.itens
            : [];

        itens.forEach((item) => {
            const nome = item.nome || 'Produto sem nome';
            const quantidade = Number(item.quantidade || 0);

            if (!produtosVendidos[nome]) {
                produtosVendidos[nome] = 0;
            }

            produtosVendidos[nome] += quantidade;
        });
    });

    const produtoMaisVendido = Object.entries(produtosVendidos)
        .sort((a, b) => b[1] - a[1])[0];

    async function handleLimparHistorico() {
        setMensagemErro('');

        if (vendas.length === 0) {
            window.alert('O histórico já está vazio.');
            return;
        }

        const confirmar = window.confirm(
            'Tem certeza de que deseja excluir todo o histórico de vendas? Essa ação não poderá ser desfeita.'
        );

        if (!confirmar) {
            return;
        }

        if (typeof limparHistorico !== 'function') {
            setMensagemErro(
                'A função responsável por excluir o histórico não foi encontrada.'
            );

            console.error(
                'A propriedade limparHistorico não foi enviada para o componente Historico.'
            );

            return;
        }

        try {
            setLimpando(true);

            const resultado = await limparHistorico();

            if (resultado === false) {
                throw new Error(
                    'Não foi possível excluir o histórico.'
                );
            }

            window.alert(
                'Histórico excluído com sucesso.'
            );
        } catch (erro) {
            console.error(
                'Erro ao limpar histórico:',
                erro
            );

            setMensagemErro(
                erro?.message ||
                'Ocorreu um erro ao excluir o histórico.'
            );
        } finally {
            setLimpando(false);
        }
    }

    return (
        <div
            style={{
                padding: '30px',
                background: '#F5F1E8',
                minHeight: '100vh'
            }}
        >
            <button
                type="button"
                onClick={voltarDashboard}
                disabled={limpando}
                style={{
                    background: '#C89B3C',
                    color: '#2D1F39',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: limpando
                        ? 'not-allowed'
                        : 'pointer',
                    marginBottom: '20px',
                    opacity: limpando ? 0.6 : 1
                }}
            >
                ← Voltar
            </button>

            <h1
                style={{
                    color: '#4A315C',
                    marginBottom: '10px'
                }}
            >
                Histórico de Vendas
            </h1>

            <h2
                style={{
                    color: '#2D1F39',
                    marginBottom: '10px'
                }}
            >
                Total vendido: R$ {totalVendido.toFixed(2)}
            </h2>

            <h3
                style={{
                    color: '#4A315C',
                    marginBottom: '20px'
                }}
            >
                Produto mais vendido:{' '}
                {produtoMaisVendido
                    ? `${produtoMaisVendido[0]} (${produtoMaisVendido[1]} unidades)`
                    : 'Nenhum produto vendido ainda'}
            </h3>

            <button
                type="button"
                onClick={handleLimparHistorico}
                disabled={
                    limpando ||
                    vendas.length === 0
                }
                style={{
                    background:
                        limpando || vendas.length === 0
                            ? '#9ca3af'
                            : '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor:
                        limpando || vendas.length === 0
                            ? 'not-allowed'
                            : 'pointer',
                    marginBottom: '20px',
                    transition:
                        'transform 0.15s ease, background 0.2s ease'
                }}
            >
                {limpando
                    ? 'Excluindo histórico...'
                    : 'Limpar histórico'}
            </button>

            {mensagemErro && (
                <div
                    style={{
                        maxWidth: '650px',
                        marginBottom: '20px',
                        padding: '12px 16px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}
                >
                    {mensagemErro}
                </div>
            )}

            {vendas.length === 0 ? (
                <p>Nenhuma venda fechada ainda.</p>
            ) : (
                vendas.map((venda) => {
                    const itens = Array.isArray(venda.itens)
                        ? venda.itens
                        : [];

                    return (
                        <div
                            key={venda.id}
                            style={{
                                background: 'white',
                                borderLeft: '5px solid #C89B3C',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '15px'
                            }}
                        >
                            <h2
                                style={{
                                    color: '#4A315C'
                                }}
                            >
                                Mesa {venda.mesa}
                                {venda.cliente
                                    ? ` - ${venda.cliente}`
                                    : ''}
                            </h2>

                            <p>
                                <strong>Data:</strong>{' '}
                                {venda.data || 'Não informada'}
                            </p>

                            <p>
                                <strong>Pagamento:</strong>{' '}
                                {venda.pagamento || 'Não informado'}
                            </p>

                            <p>
                                <strong>Subtotal:</strong>{' '}
                                R${' '}
                                {Number(
                                    venda.subtotal || 0
                                ).toFixed(2)}
                            </p>

                            <p>
                                <strong>Desconto:</strong>{' '}
                                R${' '}
                                {Number(
                                    venda.desconto || 0
                                ).toFixed(2)}
                            </p>

                            <p>
                                <strong>Acréscimo:</strong>{' '}
                                R${' '}
                                {Number(
                                    venda.acrescimo || 0
                                ).toFixed(2)}
                            </p>

                            <p>
                                <strong>Total:</strong>{' '}
                                R${' '}
                                {Number(
                                    venda.total || 0
                                ).toFixed(2)}
                            </p>

                            <br />

                            <strong>Itens:</strong>

                            {itens.length === 0 ? (
                                <p>
                                    Nenhum item registrado nesta venda.
                                </p>
                            ) : (
                                itens.map((item, index) => (
                                    <div
                                        key={
                                            item.id ||
                                            `${venda.id}-${index}`
                                        }
                                        style={{
                                            marginTop: '8px'
                                        }}
                                    >
                                        <p>
                                            {Number(
                                                item.quantidade || 0
                                            )}
                                            x{' '}
                                            {item.nome ||
                                                'Produto sem nome'}{' '}
                                            - R${' '}
                                            {(
                                                Number(
                                                    item.preco || 0
                                                ) *
                                                Number(
                                                    item.quantidade || 0
                                                )
                                            ).toFixed(2)}
                                        </p>

                                        {item.observacao && (
                                            <small>
                                                Observação:{' '}
                                                {item.observacao}
                                            </small>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default Historico;