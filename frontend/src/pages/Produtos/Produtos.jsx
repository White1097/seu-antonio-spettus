import { useState } from 'react';
import './Produtos.css';

function Produtos({ produtos, setProdutos, voltarDashboard }) {
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [categoria, setCategoria] = useState('');
    const [editandoId, setEditandoId] = useState(null);

    async function carregarProdutos() {
        const resposta = await fetch('http://localhost:3000/produtos');
        const dados = await resposta.json();

        setProdutos(
            dados.map(produto => ({
                ...produto,
                preco: Number(produto.preco)
            }))
        );
    }

    function limparFormulario() {
        setNome('');
        setPreco('');
        setCategoria('');
        setEditandoId(null);
    }

    async function salvarProduto() {
        if (!nome || !preco || !categoria) {
            alert('Preencha nome, preço e categoria.');
            return;
        }

        const produto = {
            nome,
            preco: Number(preco),
            categoria
        };

        if (editandoId) {
            await fetch(`http://localhost:3000/produtos/${editandoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produto)
            });
        } else {
            await fetch('http://localhost:3000/produtos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produto)
            });
        }

        limparFormulario();
        carregarProdutos();
    }

    function editarProduto(produto) {
        setEditandoId(produto.id);
        setNome(produto.nome);
        setPreco(produto.preco);
        setCategoria(produto.categoria);
    }

    async function excluirProduto(id) {
        const confirmar = confirm('Deseja excluir este produto?');

        if (!confirmar) {
            return;
        }

        await fetch(`http://localhost:3000/produtos/${id}`, {
            method: 'DELETE'
        });

        carregarProdutos();
    }

    return (
        <div className="produtos-page">
            <button
                className="botao-voltar-produtos"
                onClick={voltarDashboard}
            >
                ← Voltar
            </button>

            <h1>Gerenciar Produtos</h1>

            <div className="form-produto">
                <input
                    type="text"
                    placeholder="Nome do produto"
                    value={nome}
                    onChange={evento => setNome(evento.target.value)}
                />

                <input
                    type="number"
                    placeholder="Preço"
                    value={preco}
                    onChange={evento => setPreco(evento.target.value)}
                />

                <input
                    type="text"
                    placeholder="Categoria"
                    value={categoria}
                    onChange={evento => setCategoria(evento.target.value)}
                />

                <button onClick={salvarProduto}>
                    {editandoId ? 'Salvar edição' : 'Adicionar produto'}
                </button>

                {editandoId && (
                    <button
                        className="botao-cancelar-edicao"
                        onClick={limparFormulario}
                    >
                        Cancelar
                    </button>
                )}
            </div>

            <div className="lista-produtos-admin">
                {produtos.map(produto => (
                    <div
                        className="produto-admin"
                        key={produto.id}
                    >
                        <div>
                            <h2>{produto.nome}</h2>
                            <p>{produto.categoria}</p>
                            <strong>
                                R$ {produto.preco.toFixed(2)}
                            </strong>
                        </div>

                        <div className="acoes-produto">
                            <button onClick={() => editarProduto(produto)}>
                                Editar
                            </button>

                            <button
                                className="botao-excluir-produto"
                                onClick={() => excluirProduto(produto.id)}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Produtos;