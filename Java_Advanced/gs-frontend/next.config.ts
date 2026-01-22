// next.config.ts
import path from "path";
import CopyPlugin from "copy-webpack-plugin";
import { NextConfig } from "next";

// Esta variável é usada para o `next dev`, mas não afeta a produção com Nginx.
const javaApiBaseUrl = process.env.JAVA_API_BASE_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Mantém a saída 'standalone' que é ótima para Docker e deploy limpo.
  output: "standalone",

  images: {
    // 1) Ótima escolha para simplificar o deploy. Serve as imagens de /public diretamente.
    unoptimized: true,

    // 2) Permite os SVGs externos dos badges do GitHub.
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.shields.io", pathname: "/badge/**" },
      { protocol: "https", hostname: "reliefweb.int",  pathname: "/**" },
      { protocol: "https", hostname: "api.reliefweb.int", pathname: "/**" },
      { protocol: "https", hostname: "unpkg.com",       pathname: "/**" },
    ],
  },

  // A configuração de 'rewrites' é usada principalmente para o ambiente de desenvolvimento.
  // Em produção, o Nginx está fazendo este trabalho. Não há problema em mantê-la.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${javaApiBaseUrl}/api/:path*`,
      },
    ];
  },

  // Configuração do Webpack para copiar a pasta 'public' para o lugar certo.
  webpack(config) {
    // Configura o alias '@' para apontar para a pasta 'src'.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    // Adiciona o plugin para copiar os arquivos.
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public"),
            // ✅ CORREÇÃO APLICADA AQUI: O destino correto para o modo 'standalone'.
            to: path.resolve(__dirname, ".next/standalone/public"),
          },
        ],
      })
    );

    return config;
  },
};

export default nextConfig;