import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // As imagens de hoje são data URLs (base64) ou URLs externas coladas
    // pelo usuário. O otimizador do next/image não processa data URLs e
    // exigiria allowlist de hosts para URLs externas, então rodamos sem
    // otimização server-side. Mesmo assim o next/image entrega lazy-load,
    // reserva de espaço (sem layout-shift) e placeholder blur.
    // Ao migrar os uploads para Vercel Blob (URLs reais), remova esta linha
    // e configure remotePatterns para ativar a otimização automática.
    unoptimized: true,
  },
  // Tree-shaking mais agressivo dos imports nomeados dessas libs —
  // reduz o JS enviado ao cliente (bundles menores = navegação mais rápida).
  experimental: {
    optimizePackageImports: ["motion"],
    serverActions: {
      // Anexos são enviados como data URL (base64) via Server Action;
      // o cap real fica no cliente (~8MB por arquivo). Base64 infla ~33%,
      // então deixamos folga aqui pra imagens e clipes curtos.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
