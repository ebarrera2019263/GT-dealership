import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso legal y términos de uso',
  description:
    'AutosGT es una plataforma de clasificados que conecta a compradores y vendedores de vehículos usados en Guatemala. No es parte de las transacciones ni vende vehículos.',
};

// Página estática. El deslinde de responsabilidad es un requisito del proyecto
// (esquema §10): la plataforma conecta, no vende.
const SECCIONES: { titulo: string; parrafos: string[] }[] = [
  {
    titulo: '1. Qué es AutosGT',
    parrafos: [
      'AutosGT es una plataforma de clasificados en línea que conecta a personas que quieren vender un vehículo usado con personas interesadas en comprarlo. Facilitamos la publicación de anuncios, el contacto entre las partes y herramientas de referencia como el simulador de financiamiento.',
      'AutosGT no es un concesionario, no compra ni vende vehículos, y no es propietaria de los vehículos anunciados.',
    ],
  },
  {
    titulo: '2. La transacción es entre las partes',
    parrafos: [
      'Cualquier negociación, acuerdo, pago, entrega, traspaso o garantía relacionado con un vehículo se realiza directa y exclusivamente entre el comprador y el vendedor. AutosGT no interviene en la transacción, no la garantiza y no retiene fondos.',
      'Recomendamos a compradores y vendedores verificar la identidad de la otra parte, revisar físicamente el vehículo, confirmar la documentación (tarjeta de circulación, solvencias, historial) y realizar el traspaso ante las autoridades correspondientes antes de entregar dinero.',
    ],
  },
  {
    titulo: '3. Contenido de los anuncios',
    parrafos: [
      'La información de cada anuncio —precio, estado, kilometraje, características y fotografías— es responsabilidad de quien lo publica. AutosGT no garantiza su exactitud, vigencia ni veracidad.',
      'Moderamos los anuncios para cumplir normas básicas de publicación, pero esa revisión no constituye una inspección mecánica ni una certificación del vehículo. La etiqueta “verificado”, cuando exista, se refiere únicamente a los criterios descritos en la plataforma y no sustituye una revisión independiente.',
    ],
  },
  {
    titulo: '4. Financiamiento',
    parrafos: [
      'El simulador de financiamiento y los planes mostrados son estimaciones con fines informativos. No constituyen una oferta de crédito ni un compromiso de aprobación por parte de AutosGT ni de ninguna entidad financiera.',
      'Las condiciones reales (tasa, plazo, enganche y requisitos) las define la entidad financiera al evaluar cada solicitud. Enviar una solicitud a través de la plataforma no garantiza su aprobación.',
    ],
  },
  {
    titulo: '5. Datos personales y privacidad',
    parrafos: [
      'Tratamos los datos que nos proporcionás para operar la plataforma: crear tu cuenta, publicar anuncios, enviar mensajes entre las partes y notificarte novedades. No exponemos públicamente datos sensibles del vehículo como el VIN o el número de placa.',
      'No compartimos tu información con terceros salvo lo necesario para prestar el servicio o cuando la ley lo requiera.',
    ],
  },
  {
    titulo: '6. Uso responsable',
    parrafos: [
      'Al usar AutosGT te comprometés a publicar información veraz, a no anunciar vehículos que no te pertenecen o cuya venta esté restringida, y a no usar la plataforma para fines fraudulentos. Podemos pausar o retirar anuncios y suspender cuentas que incumplan estas condiciones.',
    ],
  },
  {
    titulo: '7. Limitación de responsabilidad',
    parrafos: [
      'AutosGT no será responsable por daños derivados de la relación entre comprador y vendedor, por la calidad o el estado de los vehículos, ni por decisiones tomadas con base en la información publicada o en el simulador de financiamiento. El servicio se ofrece “tal cual”, sin garantías sobre resultados de compraventa.',
    ],
  },
];

export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Aviso legal y términos de uso
      </h1>
      <p className="mt-3 text-sm text-musgo">
        AutosGT conecta compradores y vendedores de vehículos usados en Guatemala. La transacción es
        siempre entre las partes.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {SECCIONES.map((s) => (
          <section key={s.titulo}>
            <h2 className="font-display text-lg font-semibold text-tinta">{s.titulo}</h2>
            <div className="mt-2 flex flex-col gap-2">
              {s.parrafos.map((p) => (
                <p key={p.slice(0, 32)} className="leading-relaxed text-tinta/90">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-12 border-t border-borde pt-6 text-xs text-musgo">
        Este aviso puede actualizarse. El uso continuado de la plataforma implica la aceptación de
        la versión vigente.
      </p>
    </main>
  );
}
