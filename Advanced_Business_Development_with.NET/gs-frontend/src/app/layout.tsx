//――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// app\layout.tsx | arquivo layout.tsx
//――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

import './globals.css'; // Deve ser a primeira importação de CSS
import Link from 'next/link';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "GS Alerta Desastres | MetaMind", // Adicionando nome da equipe ao título
    description: "Aplicação para monitoramento de desastres e alertas para a Global Solution FIAP, desenvolvida pela equipe MetaMind.",
    keywords: "FIAP, Global Solution, Desastres, Alertas, EONET, Next.js, React, TypeScript, MetaMind",
    authors: [{ name: "MetaMind Team" }], // Nome da equipe
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
        <head>
            {/* Google Fonts e Material Icons */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined"
                rel="stylesheet"
            />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            {/* Adicionar um favicon é uma boa prática. Crie um arquivo public/favicon.ico */}
            <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body>
        <nav>
            <Link href="/" className="logo">
                <span className="material-icons-outlined">emergency</span>
                GS Alerta Desastres
            </Link>
            <Link href="/clientes/listar">
                <span className="material-icons-outlined">group</span>
                Usuários
            </Link>
            <Link href="/desastres">
                <span className="material-icons-outlined">volcano</span>
                Desastres EONET
            </Link>
            <Link href="/contato">
                <span className="material-icons-outlined">contact_support</span>
                Fale Conosco
            </Link>
        </nav>
        <main>
            {/* O container principal pode ser adicionado aqui ou em cada página/layout filho,
                dependendo da necessidade de flexibilidade.
                Se a maioria das páginas usa, adicionar aqui pode ser bom.
                Ex: <div className="container">{children}</div>
                Porém, a página de contato parece usar seu próprio container com classes de espaçamento.
                Vou deixar children direto para manter a flexibilidade original.
            */}
            {children}
        </main>
        <footer>
            Global Solution 2025 - FIAP &copy; MetaMind Team
        </footer>
        </body>
        </html>
    )
}