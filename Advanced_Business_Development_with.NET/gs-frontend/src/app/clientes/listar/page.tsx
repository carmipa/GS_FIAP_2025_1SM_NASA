// src/app/clientes/listar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listarClientes, deletarCliente } from '@/lib/apiService'; // deletarCliente agora será usado
import type { ClienteResponseDTO, Page } from '@/lib/types'; // Usando os tipos do nosso novo types.ts

export default function ListarClientesPage() {
    const [clientesPage, setClientesPage] = useState<Page<ClienteResponseDTO> | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed para controle interno

    // Estados para o modal de confirmação de deleção
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [clienteParaDeletar, setClienteParaDeletar] = useState<ClienteResponseDTO | null>(null);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

    const fetchClientes = async (page: number) => { // page aqui é 0-indexed
        setLoading(true);
        setErro(null);
        try {
            // O apiService.listarClientes espera a página 0-indexed e converte para 1-indexed se necessário
            const data = await listarClientes(page, 5); // Solicitando 5 itens por página
            setClientesPage(data);
        } catch (error: any) {
            console.error("Erro ao buscar clientes:", error);
            setErro(`Falha ao carregar clientes: ${error.message || 'Erro desconhecido'}`);
            setClientesPage(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes(currentPage);
    }, [currentPage]);

    const iniciarDelecao = (cliente: ClienteResponseDTO) => {
        setClienteParaDeletar(cliente);
        setShowDeleteModal(true);
    };

    const confirmarDelecao = async () => {
        if (clienteParaDeletar) {
            setLoadingDelete(true);
            setErro(null); // Limpar erro anterior
            try {
                await deletarCliente(clienteParaDeletar.idCliente);
                setShowDeleteModal(false);
                setClienteParaDeletar(null);
                // Re-fetch ou atualiza a lista local
                // Se era o último item da página e não é a primeira página, volta uma página
                if (clientesPage && clientesPage.content.length === 1 && currentPage > 0) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchClientes(currentPage); // Recarrega a página atual
                }
            } catch (error: any) {
                console.error("Erro ao deletar cliente:", error);
                setErro(`Falha ao deletar cliente: ${error.message || 'Erro desconhecido'}`);
                // Mantém o modal aberto para exibir o erro, ou fecha e mostra na página
            } finally {
                setLoadingDelete(false);
            }
        }
    };

    if (loading && !clientesPage) return <div className="container"><p>Carregando clientes...</p></div>;
    // erro && (!clientesPage || clientesPage.content.length === 0) foi removido para sempre mostrar o erro se houver

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>Lista de Usuários</h1>
                <Link href="/clientes/cadastrar" className="button button-success">
                    <span className="material-icons-outlined">add_circle_outline</span>
                    Cadastrar Novo
                </Link>
            </div>

            {erro && <p className="message error" style={{marginBottom: '15px'}}>{erro}</p>}

            {(!clientesPage || clientesPage.content.length === 0) && !loading && !erro && (
                <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #ccc', borderRadius: '8px' }}>
                    <p>Nenhum cliente encontrado.</p>
                </div>
            )}

            {clientesPage && clientesPage.content.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {clientesPage.content.map(cliente => {
                        const contatoPrincipal = cliente.contatos && cliente.contatos.length > 0 ? cliente.contatos[0] : null;
                        const enderecoPrincipal = cliente.enderecos && cliente.enderecos.length > 0 ? cliente.enderecos[0] : null;
                        return (
                            <li key={cliente.idCliente} className="client-list-item">
                                <div className="client-info-section">
                                    <strong>{cliente.nome} {cliente.sobrenome} <span style={{fontSize: '0.8em', color: '#777'}}>(ID: {cliente.idCliente})</span></strong>
                                    <p><span className="label">Documento:</span> {cliente.documento}</p>
                                    {contatoPrincipal && (
                                        <>
                                            <p><span className="label"><span className="material-icons-outlined" style={{fontSize: '1em'}}>email</span> Email:</span> {contatoPrincipal.email}</p>
                                            {contatoPrincipal.whatsapp && <p><span className="label"><span className="material-icons-outlined" style={{fontSize: '1em', color: 'green'}}>chat_bubble_outline</span> WhatsApp:</span> ({contatoPrincipal.ddd}) {contatoPrincipal.whatsapp}</p>}
                                        </>
                                    )}
                                    {enderecoPrincipal && (
                                        <>
                                            <p style={{marginTop: '5px'}}>
                                                <span className="label"><span className="material-icons-outlined" style={{fontSize: '1em'}}>home</span> Endereço:</span> {enderecoPrincipal.logradouro}, {enderecoPrincipal.numero}
                                                {enderecoPrincipal.complemento && ` - ${enderecoPrincipal.complemento}`}
                                                <br />
                                                {enderecoPrincipal.bairro} - {enderecoPrincipal.localidade}/{enderecoPrincipal.uf} (CEP: {enderecoPrincipal.cep})
                                            </p>
                                            <p>
                                                <span className="label"><span className="material-icons-outlined" style={{fontSize: '1em'}}>public</span> Coordenadas:</span> Lat: {enderecoPrincipal.latitude?.toFixed(5)}, Lon: {enderecoPrincipal.longitude?.toFixed(5)}
                                            </p>
                                        </>
                                    )}
                                    {!contatoPrincipal && !enderecoPrincipal && <p><i>(Sem informações de contato ou endereço principal)</i></p>}
                                </div>
                                <div className="client-actions">
                                    <Link href={`/clientes/${cliente.idCliente}`} className="button button-secondary">
                                        <span className="material-icons-outlined">visibility</span> Ver
                                    </Link>
                                    <Link href={`/clientes/alterar/${cliente.idCliente}`} className="button button-edit">
                                        <span className="material-icons-outlined">edit</span> Editar
                                    </Link>
                                    <button onClick={() => iniciarDelecao(cliente)} className="button button-danger">
                                        <span className="material-icons-outlined">delete_outline</span> Deletar
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {clientesPage && clientesPage.totalPages > 0 && (
                <div className="pagination-controls">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={clientesPage.first || loading}
                        className="button button-secondary"
                    >
                        <span className="material-icons-outlined">navigate_before</span>
                        Anterior
                    </button>
                    {/* AJUSTE AQUI: Usando pageNumber (1-indexed) diretamente */}
                    <span>Página {clientesPage.pageNumber} de {clientesPage.totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(clientesPage.totalPages - 1, p + 1))}
                        disabled={clientesPage.last || loading}
                        className="button button-secondary"
                    >
                        Próxima
                        <span className="material-icons-outlined">navigate_next</span>
                    </button>
                </div>
            )}

            {/* Modal de Confirmação de Deleção */}
            {showDeleteModal && clienteParaDeletar && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2><span className="material-icons-outlined" style={{color: '#dc3545', fontSize:'1.5em'}}>warning_amber</span> Confirmar Deleção</h2>
                        <p>Tem certeza que deseja deletar o cliente <strong>"{clienteParaDeletar.nome} {clienteParaDeletar.sobrenome}"</strong> (ID: {clienteParaDeletar.idCliente})?</p>
                        <p style={{color: '#dc3545', fontWeight:'bold'}}>Esta ação não pode ser desfeita.</p>

                        {/* Exibir erro de deleção dentro do modal */}
                        {erro && loadingDelete === false && <p className="message error" style={{textAlign:'left'}}>{erro}</p>}

                        <div className="modal-actions">
                            <button onClick={confirmarDelecao} className="button button-danger" disabled={loadingDelete}>
                                {loadingDelete ? 'Deletando...' : 'Sim, Deletar'}
                            </button>
                            <button onClick={() => { setShowDeleteModal(false); setErro(null); /* Limpar erro ao cancelar */ }} className="button button-secondary" disabled={loadingDelete}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}