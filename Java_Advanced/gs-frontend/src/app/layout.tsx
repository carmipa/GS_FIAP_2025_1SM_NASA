import './globals.css';
import Link from 'next/link';
import type { Metadata } from "next";
import { Roboto } from 'next/font/google';

// Configuração da fonte Roboto, mantendo uma única definição
const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});

// Metadados para SEO e identificação do projeto
export const metadata: Metadata = {
    title: "GS Alerta Desastres | MetaMind",
    description: "Aplicação para monitoramento de desastres e alertas para a Global Solution FIAP, desenvolvida pela equipe MetaMind.",
    keywords: "FIAP, Global Solution, Desastres, Alertas, EONET, Next.js, React, TypeScript, MetaMind",
    authors: [{ name: "MetaMind Team" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" className={roboto.variable}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined&display=optional"
                    rel="stylesheet"
                />
            </head>
            <body className={roboto.className}>
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
                    {children}
                </main>
                <footer>
                    Global Solution 2025 - FIAP &copy; MetaMind Team
                </footer>
            </body>
        </html>
    );
}