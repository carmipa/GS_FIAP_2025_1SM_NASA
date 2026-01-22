// src/app/clientes/layout.tsx
'use client'; // ESSENCIAL: Marca como Client Component

import Link from 'next/link';
import React from 'react';

export default function ClientesLayout({
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

    // Para os estilos de hover, é melhor usar classes CSS e :hover em globals.css
    // ou criar um pequeno componente LinkEstilizado se quiser manter a lógica JS.
    // Por simplicidade, manterei os handlers JS aqui, já que o componente é 'use client'.
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
                <Link href="/clientes/listar" style={subNavLinkStyle}
                      onMouseOver={handleLinkMouseOver}
                      onMouseOut={handleLinkMouseOut}>
                    <span className="material-icons-outlined">list_alt</span>Listar Usuários
                </Link>
                <Link href="/clientes/cadastrar" style={subNavLinkStyle}
                      onMouseOver={handleLinkMouseOver}
                      onMouseOut={handleLinkMouseOut}>
                    <span className="material-icons-outlined">person_add</span>Cadastrar Usuários
                </Link>
                <Link href="/clientes/buscar" style={subNavLinkStyle}
                      onMouseOver={handleLinkMouseOver}
                      onMouseOut={handleLinkMouseOut}>
                    <span className="material-icons-outlined">search</span>Buscar Usuário
                </Link>
            </nav>
            <div className="container">
                {children}
            </div>
        </section>
    );
}