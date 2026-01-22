// src/app/clientes/[id]/page.tsx
'use client'; // Necessário para hooks
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { buscarClientePorId } from '@/lib/apiService'; // Ajuste o caminho se necessário
import type { ClienteResponseDTO } from '@/lib/types'; // Ajuste o caminho se necessário
export default function ClienteDetalhesPage() {
    const params = useParams();
    // CORREÇÃO: Linha do const router = useRouter(); removida pois não era utilizada
    const idPath = Array.isArray(params.id) ? params.id[0] : params.id;

    const [cliente, setCliente] = useState<ClienteResponseDTO | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (idPath) {
            const clienteId = Number(idPath);
            if (isNaN(clienteId)) {
                setErro("ID do cliente inválido na URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            buscarClientePorId(clienteId)
                .then(data => {
                    setCliente(data);
                    setErro(null);
                })
                .catch(error => {
                    console.error("Erro ao buscar cliente por ID:", error);
                    setErro(`Falha ao carregar cliente: ${error.message || 'Cliente não encontrado.'}`);
                    setCliente(null);
                })
                .finally(() => setLoading(false));
        } else {
            setErro("ID do cliente não fornecido na rota.");
            setLoading(false);
        }
    }, [idPath]);

    if (loading) return <div className="container"><p>Carregando detalhes do cliente...</p></div>;
    if (erro) return <div className="container"><p className="message error">{erro}</p><Link href="/clientes/listar">Voltar para Lista</Link></div>;
    if (!cliente) return <div className="container"><p>Cliente não encontrado.</p><Link href="/clientes/listar">Voltar para Lista</Link></div>;

    const contatoPrincipal = cliente.contatos && cliente.contatos.length > 0 ? cliente.contatos[0] : null;
    const enderecoPrincipal = cliente.enderecos && cliente.enderecos.length > 0 ? cliente.enderecos[0] : null;

    return (
        <div className="container">
            <h1 className="page-title">Detalhes do Cliente</h1>
            <div style={{ backgroundColor: 'white', padding: '20px 25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{borderBottom: '1px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>{cliente.nome} {cliente.sobrenome}</h2>
                <p><strong className="label"><span className="material-icons-outlined">badge</span> ID:</strong> {cliente.idCliente}</p>
                <p><strong className="label"><span className="material-icons-outlined">cake</span> Data de Nascimento:</strong> {new Date(cliente.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                <p><strong className="label"><span className="material-icons-outlined">article</span> Documento:</strong> {cliente.documento}</p>

                {contatoPrincipal && (
                    <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                        <h3><span className="material-icons-outlined">contact_phone</span> Contato Principal:</h3>
                        <div style={{ paddingLeft: '10px', textIndent: '-10px', marginLeft:'10px' }}> {/* Ajuste para alinhar ícones com texto */}
                            <p><strong className="label"><span className="material-icons-outlined" style={{fontSize:'1.1em'}}>email</span> Email:</strong> {contatoPrincipal.email}</p>
                            <p><strong className="label"><span className="material-icons-outlined" style={{fontSize:'1.1em'}}>phone</span> Telefone:</strong> ({contatoPrincipal.ddd}) {contatoPrincipal.telefone}</p>
                            {contatoPrincipal.celular && <p><strong className="label"><span className="material-icons-outlined" style={{fontSize:'1.1em'}}>smartphone</span> Celular:</strong> ({contatoPrincipal.ddd}) {contatoPrincipal.celular}</p>}
                            {contatoPrincipal.whatsapp && <p><strong className="label"><span className="material-icons-outlined" style={{fontSize:'1.1em', color: 'green'}}>chat_bubble_outline</span> WhatsApp:</strong> ({contatoPrincipal.ddd}) {contatoPrincipal.whatsapp}</p>}
                            <p><strong className="label"><span className="material-icons-outlined" style={{fontSize:'1.1em'}}>label</span> Tipo:</strong> {contatoPrincipal.tipoContato}</p>
                        </div>
                    </div>
                )}

                {enderecoPrincipal && (
                    <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee'}}>
                        <h3><span className="material-icons-outlined">home</span> Endereço Principal:</h3>
                        <div style={{ paddingLeft: '10px' }}>
                            <p>{enderecoPrincipal.logradouro}, {enderecoPrincipal.numero} {enderecoPrincipal.complemento && `- ${enderecoPrincipal.complemento}`}</p>
                            <p>{enderecoPrincipal.bairro} - {enderecoPrincipal.localidade}/{enderecoPrincipal.uf}</p>
                            <p>CEP: {enderecoPrincipal.cep}</p>
                            <p><small><span className="material-icons-outlined" style={{fontSize:'1em'}}>public</span> Lat: {enderecoPrincipal.latitude.toFixed(7)}, Lon: {enderecoPrincipal.longitude.toFixed(7)}</small></p>
                        </div>
                    </div>
                )}
                {!contatoPrincipal && !enderecoPrincipal && <p style={{marginTop: '15px', fontStyle:'italic'}}>(Sem informações detalhadas de contato ou endereço)</p>}

                <div style={{marginTop: '30px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <Link href={`/clientes/alterar/${cliente.idCliente}`} className="button button-edit">
                        <span className="material-icons-outlined">edit</span> Editar Cliente
                    </Link>
                    {/* O botão de deletar aqui também pode abrir um modal, ou redirecionar para a página de confirmação */}
                    <Link href={`/clientes/deletar/${cliente.idCliente}`} className="button button-danger">
                        <span className="material-icons-outlined">delete_outline</span> Deletar Cliente
                    </Link>
                    <Link href="/clientes/listar" className="button button-secondary" style={{ marginLeft: 'auto' }}>
                        <span className="material-icons-outlined">arrow_back</span> Voltar para Lista
                    </Link>
                </div>
            </div>
        </div>
    );
}