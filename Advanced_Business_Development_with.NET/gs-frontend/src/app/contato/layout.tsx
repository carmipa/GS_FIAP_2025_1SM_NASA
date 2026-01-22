'use client';

import React from 'react';
import 'leaflet/dist/leaflet.css'; // ESSENCIAL para o Leaflet funcionar corretamente

export default function ContatoLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    // Este layout envolve o conteúdo da página de contato.
    // Pode ser usado para adicionar estilos específicos ou wrappers apenas para a seção de contato.
    return (
        // A classe contact-page-bg foi definida no globals.css para um fundo diferenciado
        <section className="contact-page-bg py-8 md:py-12"> {/* Adiciona padding vertical */}
            {children}
        </section>
    );
}