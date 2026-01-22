'use client';

import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buscarClientePorDocumento } from '@/lib/apiService';
import type { ClienteResponseDTO } from '@/lib/types';

export default function BuscarUsuarioPage() {
    const [termoBusca, setTermoBusca] = useState('');
    const [tipoBusca, setTipoBusca] = useState<'id' | 'documento'>('id');
    const router = useRouter();
    const termoBuscaRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [erro, setErro] = useState<string | null>(null);

    const handleTipoBuscaChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setTipoBusca(e.target.value as 'id' | 'documento');
        setTermoBusca('');
        setErro(null);
        termoBuscaRef.current?.focus();
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value;
        if (tipoBusca === 'documento') {
            valor = valor.replace(/\D/g, '').slice(0, 14);
        } else if (tipoBusca === 'id') {
            valor = valor.replace(/\D/g, '');
        }
        setTermoBusca(valor);
    };

    const handleBuscar = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro(null);

        if (!termoBusca.trim()) {
            setErro('Por favor, informe um termo para busca.');
            termoBuscaRef.current?.focus();
            setLoading(false);
            return;
        }

        if (tipoBusca === 'id') {
            if (isNaN(Number(termoBusca)) || Number(termoBusca) <= 0) {
                setErro('Para busca por ID, por favor, informe um valor numérico positivo.');
                termoBuscaRef.current?.focus();
                setLoading(false);
                return;
            }
            router.push(`/clientes/${termoBusca}`);
            // setLoading(false) não é ideal aqui, pois o carregamento é da próxima página.

        } else if (tipoBusca === 'documento') {
            const documentoLimpo = termoBusca.replace(/\D/g, '');
            if (!documentoLimpo || (documentoLimpo.length !== 11 && documentoLimpo.length !== 14)) {
                setErro('Documento (CPF/CNPJ) deve ter 11 ou 14 números.');
                termoBuscaRef.current?.focus();
                setLoading(false);
                return;
            }
            try {
                console.log(`Buscando usuário por documento: ${documentoLimpo}`);
                const usuarioEncontrado: ClienteResponseDTO = await buscarClientePorDocumento(documentoLimpo);
                if (usuarioEncontrado && usuarioEncontrado.idCliente) {
                    console.log(`Usuário encontrado: ID ${usuarioEncontrado.idCliente}, Nome: ${usuarioEncontrado.nome}`);
                    router.push(`/clientes/${usuarioEncontrado.idCliente}`);
                } else {
                    console.warn(`Busca por documento ${documentoLimpo} retornou sucesso mas sem dados de usuário válidos.`);
                    setErro(`Não foi possível encontrar informações para o documento ${documentoLimpo}.`);
                }
            } catch (error: unknown) {
                console.error(`Falha ao buscar usuário por documento ${documentoLimpo}:`, error);
                // Lógica de erro combinada para maior clareza
                const message = error instanceof Error
                    ? error.message
                    : `Nenhum usuário encontrado com o documento ${documentoLimpo}. Verifique o documento e tente novamente.`;
                setErro(message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>person_search</span>
                Buscar Usuário
            </h1>

            {erro && <p className="message error" style={{ textAlign: 'center', marginBottom: '20px' }}>{erro}</p>}

            <form onSubmit={handleBuscar} className="form-container" style={{maxWidth: '550px', margin: '0 auto'}}>
                <div className="form-group">
                    <label htmlFor="tipoBusca" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <span className="material-icons-outlined">manage_search</span>
                        Buscar por:
                    </label>
                    <select
                        id="tipoBusca"
                        value={tipoBusca}
                        onChange={handleTipoBuscaChange}
                    >
                        <option value="id">ID do Usuário</option>
                        <option value="documento">Documento (CPF/CNPJ)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="termoBusca" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <span className="material-icons-outlined">input</span>
                        {tipoBusca === 'id' ? 'ID do Usuário:' : 'Número do Documento:'}
                    </label>
                    <input
                        id="termoBusca"
                        ref={termoBuscaRef}
                        type="text"
                        value={termoBusca}
                        onChange={handleInputChange}
                        placeholder={tipoBusca === 'id' ? 'Digite o ID numérico' : 'Digite apenas números do documento'}
                        required
                        maxLength={tipoBusca === 'documento' ? 14 : undefined}
                    />
                </div>
                <button
                    type="submit"
                    className="button button-primary"
                    style={{width: '100%', padding: '12px', fontSize: '1.1em'}}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="material-icons-outlined animate-spin" style={{marginRight: '8px'}}>sync</span>
                            Buscando...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-outlined">search</span>
                            Buscar
                        </>
                    )}
                </button>
            </form>
            <p style={{marginTop: '25px', textAlign: 'center'}}>
                Para ver todos os Usuários, acesse a <Link href="/clientes/listar" style={{color: 'var(--link-color)', textDecoration: 'underline'}}>Lista de Usuários</Link>.
            </p>
        </div>
    );
}