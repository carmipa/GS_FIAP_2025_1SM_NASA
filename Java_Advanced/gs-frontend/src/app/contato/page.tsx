"use client";

import React, { FormEvent, useState } from "react";
import dynamic from "next/dynamic";
import Image from 'next/image';
import { FaGithub, FaWhatsapp } from "react-icons/fa";
import {
    User,
    Mail,
    MapPin,
    Briefcase,
    Phone,
    MessageSquare,
    Send,
    ExternalLink,
} from "lucide-react";

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
    ssr: false,
    loading: () => <div className="leaflet-container flex items-center justify-center bg-gray-200"><p>Carregando mapa...</p></div>
});

interface TeamMember {
    name: string;
    rm: string;
    email: string;
    githubUser: string;
    githubLink: string;
    turma: string;
    phone: string;
    photoUrl: string;
}

const teamMembers: TeamMember[] = [
    {
        name: "Paulo André Carminati", rm: "557881", email: "rm557881@fiap.com.br",
        githubUser: "carmipa", githubLink: "https://github.com/carmipa", turma: "2-TDSPZ",
        phone: "(11) 97669-2633", photoUrl: "/fotos-equipe/paulo.jpg",
    },
    {
        name: "Arthur Bispo de Lima", rm: "557568", email: "rm557568@fiap.com.br",
        githubUser: "ArthurBispo00", githubLink: "https://github.com/ArthurBispo00", turma: "2-TDSPV",
        phone: "(11) 99145-6219", photoUrl: "/fotos-equipe/arthur.jpg",
    },
    {
        name: "João Paulo Moreira", rm: "557808", email: "rm557808@fiap.com.br",
        githubUser: "joao1015", githubLink: "https://github.com/joao1015", turma: "2-TDSPV",
        phone: "(11) 98391-1385", photoUrl: "/fotos-equipe/joao.jpg",
    },
];

const emailDestinoPrincipal = "rm557881@fiap.com.br";

const openGmailCompose = (to: string, subject?: string, body?: string) => {
    const params = new URLSearchParams();
    params.append("view", "cm");
    params.append("fs", "1");
    params.append("to", encodeURIComponent(to));
    if (subject) {
        params.append("su", encodeURIComponent(subject));
    }
    if (body) {
        params.append("body", encodeURIComponent(body));
    }
    const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;
    console.log("Abrindo Gmail com URL:", gmailUrl);
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
};


const ContactsPage: React.FC = () => {
    const fiapPaulista: [number, number] = [-23.56177, -46.65878];
    const [formMessage, setFormMessage] = useState<string>('');
    const [formError, setFormError] = useState<string>('');

    const handleContactSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError('');
        setFormMessage('');

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const emailFrom = formData.get('email') as string;
        const message = formData.get('message') as string;

        if (!name || !emailFrom || !message) {
            setFormError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const subject = `Contato via Site MetaMind - ${name}`;
        const body = `Nome: ${name}\nEmail do Remetente: ${emailFrom}\n\nMensagem:\n${message}`;

        openGmailCompose(emailDestinoPrincipal, subject, body);

        setFormMessage("Seu cliente de e-mail (Gmail) deve ter aberto com os detalhes da mensagem. Por favor, verifique.");
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="page-title justify-center text-3xl md:text-4xl mb-10 md:mb-12">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10" /> Conheça a Equipe MetaMind 🧠
            </h1>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
                {teamMembers.map((member) => (
                    <div key={member.rm} className="team-member-card">
                        <div
                            className="card-content"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ marginBottom: '15px' }}>
                                <Image
                                    src={member.photoUrl}
                                    alt={`Foto de ${member.name}`}
                                    width={120}
                                    height={120}
                                    style={{
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #007bff'
                                    }}
                                    className="mx-auto"
                                    priority={true} // Considerar remover priority se não for LCP e houver muitas imagens
                                />
                            </div>
                            <h3
                                className="member-name"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '1.25rem',
                                    fontWeight: '600',
                                    marginBottom: '10px',
                                }}
                            >
                                <User size={20} /> {member.name}
                            </h3>
                            <div style={{ textAlign: 'left', width: '100%', maxWidth: '280px' }}>
                                <p className="member-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Briefcase size={16} /> RM: {member.rm}
                                </p>
                                <p className="member-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Mail size={16} />
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openGmailCompose(member.email, `Contato para ${member.name}`);
                                        }}
                                        title={`Enviar email para ${member.name} via Gmail`}
                                        className="hover:underline cursor-pointer text-blue-400"
                                    >
                                        {member.email}
                                    </a>
                                </p>
                                <div className="member-info github-badge-container" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaGithub size={16} /> GitHub:
                                    <a href={member.githubLink} target="_blank" rel="noopener noreferrer" className="ml-1" title={`Perfil de ${member.name} no GitHub`}>
                                        {/* Nota: Usar o componente Image do Next.js é a melhor prática. 
                                            Pode ser necessário adicionar 'img.shields.io' ao seu arquivo next.config.js 
                                            na seção 'images.remotePatterns' para que isso funcione.
                                        */}
                                        <Image
                                            src={`https://img.shields.io/badge/GitHub-${member.githubUser}-brightgreen?style=flat-square&logo=github`}
                                            alt={`GitHub ${member.githubUser} Shield`}
                                            width={150} // Largura estimada para o badge
                                            height={20}  // Altura padrão para shields.io badges
                                        />
                                    </a>
                                </div>
                                <p className="member-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={16} />
                                    <a
                                        href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`Contatar ${member.name} via WhatsApp`}
                                        className="flex items-center hover:underline text-blue-400"
                                    >
                                        {member.phone} <FaWhatsapp className="ml-1 text-green-500" />
                                    </a>
                                </p>
                                <p className="member-info mb-0" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Briefcase size={16} /> Turma: {member.turma}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="contact-form-section">
                <h2>
                    <MessageSquare /> Entre em Contato Conosco
                </h2>
                <form onSubmit={handleContactSubmit} className="grid grid-cols-1 gap-5">
                    <div className="form-group">
                        <label htmlFor="name">Seu Nome:</label>
                        <input type="text" id="name" name="name" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="Digite seu nome" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Seu Email (para resposta):</label>
                        <input type="email" id="email" name="email" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="Digite seu email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Sua Mensagem:</label>
                        <textarea id="message" name="message" rows={5} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2" placeholder="Escreva sua mensagem" required></textarea>
                    </div>

                    {formMessage && <p className="message success text-green-600">{formMessage}</p>}
                    {formError && <p className="message error text-red-600">{formError}</p>}

                    <button type="submit" className="button button-primary w-full md:w-auto justify-self-start py-3 px-6">
                        Enviar Mensagem <Send className="ml-2" />
                    </button>
                </form>
            </section>

            <section className="map-section">
                <h2>
                    <MapPin /> Onde Estamos (FIAP Paulista)
                </h2>
                <div className="leaflet-container">
                    <LeafletMap position={fiapPaulista} zoom={17} markerText="MetaMind @ FIAP Paulista" />
                </div>
                <p className="text-muted-text-color mt-3 flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1 text-red-500" />
                    Av. Paulista, 1106 - 7º andar - Bela Vista, São Paulo - SP, 01311-000
                </p>
            </section>

            <section className="contact-links-section">
                <p>
                    Acompanhe nosso projeto no GitHub:
                    <a href="https://github.com/carmipa/GS_FIAP_2025_1SM" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">
                        <FaGithub /> Visitar Repositório
                    </a>
                </p>
                <p>
                    Saiba mais sobre a Global Solution FIAP:
                    <a href="https://www.fiap.com.br/graduacao/global-solution/" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">
                        <ExternalLink /> Página da Global Solution
                    </a>
                </p>
            </section>
        </div>
    );
};

export default ContactsPage;