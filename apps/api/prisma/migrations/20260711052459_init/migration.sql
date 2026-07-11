-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('comprador', 'vendedor', 'concesionario', 'admin');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('GTQ', 'USD');

-- CreateEnum
CREATE TYPE "Traccion" AS ENUM ('4x2', '4x4', 'AWD');

-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('borrador', 'en_revision', 'publicado', 'rechazado', 'pausado', 'expirado', 'vendido');

-- CreateEnum
CREATE TYPE "CanalLead" AS ENUM ('formulario', 'whatsapp', 'llamada');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('pendiente', 'confirmada', 'cancelada');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('abierto', 'resuelto');

-- CreateEnum
CREATE TYPE "EstadoSolicitudCredito" AS ENUM ('enviada', 'en_revision', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "AplicaA" AS ENUM ('todos', 'verificados', 'concesionario');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('activa', 'vencida', 'cancelada');

-- CreateEnum
CREATE TYPE "ConceptoPago" AS ENUM ('suscripcion', 'destacado');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'completado', 'fallido', 'reembolsado');

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" SERIAL NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrocerias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icono" TEXT,

    CONSTRAINT "carrocerias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combustibles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "combustibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transmisiones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "transmisiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristicas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "caracteristicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" SERIAL NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'comprador',
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "telefono_verificado" BOOLEAN NOT NULL DEFAULT false,
    "avatar_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concesionarios" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nombre_comercial" TEXT NOT NULL,
    "nit" TEXT,
    "direccion" TEXT,
    "logo_url" TEXT,
    "plan_id" INTEGER,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concesionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "modelo_id" INTEGER NOT NULL,
    "carroceria_id" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "version" TEXT,
    "precio" DECIMAL(12,2) NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'GTQ',
    "precio_gtq" DECIMAL(12,2) NOT NULL,
    "precio_negociable" BOOLEAN NOT NULL DEFAULT false,
    "kilometraje" INTEGER NOT NULL,
    "transmision_id" INTEGER NOT NULL,
    "combustible_id" INTEGER NOT NULL,
    "cilindrada" DECIMAL(4,1),
    "potencia" INTEGER,
    "puertas" INTEGER,
    "color" TEXT,
    "traccion" "Traccion",
    "placa_parcial" TEXT,
    "vin" TEXT,
    "num_duenos" INTEGER,
    "descripcion" TEXT,
    "departamento_id" INTEGER NOT NULL,
    "municipio_id" INTEGER NOT NULL,
    "estado" "EstadoVehiculo" NOT NULL DEFAULT 'borrador',
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "destacado_hasta" TIMESTAMP(3),
    "vistas" INTEGER NOT NULL DEFAULT 0,
    "contactos" INTEGER NOT NULL DEFAULT 0,
    "publicado_en" TIMESTAMP(3),
    "expira_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo_imagenes" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "url_thumb" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vehiculo_imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculo_caracteristicas" (
    "vehiculo_id" INTEGER NOT NULL,
    "caracteristica_id" INTEGER NOT NULL,

    CONSTRAINT "vehiculo_caracteristicas_pkey" PRIMARY KEY ("vehiculo_id","caracteristica_id")
);

-- CreateTable
CREATE TABLE "favoritos" (
    "usuario_id" INTEGER NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoritos_pkey" PRIMARY KEY ("usuario_id","vehiculo_id")
);

-- CreateTable
CREATE TABLE "conversaciones" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "comprador_id" INTEGER NOT NULL,
    "vendedor_id" INTEGER NOT NULL,
    "ultimo_mensaje_en" TIMESTAMP(3),

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" SERIAL NOT NULL,
    "conversacion_id" INTEGER NOT NULL,
    "emisor_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "canal" "CanalLead" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "busquedas_guardadas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "criterios" JSONB NOT NULL,
    "alerta_activa" BOOLEAN NOT NULL DEFAULT true,
    "ultima_notificacion" TIMESTAMP(3),

    CONSTRAINT "busquedas_guardadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "comprador_id" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "motivo" TEXT NOT NULL,
    "detalle" TEXT,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'abierto',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entidades_financieras" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "logo_url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "entidades_financieras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_financiamiento" (
    "id" SERIAL NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tasa_anual" DECIMAL(5,2) NOT NULL,
    "plazo_min" INTEGER NOT NULL,
    "plazo_max" INTEGER NOT NULL,
    "enganche_min_pct" DECIMAL(5,2) NOT NULL,
    "requisitos" JSONB,
    "aplica_a" "AplicaA" NOT NULL DEFAULT 'todos',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "planes_financiamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_credito" (
    "id" SERIAL NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "enganche" DECIMAL(12,2) NOT NULL,
    "plazo" INTEGER NOT NULL,
    "cuota_estimada" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoSolicitudCredito" NOT NULL DEFAULT 'enviada',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio_mensual" DECIMAL(10,2) NOT NULL,
    "max_anuncios" INTEGER NOT NULL,
    "max_fotos" INTEGER NOT NULL,
    "destacados_incluidos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoSuscripcion" NOT NULL DEFAULT 'activa',

    CONSTRAINT "suscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "concepto" "ConceptoPago" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" "Moneda" NOT NULL DEFAULT 'GTQ',
    "referencia" TEXT,
    "estado" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_cambio" (
    "id" SERIAL NOT NULL,
    "tasa_usd_gtq" DECIMAL(10,5) NOT NULL,
    "vigente_desde" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "datos_antes" JSONB,
    "datos_despues" JSONB,
    "ip" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_slug_key" ON "marcas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_marca_id_slug_key" ON "modelos"("marca_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "carrocerias_nombre_key" ON "carrocerias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "carrocerias_slug_key" ON "carrocerias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "combustibles_nombre_key" ON "combustibles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "transmisiones_nombre_key" ON "transmisiones"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristicas_nombre_key" ON "caracteristicas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "municipios_departamento_id_nombre_key" ON "municipios"("departamento_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "concesionarios_usuario_id_key" ON "concesionarios"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_uuid_key" ON "vehiculos"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_slug_key" ON "vehiculos"("slug");

-- CreateIndex
CREATE INDEX "vehiculos_estado_precio_gtq_idx" ON "vehiculos"("estado", "precio_gtq");

-- CreateIndex
CREATE INDEX "vehiculos_estado_anio_idx" ON "vehiculos"("estado", "anio");

-- CreateIndex
CREATE INDEX "vehiculos_estado_kilometraje_idx" ON "vehiculos"("estado", "kilometraje");

-- CreateIndex
CREATE INDEX "vehiculos_marca_id_modelo_id_idx" ON "vehiculos"("marca_id", "modelo_id");

-- CreateIndex
CREATE INDEX "vehiculos_departamento_id_idx" ON "vehiculos"("departamento_id");

-- CreateIndex
CREATE INDEX "vehiculos_usuario_id_idx" ON "vehiculos"("usuario_id");

-- CreateIndex
CREATE INDEX "vehiculos_expira_en_idx" ON "vehiculos"("expira_en");

-- CreateIndex
CREATE INDEX "vehiculo_imagenes_vehiculo_id_idx" ON "vehiculo_imagenes"("vehiculo_id");

-- CreateIndex
CREATE INDEX "conversaciones_vendedor_id_idx" ON "conversaciones"("vendedor_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversaciones_vehiculo_id_comprador_id_key" ON "conversaciones"("vehiculo_id", "comprador_id");

-- CreateIndex
CREATE INDEX "mensajes_conversacion_id_creado_en_idx" ON "mensajes"("conversacion_id", "creado_en");

-- CreateIndex
CREATE INDEX "leads_vehiculo_id_idx" ON "leads"("vehiculo_id");

-- CreateIndex
CREATE INDEX "busquedas_guardadas_usuario_id_idx" ON "busquedas_guardadas"("usuario_id");

-- CreateIndex
CREATE INDEX "citas_vehiculo_id_idx" ON "citas"("vehiculo_id");

-- CreateIndex
CREATE INDEX "reportes_estado_idx" ON "reportes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "entidades_financieras_nombre_key" ON "entidades_financieras"("nombre");

-- CreateIndex
CREATE INDEX "solicitudes_credito_usuario_id_idx" ON "solicitudes_credito"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "planes_nombre_key" ON "planes"("nombre");

-- CreateIndex
CREATE INDEX "suscripciones_usuario_id_idx" ON "suscripciones"("usuario_id");

-- CreateIndex
CREATE INDEX "pagos_usuario_id_idx" ON "pagos"("usuario_id");

-- CreateIndex
CREATE INDEX "tipos_cambio_vigente_desde_idx" ON "tipos_cambio"("vigente_desde" DESC);

-- CreateIndex
CREATE INDEX "auditoria_entidad_entidad_id_idx" ON "auditoria"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "auditoria_usuario_id_idx" ON "auditoria"("usuario_id");

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concesionarios" ADD CONSTRAINT "concesionarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concesionarios" ADD CONSTRAINT "concesionarios_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_carroceria_id_fkey" FOREIGN KEY ("carroceria_id") REFERENCES "carrocerias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_transmision_id_fkey" FOREIGN KEY ("transmision_id") REFERENCES "transmisiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_combustible_id_fkey" FOREIGN KEY ("combustible_id") REFERENCES "combustibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_imagenes" ADD CONSTRAINT "vehiculo_imagenes_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_caracteristicas" ADD CONSTRAINT "vehiculo_caracteristicas_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculo_caracteristicas" ADD CONSTRAINT "vehiculo_caracteristicas_caracteristica_id_fkey" FOREIGN KEY ("caracteristica_id") REFERENCES "caracteristicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favoritos" ADD CONSTRAINT "favoritos_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busquedas_guardadas" ADD CONSTRAINT "busquedas_guardadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_financiamiento" ADD CONSTRAINT "planes_financiamiento_entidad_id_fkey" FOREIGN KEY ("entidad_id") REFERENCES "entidades_financieras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_credito" ADD CONSTRAINT "solicitudes_credito_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_credito" ADD CONSTRAINT "solicitudes_credito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_credito" ADD CONSTRAINT "solicitudes_credito_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes_financiamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
