const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function estadoApi(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/salud`, { cache: 'no-store' });
    if (!res.ok) return 'con errores';
    return 'conectada';
  } catch {
    return 'sin conexión';
  }
}

export default async function Home() {
  const estado = await estadoApi();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Concesionario</h1>
      <p className="text-lg text-neutral-600">
        Marketplace de vehículos usados en Guatemala — Fase 0
      </p>
      <p className="rounded-full border border-neutral-200 bg-white px-4 py-1 text-sm text-neutral-500">
        API: {estado}
      </p>
    </main>
  );
}
