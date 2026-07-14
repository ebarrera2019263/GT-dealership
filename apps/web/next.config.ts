import type { NextConfig } from 'next';

// El host del API (donde viven /uploads/vehiculos) es configurable por entorno.
// Lo derivamos de NEXT_PUBLIC_API_URL para que next/image lo acepte en dev y prod
// sin hardcodear localhost. Si no se puede parsear, caemos a localhost:3001.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
let apiPattern: { protocol: 'http' | 'https'; hostname: string; port: string };
try {
  const u = new URL(API_URL);
  apiPattern = {
    protocol: u.protocol === 'https:' ? 'https' : 'http',
    hostname: u.hostname,
    port: u.port,
  };
} catch {
  apiPattern = { protocol: 'http', hostname: 'localhost', port: '3001' };
}

const nextConfig: NextConfig = {
  transpilePackages: ['@concesionario/shared'],
  images: {
    remotePatterns: [
      // Fotos de anuncios servidas por el API (/uploads/vehiculos/**)
      { ...apiPattern, pathname: '/uploads/**' },
      // Foto del hero (marketing)
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // Renders de vehículos demo (placeholders por marca/modelo)
      { protocol: 'https', hostname: 'cdn.imagin.studio', pathname: '/getimage**' },
    ],
  },
};

export default nextConfig;
