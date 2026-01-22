// src/app/desastres/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function DesastresLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const subNavStyle: React.CSSProperties = {
        backgroundColor: '#f8f9fa',
        padding: '12px 20px',
        marginBottom: '25px',
        borderRadius: '8px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    };

    const subNavLinkStyle: React.CSSProperties = {
        textDecoration: 'none',
        color: '#0056b3',
        fontWeight: '500',
        padding: '8px 12px',
        borderRadius: '5px',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
    };

    const handleLinkMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.backgroundColor = '#e9ecef';
        e.currentTarget.style.color = '#003f80';
    };

    const handleLinkMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#0056b3';
    };

    return (
        <section>
            <nav style={subNavStyle}>
                <Link
                    href="/desastres"
                    style={subNavLinkStyle}
                    onMouseOver={handleLinkMouseOver}
                    onMouseOut={handleLinkMouseOut}
                >
                    <span className="material-icons-outlined">dashboard</span> Painel EONET
                </Link>
                <Link
                    href="/desastres/mapa"
                    style={subNavLinkStyle}
                    onMouseOver={handleLinkMouseOver}
                    onMouseOut={handleLinkMouseOut}
                >
                    <span className="material-icons-outlined">map</span> Mapa de Eventos (Locais)
                </Link>
                <Link
                    href="/desastres/mapa-atuais"
                    style={subNavLinkStyle}
                    onMouseOver={handleLinkMouseOver}
                    onMouseOut={handleLinkMouseOut}
                >
                    <span className="material-icons-outlined">public</span> Mapa Atuais (NASA)
                </Link>
                {/* ***** INÍCIO DO NOVO LINK ADICIONADO ***** */}
                <Link
                    href="/desastres/estatisticas"
                    style={subNavLinkStyle}
                    onMouseOver={handleLinkMouseOver}
                    onMouseOut={handleLinkMouseOut}
                >
                    <span className="material-icons-outlined">leaderboard</span> Estatísticas
                </Link>
                {/* ***** FIM DO NOVO LINK ADICIONADO ***** */}
            </nav>

            <div className="container">
                {children}
            </div>
        </section>
    );
}