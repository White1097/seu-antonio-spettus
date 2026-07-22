import { supabase } from './supabase';

const CAMPOS_FUNCIONARIO = `
    id,
    nome,
    email,
    cargo,
    ativo,
    avatar,
    criado_em,
    atualizado_em
`;

function formatarFuncionario(funcionario) {
    return {
        ...funcionario,
        nome: funcionario.nome || '',
        email: funcionario.email || '',
        cargo: funcionario.cargo || 'garçom',
        ativo: funcionario.ativo !== false,
        avatar: funcionario.avatar || ''
    };
}

export async function listarFuncionarios() {
    const { data, error } = await supabase
        .from('perfis')
        .select(CAMPOS_FUNCIONARIO)
        .order('nome', {
            ascending: true
        });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(
        formatarFuncionario
    );
}

async function executarAcaoFuncionario(
    acao,
    dados = {}
) {
    const { data, error } =
        await supabase.functions.invoke(
            'gerenciar-funcionarios',
            {
                body: {
                    acao,
                    ...dados
                }
            }
        );

    if (error) {
        let mensagem =
            error.message ||
            'Não foi possível executar a operação.';

        try {
            const contexto =
                error.context;

            if (contexto?.json) {
                const resposta =
                    await contexto.json();

                mensagem =
                    resposta?.erro ||
                    resposta?.message ||
                    mensagem;
            }
        } catch (erroLeitura) {
            console.error(
                'Erro ao ler resposta da função:',
                erroLeitura
            );
        }

        throw new Error(mensagem);
    }

    if (data?.erro) {
        throw new Error(data.erro);
    }

    return data;
}

export async function criarFuncionario({
    nome,
    email,
    senha,
    cargo,
    ativo = true,
    avatar = ''
}) {
    return executarAcaoFuncionario(
        'criar',
        {
            nome: nome.trim(),
            email: email
                .trim()
                .toLowerCase(),
            senha,
            cargo,
            ativo,
            avatar: avatar.trim()
        }
    );
}

export async function atualizarFuncionario(
    id,
    {
        nome,
        cargo,
        ativo,
        avatar = ''
    }
) {
    return executarAcaoFuncionario(
        'atualizar',
        {
            id,
            nome: nome.trim(),
            cargo,
            ativo,
            avatar: avatar.trim()
        }
    );
}

export async function alterarStatusFuncionario(
    funcionario
) {
    return atualizarFuncionario(
        funcionario.id,
        {
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            ativo: !funcionario.ativo,
            avatar: funcionario.avatar || ''
        }
    );
}

export async function excluirFuncionario(id) {
    return executarAcaoFuncionario(
        'excluir',
        {
            id
        }
    );
}