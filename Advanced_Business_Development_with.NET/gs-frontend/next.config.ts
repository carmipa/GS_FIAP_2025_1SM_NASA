// next.config.ts
import path from 'path';
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // swcMinify: true, // Removido - padrão no Next.js 13+
    // experimental: { // Removido - appDir é padrão no Next.js 13+
    //   appDir: true,
    // },
    webpack(config, { isServer }) { // Adicionado { isServer } se for usar condicionalmente
        // Configuração do alias para @ apontando para src/
        // A verificação `if (!isServer)` pode ser útil se você tiver aliases
        // que só devem ser aplicados no client-side, mas para um alias geral como '@'
        // geralmente não é necessário.
        config.resolve.alias = {
            ...config.resolve.alias, // Mantém outros aliases existentes
            '@': path.resolve(__dirname, 'src'),
        };
        return config;
    },
    // Adicione outras configurações válidas do Next.js aqui, se necessário.
    // Exemplo para imagens de domínios externos:
    // images: {
    //   remotePatterns: [
    //     {
    //       protocol: 'https',
    //       hostname: 'example.com',
    //       port: '',
    //       pathname: '/images/**',
    //     },
    //   ],
    // },
};

export default nextConfig;
