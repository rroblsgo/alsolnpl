CREATE TYPE "cliente_estado" AS ENUM('PROSPECTO', 'ACTIVO', 'INACTIVO', 'DESCARTADO');--> statement-breakpoint
CREATE TYPE "cliente_fuente_captacion" AS ENUM('REFERIDO', 'WEB', 'LINKEDIN', 'EVENTO', 'OTRO');--> statement-breakpoint
CREATE TYPE "cliente_ocupacion" AS ENUM('EMPRESARIO', 'DIRECTIVO', 'PROFESIONAL_LIBERAL', 'INVERSOR_TIEMPO_COMPLETO', 'JUBILADO', 'OTRO');--> statement-breakpoint
CREATE TYPE "cliente_perfil_inversor" AS ENUM('PARTICULAR', 'FAMILY_OFFICE', 'ASESOR_PROFESIONAL', 'INMOBILIARIA');--> statement-breakpoint
CREATE TYPE "cliente_rango_capital" AS ENUM('HASTA_25K', '25K_50K', '50K_100K', '100K_250K', '250K_500K', 'MAS_500K');--> statement-breakpoint
CREATE TYPE "document_category" AS ENUM('ESCRITURA', 'NOTA_SIMPLE', 'TASACION', 'CONTRATO', 'JUDICIAL', 'CATASTRO', 'IDENTIFICACION', 'FINANCIERO', 'CORRESPONDENCIA', 'FOTOGRAFIA', 'OTRO');--> statement-breakpoint
CREATE TYPE "document_entity_type" AS ENUM('NPL', 'TASK');--> statement-breakpoint
CREATE TYPE "npl_estado" AS ENUM('ACTIVO', 'RESERVADO', 'VENDIDO', 'ARCHIVADO');--> statement-breakpoint
CREATE TYPE "npl_procedimiento" AS ENUM('EJECUCION_HIPOTECARIA', 'DACION_EN_PAGO', 'ACUERDO_EXTRAJUDICIAL', 'SUBASTA', 'OTRO');--> statement-breakpoint
CREATE TYPE "npl_tipo_inmueble" AS ENUM('VIVIENDA', 'LOCAL', 'OFICINA', 'GARAJE', 'TRASTERO', 'NAVE_INDUSTRIAL', 'SOLAR', 'FINCA_RUSTICA', 'OTRO');--> statement-breakpoint
CREATE TYPE "npl_tipo_registro" AS ENUM('DEUDOR', 'HIPOTECANTE', 'FIADOR');--> statement-breakpoint
CREATE TYPE "task_category" AS ENUM('DUE_DILIGENCE', 'LEGAL', 'VALORACION', 'NEGOCIACION', 'CATASTRO', 'SUBASTA', 'ADMINISTRATIVO', 'OTRO');--> statement-breakpoint
CREATE TYPE "task_priority" AS ENUM('ALTA', 'MEDIA', 'BAJA');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('PENDIENTE', 'EN_CURSO', 'COMPLETADA', 'BLOQUEADA', 'CANCELADA');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(50) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"image" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY,
	"nombre" varchar(255) NOT NULL,
	"dni" varchar(20),
	"empresa" varchar(255),
	"nif" varchar(20),
	"imagen" varchar(255),
	"direccion" varchar(255),
	"provincia" varchar(100),
	"municipio" varchar(100),
	"codigo_postal" varchar(10),
	"emails" jsonb DEFAULT '[]' NOT NULL,
	"telefonos" jsonb DEFAULT '[]' NOT NULL,
	"contactos" jsonb DEFAULT '[]' NOT NULL,
	"perfil_inversor" "cliente_perfil_inversor",
	"ocupacion_principal" "cliente_ocupacion",
	"rango_capital_invertir" "cliente_rango_capital",
	"activos_interesado" text[] DEFAULT '{}'::text[] NOT NULL,
	"experiencia_previa_detalle" text,
	"informado_npl_detalle" text,
	"estado" "cliente_estado" DEFAULT 'PROSPECTO'::"cliente_estado" NOT NULL,
	"fuente_captacion" "cliente_fuente_captacion",
	"notas" text,
	"consentimiento_rgpd" boolean DEFAULT false NOT NULL,
	"fecha_consentimiento" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"image" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"community_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY,
	"titulo" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"nombre_archivo" varchar(255),
	"extension" varchar(20),
	"tamano" integer,
	"categoria" "document_category" DEFAULT 'OTRO'::"document_category" NOT NULL,
	"notas" text,
	"entity_type" "document_entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"details" text NOT NULL,
	"available_seats" integer NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"image" varchar(100) NOT NULL,
	"community_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_by" text NOT NULL,
	"virtual" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeti_attendees" (
	"meeti_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeti_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"meeti_id" uuid NOT NULL,
	"place_name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "municipios" (
	"municipio_id" varchar(5) PRIMARY KEY,
	"provincia_id" varchar(2) NOT NULL,
	"nombre" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"actor_name" varchar(60) NOT NULL,
	"message" varchar(100) NOT NULL,
	"target" varchar(100) NOT NULL,
	"type" varchar(50) DEFAULT 'general' NOT NULL,
	"task_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "npls" (
	"id" serial PRIMARY KEY,
	"nuestro_codigo_npl" varchar(10),
	"titulo_operacion" varchar(255) NOT NULL,
	"referencia_origen" varchar(100),
	"fondo" varchar(100),
	"direccion" varchar(255),
	"municipio" varchar(100),
	"provincia" varchar(100),
	"codigo_postal" varchar(10),
	"tipo_inmueble" "npl_tipo_inmueble" DEFAULT 'VIVIENDA'::"npl_tipo_inmueble" NOT NULL,
	"distribucion" text,
	"distribucion_resumida" varchar(255),
	"superficie_const" numeric(10,2),
	"superficie_parcela" numeric(10,2),
	"superficie_detalles" text,
	"any_construccion" integer,
	"ref_catastral" varchar(50),
	"finca_registral" varchar(100),
	"datos_registro" text,
	"imagen_asociada" varchar(255),
	"imagenes_adicionales" text[] DEFAULT '{}'::text[] NOT NULL,
	"coste_adquisicion_credito" numeric(14,2),
	"impuestos_ajd" numeric(14,2),
	"costes_notaria_registro" numeric(14,2),
	"gastos_dacion" numeric(14,2),
	"precio_mercado" numeric(14,2),
	"precio_venta_rapida" numeric(14,2),
	"comision_intermediacion" numeric(14,2),
	"puja_probable" numeric(14,2),
	"fecha_compra" date,
	"fecha_terminacion" date,
	"gastos_diversos" jsonb DEFAULT '[]' NOT NULL,
	"principal" numeric(14,2),
	"intereses" numeric(14,2),
	"costas" numeric(14,2),
	"fecha_calculada" date,
	"tasacion_subasta" numeric(14,2),
	"procedimiento" "npl_procedimiento" DEFAULT 'EJECUCION_HIPOTECARIA'::"npl_procedimiento",
	"num_procedimiento" varchar(50),
	"juzgado" varchar(255),
	"ejecutante" varchar(255),
	"auto_despacho_ejecucion" text,
	"prestamo_hipoteca_detalles" text,
	"actuaciones_judiciales" jsonb DEFAULT '[]' NOT NULL,
	"actuaciones_seguidas" text,
	"riesgos_juridicos" text,
	"notas_internas" text,
	"informacion_inversor" text,
	"estado" "npl_estado" DEFAULT 'ACTIVO'::"npl_estado" NOT NULL,
	"es_publico" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"creator_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npl_deudores" (
	"id" serial PRIMARY KEY,
	"npl_id" integer NOT NULL,
	"es_principal" boolean DEFAULT false NOT NULL,
	"tipo_registro" "npl_tipo_registro" DEFAULT 'DEUDOR'::"npl_tipo_registro" NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"dni" varchar(20),
	"direccion_completa" text,
	"estado_ocupacional" text,
	"vulnerabilidad" text,
	"notas" text,
	"otros_datos" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY,
	"title" varchar(200) NOT NULL,
	"description" varchar(500) NOT NULL,
	"notas" text,
	"npl_id" integer,
	"expediente" varchar(100) NOT NULL,
	"community_id" uuid NOT NULL,
	"status" "task_status" DEFAULT 'PENDIENTE'::"task_status" NOT NULL,
	"priority" "task_priority" DEFAULT 'MEDIA'::"task_priority" NOT NULL,
	"category" "task_category" DEFAULT 'OTRO'::"task_category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"fecha_propuesta" timestamp,
	"fecha_limite" timestamp,
	"completed_at" timestamp,
	"creator_id" text NOT NULL,
	"assignee_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_municipios_provincia" ON "municipios" ("provincia_id");--> statement-breakpoint
CREATE INDEX "idx_municipios_nombre" ON "municipios" ("nombre");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meetis" ADD CONSTRAINT "meetis_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meetis" ADD CONSTRAINT "meetis_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meeti_attendees" ADD CONSTRAINT "meeti_attendees_meeti_id_meetis_id_fkey" FOREIGN KEY ("meeti_id") REFERENCES "meetis"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meeti_attendees" ADD CONSTRAINT "meeti_attendees_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meeti_locations" ADD CONSTRAINT "meeti_locations_meeti_id_meetis_id_fkey" FOREIGN KEY ("meeti_id") REFERENCES "meetis"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_task_id_tasks_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "npls" ADD CONSTRAINT "npls_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "npl_deudores" ADD CONSTRAINT "npl_deudores_npl_id_npls_id_fkey" FOREIGN KEY ("npl_id") REFERENCES "npls"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_npl_id_npls_id_fkey" FOREIGN KEY ("npl_id") REFERENCES "npls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE CASCADE;