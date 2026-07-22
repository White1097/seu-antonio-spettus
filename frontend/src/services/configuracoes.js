import { supabase } from './supabase';

export const CONFIGURACAO_PADRAO = {
    id: 1,
    nome_sistema: 'Seu Antônio Spettus',
    logo_url: '/logo-seu-antonio.png',
    tema: 'claro',
    cor_primaria: '#3A083E',
    cor_secundaria: '#D4AF37',
    cor_sidebar: '#3A083E',
    cor_botoes: '#3A083E',
    cor_cards: '#FFFFFF',
    cor_tabela_cabecalho: '#F5EDF6',
    cor_tabela_linhas: '#FFFFFF',
    cor_tabela_hover: '#FFF8DC',
    cor_texto_primario: '#1F2937',
    cor_texto_secundario: '#6B7280',
    meta_diaria: 2000
};

export async function buscarConfiguracoes() {
    const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

    if (error) {
        console.warn('Configurações remotas indisponíveis:', error.message);
        return null;
    }

    return data ? { ...CONFIGURACAO_PADRAO, ...data } : null;
}

export async function salvarConfiguracoes(configuracoes) {
    const payload = {
        ...CONFIGURACAO_PADRAO,
        ...configuracoes,
        id: 1,
        meta_diaria: Number(configuracoes.meta_diaria || 0),
        atualizado_em: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('configuracoes_sistema')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function enviarLogo(arquivo) {
    if (!arquivo) throw new Error('Selecione uma imagem.');
    if (arquivo.size > 3 * 1024 * 1024) {
        throw new Error('A logo deve ter no máximo 3 MB.');
    }

    const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'png';
    const permitidas = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
    if (!permitidas.includes(extensao)) {
        throw new Error('Use PNG, JPG, WEBP ou SVG.');
    }

    const caminho = `logo-atual.${extensao}`;
    const { error } = await supabase.storage
        .from('identidade-visual')
        .upload(caminho, arquivo, {
            cacheControl: '3600',
            upsert: true,
            contentType: arquivo.type || undefined
        });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
        .from('identidade-visual')
        .getPublicUrl(caminho);

    return `${data.publicUrl}?v=${Date.now()}`;
}
