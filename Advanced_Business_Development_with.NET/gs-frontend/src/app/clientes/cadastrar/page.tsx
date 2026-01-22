// src/app/clientes/cadastrar/page.tsx
// Este componente deve ser compatível com as definições de apiService.ts e types.ts
// que foram alinhadas com o backend C#.
'use client';

import { useState, FormEvent, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    criarCliente,
    consultarCepPelaApi,
    calcularCoordenadasPelaApi,
    criarContatoSozinho,
    criarEnderecoSozinho
} from '@/lib/apiService';
import type {
    ClienteRequestDTO,
    ContatoRequestDTO,
    EnderecoRequestDTO,
    ViaCepResponseDTO,
    EnderecoGeoRequestDTO,
    GeoCoordinatesDTO,
    ContatoResponseDTO, // Importado para uso implícito no retorno de criarContatoSozinho
    EnderecoResponseDTO // Importado para uso implícito no retorno de criarEnderecoSozinho
} from '@/lib/types';

export default function CadastrarClientePage() {
    const router = useRouter();
    // Refs
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

    const [clienteData, setClienteData] = useState<Omit<ClienteRequestDTO, 'contatosIds' | 'enderecosIds'>>({
        nome: '', sobrenome: '', dataNascimento: '', documento: '',
    });
    const [contatoData, setContatoData] = useState<ContatoRequestDTO>({
        ddd: '', telefone: '', celular: '', whatsapp: '', email: '', tipoContato: 'Principal',
    });
    const [enderecoData, setEnderecoData] = useState<Partial<EnderecoRequestDTO & { numero: string }>>({ // numero como string para o input
        cep: '', numero: '', logradouro: '', bairro: '', localidade: '', uf: '', complemento: '', latitude: 0, longitude: 0,
    });
    const [mensagem, setMensagem] = useState<string>('');
    const [erro, setErro] = useState<string>('');
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [buscandoCep, setBuscandoCep] = useState<boolean>(false);
    const [buscandoCoords, setBuscandoCoords] = useState<boolean>(false);

    const handleClienteChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "documento") {
            const cleanedValue = value.replace(/\D/g, '');
            setClienteData(prev => ({ ...prev, [name]: cleanedValue.slice(0,18) }));
        } else {
            setClienteData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleContatoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'ddd' || name === 'telefone' || name === 'celular' || name === 'whatsapp') {
            let numericValue = value.replace(/\D/g, '');
            let maxLength = 15; // Default, não usado diretamente aqui
            if (name === 'ddd') maxLength = 3;
            else if (name === 'telefone') maxLength = 9; // Ex: 987654321
            else if (name === 'celular') maxLength = 9;  // Ex: 987654321
            else if (name === 'whatsapp') maxLength = 9; // Ex: 987654321

            if (numericValue.length > maxLength) {
                numericValue = numericValue.slice(0, maxLength);
            }
            setContatoData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setContatoData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEnderecoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'cep' || name === 'numero') {
            let numericValue = value.replace(/\D/g, '');
            let maxLength = name === 'cep' ? 8 : 5;
            if (numericValue.length > maxLength) {
                numericValue = numericValue.slice(0, maxLength);
            }
            setEnderecoData(prev => ({ ...prev, [name]: numericValue }));
        } else if (name === 'latitude' || name === 'longitude') {
            setEnderecoData(prev => ({ ...prev, [name]: value ? parseFloat(value) : '' as any })); // value pode ser string vazia
        } else if (name === 'uf') {
            setEnderecoData(prev => ({ ...prev, [name]: value.toUpperCase().slice(0,2) }));
        }
        else {
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
                    logradouro: viaCepDados.logradouro || '', bairro: viaCepDados.bairro || '',
                    localidade: viaCepDados.localidade || '', uf: viaCepDados.uf || '',
                    cep: viaCepDados.cep?.replace(/\D/g, '') || prev.cep,
                    latitude: 0, longitude: 0, // Reseta coordenadas ao buscar novo CEP
                }));
                setMensagem('Dados do CEP carregados. Preencha o número e clique em "Obter Coordenadas" se necessário.');
            } catch (error: any) {
                setErro(`Falha ao buscar CEP: ${error.message}. Preencha manualmente.`);
                setMensagem('');
            } finally { setBuscandoCep(false); }
        } else if (enderecoData.cep && cepLimpo.length !== 8) {
            setErro('CEP inválido. Deve conter 8 dígitos.');
            cepRef.current?.focus();
            setMensagem('');
        }
    };

    const handleGerarCoordenadasClick = async () => {
        const numeroStr = String(enderecoData.numero || '').trim().replace(/\D/g, '');
        if (!enderecoData.logradouro && !enderecoData.localidade && !enderecoData.uf) {
            setErro("Preencha pelo menos Cidade e UF, ou o endereço completo, para gerar coordenadas.");
            logradouroRef.current?.focus();
            setMensagem(''); return;
        }
        if (enderecoData.logradouro && (!numeroStr || numeroStr === "0")) {
            setErro("Se informou logradouro, por favor, informe o Número para gerar coordenadas precisas.");
            numeroRef.current?.focus();
            setMensagem(''); return;
        }
        setBuscandoCoords(true); setErro(''); setMensagem('Gerando coordenadas...');
        try {
            const geoRequestData: EnderecoGeoRequestDTO = {
                logradouro: enderecoData.logradouro || '',
                numero: numeroStr,
                cidade: enderecoData.localidade || '',
                uf: enderecoData.uf || '',
                bairro: enderecoData.bairro,
                cep: (enderecoData.cep || '').replace(/\D/g, '')
            };
            const coordenadas: GeoCoordinatesDTO = await calcularCoordenadasPelaApi(geoRequestData);
            setEnderecoData(prev => ({ ...prev, latitude: coordenadas.latitude || 0, longitude: coordenadas.longitude || 0 }));
            if ((coordenadas.latitude || 0) === 0 || (coordenadas.longitude || 0) === 0) {
                setErro("Não foi possível obter coordenadas. Verifique os dados e tente novamente ou preencha manualmente se souber.");
                latitudeRef.current?.focus();
                setMensagem('');
            } else {
                setMensagem(`Coordenadas: Lat ${Number(coordenadas.latitude).toFixed(7)}, Lon ${Number(coordenadas.longitude).toFixed(7)}.`);
            }
        } catch (error: any) {
            setErro(`Falha ao gerar coordenadas: ${error.message}`);
            setMensagem('');
        } finally { setBuscandoCoords(false); }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro(''); setMensagem('');
        // Validações (mantidas como no original)
        if (!clienteData.nome.trim()) { setErro("Nome é obrigatório."); nomeRef.current?.focus(); return; }
        if (!clienteData.sobrenome.trim()) { setErro("Sobrenome é obrigatório."); sobrenomeRef.current?.focus(); return; }
        if (!clienteData.dataNascimento) { setErro("Data de nascimento é obrigatória."); dataNascimentoRef.current?.focus(); return; }

        const cleanedDocumento = clienteData.documento.replace(/\D/g, '');
        if (!cleanedDocumento) { setErro("Documento é obrigatório."); documentoRef.current?.focus(); return; }
        if (cleanedDocumento.length < 11 || cleanedDocumento.length > 14) {
            setErro("Documento (CPF/CNPJ) deve ter 11 ou 14 números."); documentoRef.current?.focus(); return;
        }

        const cleanedDdd = contatoData.ddd.replace(/\D/g, '');
        const cleanedTelefone = contatoData.telefone.replace(/\D/g, '');
        const cleanedCelular = contatoData.celular?.replace(/\D/g, '') || '';
        const cleanedWhatsapp = contatoData.whatsapp?.replace(/\D/g, '') || '';

        if (!cleanedDdd) { setErro("DDD do contato é obrigatório."); dddRef.current?.focus(); return; }
        if (cleanedDdd.length < 2 || cleanedDdd.length > 3) { setErro("DDD do contato deve ter entre 2 e 3 dígitos."); dddRef.current?.focus(); return; }
        if (!cleanedTelefone) { setErro("Telefone principal do contato é obrigatório."); telefoneRef.current?.focus(); return; }
        if (cleanedTelefone.length < 8 || cleanedTelefone.length > 9) { setErro("Telefone principal deve ter entre 8 e 9 dígitos."); telefoneRef.current?.focus(); return; }
        if (cleanedCelular && (cleanedCelular.length < 8 || cleanedCelular.length > 9)) { setErro("Celular deve ter entre 8 e 9 dígitos (se preenchido)."); celularRef.current?.focus(); return; }
        if (cleanedWhatsapp && (cleanedWhatsapp.length < 8 || cleanedWhatsapp.length > 9)) { setErro("WhatsApp deve ter entre 8 e 9 dígitos (se preenchido)."); whatsappRef.current?.focus(); return; }
        if (!contatoData.email.trim()) { setErro("Email do contato é obrigatório."); emailRef.current?.focus(); return; }
        if (!contatoData.tipoContato.trim()) { setErro("Tipo de contato é obrigatório."); tipoContatoRef.current?.focus(); return; }

        const cleanedCep = (enderecoData.cep || '').replace(/\D/g, '');
        const cleanedNumeroStr = String(enderecoData.numero || "0").replace(/\D/g, '');
        const cleanedNumero = parseInt(cleanedNumeroStr, 10) || 0;

        if (!cleanedCep) { setErro("CEP do endereço é obrigatório."); cepRef.current?.focus(); return; }
        if (cleanedCep.length !== 8) { setErro("CEP do endereço deve ter 8 dígitos."); cepRef.current?.focus(); return; }
        if (cleanedNumero === 0) { setErro("Número do endereço é obrigatório."); numeroRef.current?.focus(); return; }
        if (!enderecoData.logradouro?.trim()) { setErro("Logradouro do endereço é obrigatório."); logradouroRef.current?.focus(); return; }
        if (!enderecoData.bairro?.trim()) { setErro("Bairro do endereço é obrigatório."); bairroRef.current?.focus(); return; }
        if (!enderecoData.localidade?.trim()) { setErro("Localidade (cidade) do endereço é obrigatória."); localidadeRef.current?.focus(); return; }
        if (!enderecoData.uf?.trim() || enderecoData.uf.trim().length !== 2) { setErro("UF do endereço é obrigatória e deve ter 2 caracteres."); ufRef.current?.focus(); return; }

        const finalLatitude = Number(enderecoData.latitude) || 0;
        const finalLongitude = Number(enderecoData.longitude) || 0;
        if (finalLatitude === 0 || finalLongitude === 0) {
            setErro("Latitude e Longitude são obrigatórias. Use 'Obter Coordenadas' ou preencha manualmente.");
            latitudeRef.current?.focus(); return;
        }

        setLoadingSubmit(true);
        let contatoId: number | undefined;
        let enderecoId: number | undefined;

        const finalClienteDataStruct = {...clienteData, documento: cleanedDocumento };
        const finalContatoDataStruct: ContatoRequestDTO = {
            ...contatoData,
            ddd: cleanedDdd,
            telefone: cleanedTelefone,
            celular: cleanedCelular || undefined, // Enviar undefined se vazio
            whatsapp: cleanedWhatsapp || undefined // Enviar undefined se vazio
        };

        try {
            setMensagem('Salvando contato...');
            const contatoSalvo = await criarContatoSozinho(finalContatoDataStruct);
            contatoId = contatoSalvo.idContato;
            setMensagem('Contato salvo.');

            setMensagem(prev => prev + ' Processando endereço...');
            const enderecoPayload: EnderecoRequestDTO = {
                cep: cleanedCep,
                numero: cleanedNumero,
                logradouro: enderecoData.logradouro || '',
                bairro: enderecoData.bairro || '',
                localidade: enderecoData.localidade || '',
                uf: enderecoData.uf || '',
                complemento: enderecoData.complemento || '', // Garante que seja string
                latitude: finalLatitude,
                longitude: finalLongitude,
            };
            setMensagem(prev => prev + ' Salvando endereço...');
            const enderecoSalvo = await criarEnderecoSozinho(enderecoPayload);
            enderecoId = enderecoSalvo.idEndereco;
            setMensagem(prev => prev.replace('Salvando endereço...', 'Endereço salvo.'));

            setMensagem(prev => prev + ' Criando cliente...');
            const clientePayload: ClienteRequestDTO = {
                ...finalClienteDataStruct,
                contatosIds: contatoId ? [contatoId] : [],
                enderecosIds: enderecoId ? [enderecoId] : [],
            };
            const clienteCriado = await criarCliente(clientePayload);
            setMensagem(`Cliente "${clienteCriado.nome} ${clienteCriado.sobrenome}" (ID: ${clienteCriado.idCliente}) salvo! Redirecionando...`);

            // Limpar formulários
            setClienteData({ nome: '', sobrenome: '', dataNascimento: '', documento: '' });
            setContatoData({ ddd: '', telefone: '', celular: '', whatsapp: '', email: '', tipoContato: 'Principal' });
            setEnderecoData({ cep: '', numero: '', logradouro: '', bairro: '', localidade: '', uf: '', complemento: '', latitude: 0, longitude: 0 });

            setTimeout(() => router.push(`/clientes/${clienteCriado.idCliente}`), 3000);
        } catch (error: any) {
            const apiErrorMessage = error.message || "Ocorreu uma falha desconhecida.";
            setErro(apiErrorMessage.startsWith("Falha no cadastro:") ? apiErrorMessage : `Falha no cadastro: ${apiErrorMessage}`);
            setMensagem('');
        } finally { setLoadingSubmit(false); }
    };

    return (
        <div className="container">
            <h1 className="page-title">Cadastrar Novo Usuário</h1>
            <form onSubmit={handleSubmit} className="form-container" autoComplete="off">

                <fieldset className="form-section">
                    <legend className="section-title">📄 Dados Pessoais</legend>
                    <div className="form-row">
                        <div className="form-group flex-item">
                            <label htmlFor="nome">👤 Nome:</label>
                            <input id="nome" ref={nomeRef} type="text" name="nome" value={clienteData.nome} onChange={handleClienteChange} autoComplete="given-name" />
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="sobrenome">👤 Sobrenome:</label>
                            <input id="sobrenome" ref={sobrenomeRef} type="text" name="sobrenome" value={clienteData.sobrenome} onChange={handleClienteChange} autoComplete="family-name" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group flex-item">
                            <label htmlFor="dataNascimento">🎂 Data de Nascimento:</label>
                            <input id="dataNascimento" ref={dataNascimentoRef} type="date" name="dataNascimento" value={clienteData.dataNascimento} onChange={handleClienteChange} autoComplete="bday" />
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="documento">🪪 Documento (CPF/CNPJ):</label>
                            <input id="documento" ref={documentoRef} type="text" name="documento" value={clienteData.documento} onChange={handleClienteChange} maxLength={14} autoComplete="off" placeholder="Só números" />
                        </div>
                    </div>
                </fieldset>

                <hr className="section-divider" />

                <fieldset className="form-section">
                    <legend className="section-title">📞 Contato Principal</legend>
                    <div className="form-row">
                        <div className="form-group basis-ddd">
                            <label htmlFor="ddd">DDD:</label>
                            <input id="ddd" ref={dddRef} type="text" name="ddd" value={contatoData.ddd} onChange={handleContatoChange} maxLength={3} autoComplete="tel-area-code" placeholder="Ex: 11" />
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="telefone">Telefone:</label>
                            <input id="telefone" ref={telefoneRef} type="text" name="telefone" value={contatoData.telefone} onChange={handleContatoChange} maxLength={9} autoComplete="tel-local" placeholder="Ex: 987654321" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group flex-item">
                            <label htmlFor="celular">📱 Celular (Opcional):</label>
                            <input id="celular" ref={celularRef} type="text" name="celular" value={contatoData.celular || ''} onChange={handleContatoChange} maxLength={9} autoComplete="tel" placeholder="Ex: 987654321" />
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="whatsapp">🟢 WhatsApp (Opcional):</label>
                            <input id="whatsapp" ref={whatsappRef} type="text" name="whatsapp" value={contatoData.whatsapp || ''} onChange={handleContatoChange} maxLength={9} autoComplete="tel" placeholder="Ex: 987654321"/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">📧 Email:</label>
                        <input id="email" ref={emailRef} type="email" name="email" value={contatoData.email} onChange={handleContatoChange} autoComplete="email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tipoContato">🏷️ Tipo Contato:</label>
                        <input id="tipoContato" ref={tipoContatoRef} type="text" name="tipoContato" value={contatoData.tipoContato} onChange={handleContatoChange} />
                    </div>
                </fieldset>

                <hr className="section-divider" />

                <fieldset className="form-section">
                    <legend className="section-title">🏠 Endereço Principal</legend>
                    <div className="form-row">
                        <div className="form-group basis-cep">
                            <label htmlFor="cep">📍 CEP:</label>
                            <input id="cep" ref={cepRef} type="text" name="cep" value={enderecoData.cep || ''} onChange={handleEnderecoChange} onBlur={handleCepBlur} maxLength={8} placeholder="00000000" autoComplete="postal-code" />
                        </div>
                        <div className="form-group basis-numero">
                            <label htmlFor="numero">Nº:</label>
                            <input id="numero" ref={numeroRef} type="text" name="numero" value={String(enderecoData.numero || '')} onChange={handleEnderecoChange} placeholder="Ex: 123" autoComplete="address-line2" maxLength={5}/>
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="complemento">Compl.:</label>
                            <input id="complemento" type="text" name="complemento" value={enderecoData.complemento || ''} onChange={handleEnderecoChange} autoComplete="address-line3"/>
                        </div>
                    </div>
                    {buscandoCep && <p className="message info" style={{textAlign: 'center'}}>Buscando CEP...</p>}

                    <div className="form-group">
                        <label htmlFor="logradouro">Logradouro:</label>
                        <input id="logradouro" ref={logradouroRef} type="text" name="logradouro" value={enderecoData.logradouro || ''} onChange={handleEnderecoChange} autoComplete="address-line1" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="bairro">Bairro:</label>
                        <input id="bairro" ref={bairroRef} type="text" name="bairro" value={enderecoData.bairro || ''} onChange={handleEnderecoChange} autoComplete="address-level3"/>
                    </div>
                    <div className="form-row">
                        <div className="form-group grow-3">
                            <label htmlFor="localidade">🏙️ Localidade (Cidade):</label>
                            <input id="localidade" ref={localidadeRef} type="text" name="localidade" value={enderecoData.localidade || ''} onChange={handleEnderecoChange} autoComplete="address-level2" />
                        </div>
                        <div className="form-group basis-uf">
                            <label htmlFor="uf">UF:</label>
                            <input id="uf" ref={ufRef} type="text" name="uf" value={enderecoData.uf || ''} onChange={handleEnderecoChange} maxLength={2} autoComplete="address-level1" />
                        </div>
                    </div>
                </fieldset>

                <hr className="section-divider"/>

                <fieldset className="form-section coordinate-section" style={{ textAlign: 'center' }}>
                    <legend className="section-title" style={{ marginBottom: '1rem' }}>🌐 Coordenadas Geográficas</legend>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9em' }}>
                        Após preencher o endereço (CEP, Logradouro, Número, Cidade, UF), clique abaixo para obter as coordenadas.
                        <br />Ou preencha/ajuste manualmente os campos de Latitude e Longitude.
                    </p>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={handleGerarCoordenadasClick}
                            disabled={buscandoCoords || !enderecoData.logradouro || !enderecoData.numero || !enderecoData.localidade || !enderecoData.uf}
                            className="button-secondary"
                            style={{ padding: '10px 20px' }}
                        >
                            {buscandoCoords ? 'Gerando...' : 'Obter/Atualizar Coordenadas'}
                        </button>
                        {buscandoCoords && <p className="message info" style={{ marginTop: '0.5rem' }}>Consultando serviço de geocodificação...</p>}
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-item">
                            <label htmlFor="latitude" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500' }}>Latitude:</label>
                            <input id="latitude" ref={latitudeRef} type="number" step="any" name="latitude" value={String(enderecoData.latitude || '')} onChange={handleEnderecoChange} placeholder="Ex: -23.550520" style={{ textAlign: 'center' }}/>
                        </div>
                        <div className="form-group flex-item">
                            <label htmlFor="longitude" style={{ display: 'block', marginBottom: '0.3rem', fontWeight: '500' }}>Longitude:</label>
                            <input id="longitude" ref={longitudeRef} type="number" step="any" name="longitude" value={String(enderecoData.longitude || '')} onChange={handleEnderecoChange} placeholder="Ex: -46.633308" style={{ textAlign: 'center' }}/>
                        </div>
                    </div>

                    {(Number(enderecoData.latitude) !== 0 || Number(enderecoData.longitude) !== 0) && !buscandoCoords && (
                        <div className="coordinates-display" style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#e9f5e9', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#1b5e20' }}>
                                Coordenadas Atuais:
                                Lat: <span style={{ fontFamily: 'monospace' }}>{Number(enderecoData.latitude).toFixed(7)}</span>,
                                Lon: <span style={{ fontFamily: 'monospace' }}>{Number(enderecoData.longitude).toFixed(7)}</span>
                            </p>
                        </div>
                    )}
                    {!(Number(enderecoData.latitude) !== 0 || Number(enderecoData.longitude) !== 0) && (enderecoData.logradouro && String(enderecoData.numero||'').trim() && enderecoData.localidade && enderecoData.uf) && !buscandoCoords &&
                        <p className="message info" style={{marginTop: '1rem'}}>Clique em "Obter/Atualizar Coordenadas" ou preencha manualmente.</p>
                    }
                </fieldset>

                <hr className="section-divider"/>

                <button
                    type="submit"
                    disabled={buscandoCep || buscandoCoords || loadingSubmit}
                    className="button-primary"
                    style={{marginTop: '20px', width: '100%', padding: '12px', fontSize: '1.1em'}}
                >
                    {loadingSubmit ? 'Salvando Usuário...' : (buscandoCep || buscandoCoords ? 'Aguarde...' : 'Salvar Usuário Completo')}
                </button>
            </form>

            {(mensagem && !erro) && <p className="message success" style={{marginTop: '20px', textAlign: 'center'}}>{mensagem}</p>}
            {erro && <p className="message error" style={{marginTop: '20px', textAlign: 'center'}}>{erro}</p>}

            <div style={{marginTop: '30px', marginBottom: '40px', textAlign: 'center'}}>
                <Link href="/clientes/listar">Voltar para Lista de Usuários</Link>
            </div>
        </div>
    );
}