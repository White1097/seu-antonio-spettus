import { useEffect, useMemo, useState } from 'react';
import { ImageUp, Paintbrush, RotateCcw, Save, Table2 } from 'lucide-react';

import Layout from '../../../components/Layout/Layout';
import { useTheme } from '../../../context/ThemeContext';
import { CONFIGURACAO_PADRAO, enviarLogo } from '../../../services/configuracoes';

import './Aparencia.css';

const CAMPOS_CORES = [
    ['cor_primaria', 'Cor principal'],
    ['cor_secundaria', 'Cor secundária'],
    ['cor_sidebar', 'Fundo da Sidebar'],
    ['cor_botoes', 'Cor dos botões'],
    ['cor_cards', 'Cor dos cards'],
    ['cor_tabela_cabecalho', 'Cabeçalho das tabelas'],
    ['cor_tabela_linhas', 'Linhas das tabelas'],
    ['cor_tabela_hover', 'Hover das tabelas'],
    ['cor_texto_primario', 'Texto principal'],
    ['cor_texto_secundario', 'Texto secundário']
];

function Aparencia({ mudarPagina }) {
    const {
        configuracoes,
        salvarConfiguracoes,
        restaurarPadrao,
        aplicarPreVisualizacao
    } = useTheme();

    const [formulario, setFormulario] = useState(configuracoes);
    const [arquivoLogo, setArquivoLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(configuracoes.logo_url);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        setFormulario(configuracoes);
        setPreviewLogo(configuracoes.logo_url);
    }, [configuracoes]);

    useEffect(() => {
        if (!arquivoLogo) return undefined;
        const url = URL.createObjectURL(arquivoLogo);
        setPreviewLogo(url);
        return () => URL.revokeObjectURL(url);
    }, [arquivoLogo]);

    const progressoMeta = useMemo(() => {
        const meta = Number(formulario.meta_diaria || 0);
        return meta > 0 ? 62 : 0;
    }, [formulario.meta_diaria]);

    function alterar(campo, valor) {
        const novo = { ...formulario, [campo]: valor };
        setFormulario(novo);
        setMensagem('');
        setErro('');
        aplicarPreVisualizacao(novo);
    }

    async function salvar(evento) {
        evento.preventDefault();
        const meta = Number(formulario.meta_diaria);
        if (!Number.isFinite(meta) || meta < 0) {
            setErro('Informe uma meta diária válida.');
            return;
        }

        try {
            setSalvando(true);
            setErro('');
            let logoUrl = formulario.logo_url;
            if (arquivoLogo) logoUrl = await enviarLogo(arquivoLogo);

            await salvarConfiguracoes({
                ...formulario,
                logo_url: logoUrl,
                meta_diaria: meta
            });

            setArquivoLogo(null);
            setPreviewLogo(logoUrl);
            setMensagem('Configurações salvas e aplicadas em todos os dispositivos.');
        } catch (erroSalvar) {
            setErro(
                `${erroSalvar.message || 'Não foi possível salvar no Supabase.'} ` +
                'A pré-visualização continua disponível neste dispositivo. Execute o SQL incluído no projeto para sincronizar.'
            );
        } finally {
            setSalvando(false);
        }
    }

    function restaurar() {
        if (!window.confirm('Restaurar a aparência original do sistema?')) return;
        restaurarPadrao();
        setFormulario(CONFIGURACAO_PADRAO);
        setArquivoLogo(null);
        setPreviewLogo(CONFIGURACAO_PADRAO.logo_url);
        setMensagem('Tema original restaurado. Clique em Salvar para sincronizar.');
    }

    return (
        <Layout paginaAtual="configuracoes" mudarPagina={mudarPagina} titulo="Configurações">
            <main className="aparencia-page">
                <header className="aparencia-cabecalho">
                    <div>
                        <span>Personalização</span>
                        <h2>Aparência do sistema</h2>
                        <p>Altere logo, nome, meta diária e todas as cores sem editar o código.</p>
                    </div>
                    <button type="button" className="aparencia-mesas" onClick={() => mudarPagina('gerenciar-mesas')}>
                        <Table2 size={19} /> Gerenciar mesas
                    </button>
                </header>

                <form className="aparencia-conteudo" onSubmit={salvar}>
                    {mensagem && <div className="aparencia-sucesso">{mensagem}</div>}
                    {erro && <div className="aparencia-erro">{erro}</div>}

                    <section className="aparencia-card">
                        <div className="aparencia-titulo"><ImageUp size={21} /><div><h3>Identidade</h3><p>Nome e logo exibidos no sistema.</p></div></div>
                        <div className="aparencia-identidade">
                            <div className="aparencia-logo-preview">
                                <img src={previewLogo || CONFIGURACAO_PADRAO.logo_url} alt="Prévia da logo" />
                            </div>
                            <div className="aparencia-campos-identidade">
                                <label><span>Nome do sistema</span><input value={formulario.nome_sistema || ''} onChange={e => alterar('nome_sistema', e.target.value)} maxLength="70" required /></label>
                                <label><span>Logo (PNG, JPG, WEBP ou SVG — até 3 MB)</span><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e => setArquivoLogo(e.target.files?.[0] || null)} /></label>
                            </div>
                        </div>
                    </section>

                    <section className="aparencia-card">
                        <div className="aparencia-titulo"><Paintbrush size={21} /><div><h3>Tema e cores</h3><p>A pré-visualização acontece imediatamente.</p></div></div>
                        <div className="aparencia-temas">
                            {['claro', 'escuro', 'automatico'].map(tema => (
                                <label key={tema} className={formulario.tema === tema ? 'ativo' : ''}>
                                    <input type="radio" name="tema" value={tema} checked={formulario.tema === tema} onChange={() => alterar('tema', tema)} />
                                    {tema === 'automatico' ? 'Automático' : tema[0].toUpperCase() + tema.slice(1)}
                                </label>
                            ))}
                        </div>
                        <div className="aparencia-cores">
                            {CAMPOS_CORES.map(([campo, rotulo]) => (
                                <label key={campo}><span>{rotulo}</span><div><input type="color" value={formulario[campo] || '#000000'} onChange={e => alterar(campo, e.target.value)} /><input type="text" value={formulario[campo] || ''} onChange={e => alterar(campo, e.target.value)} pattern="^#[0-9A-Fa-f]{6}$" /></div></label>
                            ))}
                        </div>
                    </section>

                    <section className="aparencia-card">
                        <div className="aparencia-titulo"><Paintbrush size={21} /><div><h3>Meta diária</h3><p>Usada no Dashboard e no Painel Executivo.</p></div></div>
                        <label className="aparencia-meta"><span>Valor da meta (R$)</span><input type="number" min="0" step="0.01" value={formulario.meta_diaria ?? ''} onChange={e => alterar('meta_diaria', e.target.value)} required /></label>
                    </section>

                    <section className="aparencia-preview">
                        <aside style={{ background: formulario.cor_sidebar }}><img src={previewLogo || CONFIGURACAO_PADRAO.logo_url} alt="" /><strong>{formulario.nome_sistema}</strong><span>Dashboard</span><span>Painel Executivo</span><span>Configurações</span></aside>
                        <div><h3>Pré-visualização</h3><div className="preview-cards"><article><span>Faturamento hoje</span><strong>R$ 1.240,00</strong></article><article><span>Meta diária</span><strong>62%</strong><i><b style={{ width: `${progressoMeta}%` }} /></i></article></div><button type="button">Botão principal</button></div>
                    </section>

                    <footer className="aparencia-acoes">
                        <button type="button" className="aparencia-restaurar" onClick={restaurar}><RotateCcw size={18} /> Restaurar padrão</button>
                        <button type="submit" className="aparencia-salvar" disabled={salvando}><Save size={18} /> {salvando ? 'Salvando...' : 'Salvar configurações'}</button>
                    </footer>
                </form>
            </main>
        </Layout>
    );
}

export default Aparencia;
