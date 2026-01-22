'use client';

import React, { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  buscarClientePorId,
  atualizarCliente,
  consultarCepPelaApi,
  calcularCoordenadasPelaApi,
} from '@/lib/apiService';
import type {
  ClienteRequestDTO,
  ClienteResponseDTO,
  ContatoRequestDTO,
  EnderecoRequestDTO,
  ViaCepResponseDTO,
  EnderecoGeoRequestDTO,
} from '@/lib/types';

// O tipo LocalEnderecoState é usado no formulário
type LocalEnderecoState = Omit<Partial<EnderecoRequestDTO>, 'numero'> & { numero: string };

export default function AlterarClientePage() {
  const params = useParams();
  const router = useRouter();
  const idPath = Array.isArray(params.id) ? params.id[0] : params.id;
  const clienteId = Number(idPath);

  // Refs para focar nos campos
  const nomeRef = useRef<HTMLInputElement>(null);
  const sobrenomeRef = useRef<HTMLInputElement>(null);
  const dataNascimentoRef = useRef<HTMLInputElement>(null);
  const documentoRef = useRef<HTMLInputElement>(null);
  const dddRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const celularRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const tipoContatoRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const numeroRef = useRef<HTMLInputElement>(null);
  const logradouroRef = useRef<HTMLInputElement>(null);
  const bairroRef = useRef<HTMLInputElement>(null);
  const localidadeRef = useRef<HTMLInputElement>(null);
  const ufRef = useRef<HTMLInputElement>(null);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);

  // IDs para atualização
  const [currentContatoId, setCurrentContatoId] = useState<number | undefined>(undefined);
  const [currentEnderecoId, setCurrentEnderecoId] = useState<number | undefined>(undefined);

  // Estados dos formulários
  const [clienteData, setClienteData] = useState<Omit<ClienteRequestDTO, 'contatosIds' | 'enderecosIds'>>({
    nome: '',
    sobrenome: '',
    dataNascimento: '',
    documento: '',
  });

  const [contatoData, setContatoData] = useState<ContatoRequestDTO>({
    ddd: '',
    telefone: '',
    celular: '',
    whatsapp: '',
    email: '',
    tipoContato: 'Principal',
  });

  const [enderecoData, setEnderecoData] = useState<LocalEnderecoState>({
    cep: '',
    numero: '',
    logradouro: '',
    bairro: '',
    localidade: '',
    uf: '',
    complemento: '',
    latitude: 0,
    longitude: 0,
  });

  // Estados de UI e feedback
  const [mensagem, setMensagem] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [buscandoCep, setBuscandoCep] = useState<boolean>(false);
  const [buscandoCoords, setBuscandoCoords] = useState<boolean>(false);

  // Efeito para carregar os dados iniciais do cliente
  useEffect(() => {
    if (idPath && !isNaN(clienteId)) {
      setInitialLoading(true);
      setErro('');
      buscarClientePorId(clienteId)
        .then((data: ClienteResponseDTO) => {
          setClienteData({
            nome: data.nome,
            sobrenome: data.sobrenome,
            dataNascimento: data.dataNascimento && data.dataNascimento.includes('/')
              ? data.dataNascimento.split('/').reverse().join('-')
              : (data.dataNascimento || ''),
            documento: (data.documento || '').replace(/\D/g, ''),
          });

          if (data.contatos && data.contatos.length > 0 && data.contatos[0]) {
            const contatoPrincipal = data.contatos[0];
            setContatoData({
              ...contatoPrincipal,
              ddd: contatoPrincipal.ddd.replace(/\D/g, ''),
              telefone: contatoPrincipal.telefone.replace(/\D/g, ''),
              celular: contatoPrincipal.celular?.replace(/\D/g, '') || '',
              whatsapp: contatoPrincipal.whatsapp?.replace(/\D/g, '') || '',
            });
            setCurrentContatoId(contatoPrincipal.idContato);
          }

          if (data.enderecos && data.enderecos.length > 0 && data.enderecos[0]) {
            const endPrincipal = data.enderecos[0];
            setEnderecoData({
              ...endPrincipal,
              cep: (endPrincipal.cep || '').replace(/\D/g, ''),
              numero: String(endPrincipal.numero ?? ''),
              latitude: endPrincipal.latitude || 0,
              longitude: endPrincipal.longitude || 0,
            });
            setCurrentEnderecoId(endPrincipal.idEndereco);
          }
        })
        .catch(fetchError => {
          console.error("Erro ao buscar dados do cliente para alteração:", fetchError);
          const message = fetchError instanceof Error ? fetchError.message : 'Erro desconhecido ao buscar cliente.';
          setErro(`Falha ao carregar dados do cliente: ${message}`);
        })
        .finally(() => setInitialLoading(false));
    } else {
      setErro("ID do cliente inválido ou não fornecido.");
      setInitialLoading(false);
    }
  }, [idPath, clienteId]);

  // Handlers de mudança
  const handleClienteChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'documento') {
      const cleanedValue = value.replace(/\D/g, '');
      setClienteData((prev) => ({
        ...prev,
        [name]: cleanedValue.slice(0, 14),
      }));
    } else {
      setClienteData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContatoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'ddd' || name === 'telefone' || name === 'celular' || name === 'whatsapp') {
      let numericValue = value.replace(/\D/g, '');
      const maxLength = name === 'ddd' ? 3 : 9;
      if (numericValue.length > maxLength) {
        numericValue = numericValue.slice(0, maxLength);
      }
      setContatoData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setContatoData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEnderecoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cep' || name === 'numero') {
        let cleanedValue = value.replace(/\D/g, '');
        const determinedMaxLength = name === 'cep' ? 8 : 5;
        if (cleanedValue.length > determinedMaxLength) {
            cleanedValue = cleanedValue.slice(0, determinedMaxLength);
        }
        setEnderecoData(prev => ({ ...prev, [name]: cleanedValue }));
    } else if (name === 'latitude' || name === 'longitude') {
        setEnderecoData(prev => ({ ...prev, [name]: value ? parseFloat(value) : 0 }));
    } else if (name === 'uf') {
        setEnderecoData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0, 2) }));
    } else {
        setEnderecoData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCepBlur = async () => {
    const cepLimpo = (enderecoData.cep || '').replace(/\D/g, '');
    if (cepLimpo.length === 8) {
        setBuscandoCep(true); setErro('');
        setMensagem('Buscando dados do CEP...');
        try {
            const viaCepDados: ViaCepResponseDTO = await consultarCepPelaApi(cepLimpo);
            setEnderecoData(prev => ({
                ...prev,
                logradouro: viaCepDados.logradouro || prev.logradouro || '',
                bairro: viaCepDados.bairro || prev.bairro || '',
                localidade: viaCepDados.localidade || prev.localidade || '',
                uf: viaCepDados.uf || prev.uf || '',
                cep: viaCepDados.cep?.replace(/\D/g, '') || prev.cep || '',
                latitude: 0,
                longitude: 0
            }));
            setMensagem('Dados do CEP carregados.');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido.';
            setErro(`Falha na busca do endereço: ${message}. Preencha manualmente.`);
            setMensagem('');
        } finally {
            setBuscandoCep(false);
        }
    }
  };

  const handleGerarCoordenadasClick = async () => {
    const numeroLimpoStr = (enderecoData.numero || '').trim().replace(/\D/g, '');
    if (!enderecoData.logradouro) {
        setErro("Preencha o logradouro para gerar coordenadas.");
        logradouroRef.current?.focus(); return;
    }
    setBuscandoCoords(true); setErro(''); setMensagem('Gerando coordenadas...');
    try {
        const geoRequestData: EnderecoGeoRequestDTO = {
            logradouro: enderecoData.logradouro || '',
            numero: parseInt(numeroLimpoStr, 10) || 0,
            cidade: enderecoData.localidade || '',
            uf: enderecoData.uf || '',
            bairro: enderecoData.bairro || '',
            cep: (enderecoData.cep || '').replace(/\D/g, '')
        };
        const coordenadas = await calcularCoordenadasPelaApi(geoRequestData);
        setEnderecoData(prev => ({ ...prev, latitude: coordenadas.latitude || 0, longitude: coordenadas.longitude || 0 }));
        setMensagem(`Coordenadas obtidas: Lat ${coordenadas.latitude.toFixed(7)}, Lon ${coordenadas.longitude.toFixed(7)}.`);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido.';
        setErro(`Falha ao gerar coordenadas: ${message}`);
        setMensagem('');
    } finally { setBuscandoCoords(false); }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isNaN(clienteId)) { setErro('ID do cliente inválido.'); return; }
    setErro('');
    setMensagem('Processando atualização...');
    setLoadingSubmit(true);

    const cleanedDocumento = clienteData.documento.replace(/\D/g, '');
    const finalClienteData = { ...clienteData, documento: cleanedDocumento };
    const clientePayload: ClienteRequestDTO = {
        ...finalClienteData,
        contatosIds: currentContatoId ? [currentContatoId] : [],
        enderecosIds: currentEnderecoId ? [currentEnderecoId] : [],
    };

    try {
        await atualizarCliente(clienteId, clientePayload);
        setMensagem('Cliente atualizado com sucesso! Redirecionando...');
        setTimeout(() => router.push(`/clientes/${clienteId}`), 2000);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setErro(`Falha ao atualizar cliente: ${errorMessage}`);
        setMensagem('');
    } finally {
        setLoadingSubmit(false);
    }
  };

  if (initialLoading) {
    return <div className="container"><p>Carregando dados do cliente...</p></div>;
  }

  if (erro && !clienteData.nome) {
    return (
      <div className="container">
        <p className="message error">{erro}</p>
        <Link href="/clientes/listar">Voltar para Lista</Link>
      </div>
    );
  }

  return (
    <div className="container">
        <h1 className="page-title">Alterar Cliente (ID: {idPath})</h1>
        <form onSubmit={handleSubmit} className="form-container" autoComplete="off">
            <fieldset className="form-section">
                <legend className="section-title">📄 Dados Pessoais</legend>
                <div className="form-row">
                    <div className="form-group flex-item">
                        <label htmlFor="nome">👤 Nome:</label>
                        <input id="nome" ref={nomeRef} type="text" name="nome" value={clienteData.nome || ''} onChange={handleClienteChange} />
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="sobrenome">👤 Sobrenome:</label>
                        <input id="sobrenome" ref={sobrenomeRef} type="text" name="sobrenome" value={clienteData.sobrenome || ''} onChange={handleClienteChange} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group flex-item">
                        <label htmlFor="dataNascimento">🎂 Data de Nascimento:</label>
                        <input id="dataNascimento" ref={dataNascimentoRef} type="date" name="dataNascimento" value={clienteData.dataNascimento || ''} onChange={handleClienteChange} />
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="documento">🪪 Documento:</label>
                        <input id="documento" ref={documentoRef} type="text" name="documento" value={clienteData.documento || ''} onChange={handleClienteChange} maxLength={14} placeholder="Só números CPF/CNPJ"/>
                    </div>
                </div>
            </fieldset>

            <hr className="section-divider" />

            <fieldset className="form-section">
                <legend className="section-title">📞 Contato Principal (ID: {currentContatoId || 'N/A'})</legend>
                <div className="form-row">
                    <div className="form-group basis-ddd">
                        <label htmlFor="alt-ddd">DDD:</label>
                        <input id="alt-ddd" ref={dddRef} type="text" name="ddd" value={contatoData.ddd || ''} onChange={handleContatoChange} maxLength={3} placeholder="Ex: 11"/>
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="alt-telefone">Telefone:</label>
                        <input id="alt-telefone" ref={telefoneRef} type="text" name="telefone" value={contatoData.telefone || ''} onChange={handleContatoChange} maxLength={9} placeholder="Ex: 987654321"/>
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group flex-item">
                        <label htmlFor="alt-celular">📱 Celular:</label>
                        <input id="alt-celular" ref={celularRef} type="text" name="celular" value={contatoData.celular || ''} onChange={handleContatoChange} maxLength={9} placeholder="Ex: 987654321"/>
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="alt-whatsapp">🟢 WhatsApp:</label>
                        <input id="alt-whatsapp" ref={whatsappRef} type="text" name="whatsapp" value={contatoData.whatsapp || ''} onChange={handleContatoChange} maxLength={9} placeholder="Ex: 987654321"/>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="alt-email">📧 Email:</label>
                    <input id="alt-email" ref={emailRef} type="email" name="email" value={contatoData.email || ''} onChange={handleContatoChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="alt-tipoContato">🏷️ Tipo Contato:</label>
                    <input id="alt-tipoContato" ref={tipoContatoRef} type="text" name="tipoContato" value={contatoData.tipoContato || ''} onChange={handleContatoChange} />
                </div>
            </fieldset>

            <hr className="section-divider" />

            <fieldset className="form-section">
                <legend className="section-title">🏠 Endereço Principal (ID: {currentEnderecoId || 'N/A'})</legend>
                <div className="form-row">
                    <div className="form-group basis-cep">
                        <label htmlFor="alt-cep">📍 CEP:</label>
                        <input id="alt-cep" ref={cepRef} type="text" name="cep" value={enderecoData.cep || ''} onChange={handleEnderecoChange} onBlur={handleCepBlur} maxLength={8} placeholder="00000000"/>
                    </div>
                    <div className="form-group basis-numero">
                        <label htmlFor="alt-numero">Nº:</label>
                        <input id="alt-numero" ref={numeroRef} type="text" name="numero" value={enderecoData.numero ?? ''} onChange={handleEnderecoChange} maxLength={5} placeholder="Ex: 123" />
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="alt-complemento">Compl.:</label>
                        <input id="alt-complemento" type="text" name="complemento" value={enderecoData.complemento || ''} onChange={handleEnderecoChange} />
                    </div>
                </div>
                {buscandoCep && <p className="message info" style={{textAlign: 'center'}}>Buscando CEP...</p>}
                <div className="form-group">
                    <label htmlFor="alt-logradouro">Logradouro:</label>
                    <input id="alt-logradouro" ref={logradouroRef} type="text" name="logradouro" value={enderecoData.logradouro || ''} onChange={handleEnderecoChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="alt-bairro">Bairro:</label>
                    <input id="alt-bairro" ref={bairroRef} type="text" name="bairro" value={enderecoData.bairro || ''} onChange={handleEnderecoChange} />
                </div>
                <div className="form-row">
                    <div className="form-group grow-3">
                        <label htmlFor="alt-localidade">🏙️ Localidade:</label>
                        <input id="alt-localidade" ref={localidadeRef} type="text" name="localidade" value={enderecoData.localidade || ''} onChange={handleEnderecoChange} />
                    </div>
                    <div className="form-group basis-uf">
                        <label htmlFor="alt-uf">UF:</label>
                        <input id="alt-uf" ref={ufRef} type="text" name="uf" value={enderecoData.uf || ''} onChange={handleEnderecoChange} maxLength={2} />
                    </div>
                </div>
            </fieldset>

            <hr className="section-divider"/>

            <fieldset className="form-section coordinate-section" style={{ textAlign: 'center' }}>
                <legend className="section-title" style={{ marginBottom: '1rem' }}>🌐 Coordenadas Geográficas</legend>
                <button type="button" onClick={handleGerarCoordenadasClick} disabled={buscandoCoords || !enderecoData.logradouro} className="button-secondary">
                    {buscandoCoords ? 'Gerando...' : 'Obter/Atualizar Coordenadas'}
                </button>
                <div className="form-row" style={{marginTop: '1rem'}}>
                    <div className="form-group flex-item">
                        <label htmlFor="latitude">Latitude:</label>
                        <input id="latitude" ref={latitudeRef} type="number" step="any" name="latitude" value={String(enderecoData.latitude ?? '')} onChange={handleEnderecoChange} placeholder="Ex: -23.550520"/>
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="longitude">Longitude:</label>
                        <input id="longitude" ref={longitudeRef} type="number" step="any" name="longitude" value={String(enderecoData.longitude ?? '')} onChange={handleEnderecoChange} placeholder="Ex: -46.633308"/>
                    </div>
                </div>
            </fieldset>

            <hr className="section-divider"/>
            <button type="submit" disabled={buscandoCep || buscandoCoords || loadingSubmit || initialLoading} className="button-primary" style={{marginTop: '20px', width: '100%', padding: '12px', fontSize: '1.1em'}}>
                {initialLoading ? 'Carregando...' : (loadingSubmit ? 'Salvando...' : (buscandoCep || buscandoCoords ? 'Aguarde...' : 'Salvar Alterações'))}
            </button>
        </form>
        {mensagem && !erro && <p className="message success" style={{marginTop: '15px'}}>{mensagem}</p>}
        {erro && <p className="message error" style={{marginTop: '15px'}}>{erro}</p>}
        <div style={{marginTop: '20px', marginBottom: '40px', textAlign: 'center' }}>
            <Link href={`/clientes/${clienteId}`}>Cancelar e Voltar para Detalhes</Link>
            <span style={{margin: '0 10px'}}>|</span>
            <Link href="/clientes/listar">Voltar para Lista Geral</Link>
        </div>
    </div>
  );
}