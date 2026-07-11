import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concesionario — Vehículos usados en Guatemala',
  description: 'Marketplace de compra y venta de vehículos usados en Guatemala.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
