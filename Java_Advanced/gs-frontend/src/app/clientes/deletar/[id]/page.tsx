'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { buscarClientePorId, deletarCliente } from '@/lib/apiService';
import type { ClienteResponseDTO } from '@/lib/types';
import Link from 'next/link';

export default function DeletarClienteConfirmPage() {
    const params = useParams();
    const router = useRouter();
    const idPath = Array.isArray(params.id) ? params.id[0] : params.id;

    const [cliente, setCliente] = useState<ClienteResponseDTO | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleting, setDeleting] = useState<boolean>(false);

    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (idPath) {
            const clienteId = Number(idPath);
            if (isNaN(clienteId)) {
                setErro("ID do Usuário inválido na URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            buscarClientePorId(clienteId)
                .then(data => {
                    setCliente(data);
                    setErro(null);
                    setTimeout(() => confirmButtonRef.current?.focus(), 0);
                })
                .catch((error: unknown) => {
                    console.error("Erro ao buscar Usuário para deleção:", error);
                    const message = error instanceof Error ? error.message : 'Usuário não encontrado ou falha na comunicação.';
                    setErro(`Falha ao carregar Usuário para deleção: ${message}`);
                    setCliente(null);
                })
                .finally(() => setLoading(false));
        } else {
            setErro("ID do Usuário não fornecido para deleção.");
            setLoading(false);
        }
    }, [idPath]);

    const handleConfirmarDelecao = async () => {
        if (cliente) {
            setDeleting(true);
            setErro(null);
            try {
                await deletarCliente(cliente.idCliente);
                alert('Usuário deletado com sucesso!'); // Considere usar um sistema de notificação melhor
                router.push('/clientes/listar');
            } catch (error: unknown) {
                console.error("Erro ao confirmar deleção:", error);
                const message = error instanceof Error ? error.message : "Erro desconhecido ao tentar deletar.";
                setErro(`Falha ao deletar Usuário: ${message}`);
                setDeleting(false);
            }
        }
    };

    if (loading) return <div className="container" style={{textAlign: 'center', paddingTop: '50px'}}><p>Carregando dados do cliente...</p></div>;

    if (erro && !cliente) return (
        <div className="container" style={{textAlign: 'center', paddingTop: '30px'}}>
            <p className="message error" style={{marginBottom: '20px'}}>{erro}</p>
            <Link href="/clientes/listar" className="button button-secondary">
                <span className="material-icons-outlined">arrow_back</span>
                Voltar para Lista
            </Link>
        </div>
    );

    if (!cliente) return (
        <div className="container" style={{textAlign: 'center', paddingTop: '30px'}}>
            <p>Cliente não encontrado.</p>
            <Link href="/clientes/listar" className="button button-secondary">
                <span className="material-icons-outlined">arrow_back</span>
                Voltar para Lista
            </Link>
        </div>
    );

    return (
        <div className="container">
            <h1 className="page-title" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <span className="material-icons-outlined" style={{color: '#dc3545', fontSize: '2em'}}>warning_amber</span>
                Confirmar Deleção
            </h1>
            <div style={{ backgroundColor: 'white', padding: '25px 30px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <p style={{fontSize: '1.1em', marginBottom: '10px'}}>Você tem certeza que deseja deletar o Usuário:</p>
                <p style={{fontSize: '1.2em', fontWeight: '500', color: '#333'}}>{cliente.nome} {cliente.sobrenome}</p>
                <p style={{color: '#555', marginBottom: '20px'}}>(ID: {cliente.idCliente} | Documento: {cliente.documento})</p>

                <p style={{color: '#dc3545', fontWeight: 'bold', margin: '25px 0', fontSize: '1.1em', border: '1px solid #f5c6cb', padding: '10px', borderRadius: '4px', backgroundColor: '#f8d7da'}}>
                    <span className="material-icons-outlined" style={{fontSize: '1.2em', verticalAlign:'bottom'}}>info</span> Esta ação não pode ser desfeita.
                </p>

                {erro && <p className="message error" style={{textAlign: 'center', marginBottom: '20px'}}>{erro}</p>}

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button
                        ref={confirmButtonRef}
                        onClick={handleConfirmarDelecao}
                        className="button button-danger"
                        disabled={deleting}
                        style={{padding: '10px 20px', fontSize: '1em'}}
                    >
                        <span className="material-icons-outlined">delete_forever</span>
                        {deleting ? 'Deletando...' : 'Sim, Deletar Usuário'}
                    </button>
                    <Link
                        href={`/clientes/${cliente.idCliente}`}
                        className="button button-secondary"
                        style={{padding: '10px 20px', fontSize: '1em'}}
                        aria-disabled={deleting}
                        onClick={(e) => { if(deleting) e.preventDefault(); }}
                    >
                        <span className="material-icons-outlined">cancel</span>
                        Cancelar
                    </Link>
                </div>
            </div>
        </div>
    );
}