"use server";

import { db } from "@/src/db";
import { clientes, users } from "@/src/db/schema";
import { requireAuth } from "@/src/lib/auth-server";
import { canAccessNpl } from "@/src/lib/roles";
import { expedienteService } from "@/src/fetatures/expediente_npl/services/ExpedienteService";
import { taskService } from "@/src/fetatures/tasks/services/TaskService";
import { nplService } from "@/src/fetatures/gestion_npl/services/NplService";
import {
  SolicitudInversionInput,
  SolicitudInversionSchema,
} from "../schemas/solicitudSchema";
import { eq, or, sql } from "drizzle-orm";

// Email de Alejandro — responsable de negocio que recibe las solicitudes
const ALEJANDRO_EMAIL = "alejandro@gmail.com";

/**
 * Localiza el id de Alejandro en la tabla users.
 * Si no se encuentra, lanza un error descriptivo.
 */
async function findAlejandroId(): Promise<string> {
  const [alejandro] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, ALEJANDRO_EMAIL))
    .limit(1);

  if (!alejandro) {
    throw new Error(
      `No se encontró el usuario responsable (${ALEJANDRO_EMAIL}). Contacta con el administrador.`,
    );
  }
  return alejandro.id;
}

/**
 * Busca el cliente cuyo array JSONB `emails` contenga el email del usuario.
 * Los emails en clientes se almacenan como [{titulo, valor}], por lo que
 * buscamos con un operador JSONB existencial.
 */
async function findClienteIdByEmail(email: string): Promise<number | null> {
  // Buscamos en el array JSONB si algún elemento tiene "valor" === email
  const [found] = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(
      sql`EXISTS (
        SELECT 1 FROM jsonb_array_elements(${clientes.emails}) AS e
        WHERE e->>'valor' = ${email}
      )`,
    )
    .limit(1);

  return found?.id ?? null;
}

export async function solicitudInversionAction(input: SolicitudInversionInput) {
  // 1. Autenticación
  const { session } = await requireAuth();
  if (!session) {
    return {
      success: "",
      error: "No estás autenticado. Por favor inicia sesión.",
    };
  }

  // 2. Autorización: solo cliente / agente (y roles internos)
  if (!canAccessNpl(session.user.role)) {
    return { success: "", error: "No tienes permiso para enviar solicitudes." };
  }

  // 3. Validación Zod
  const parsed = SolicitudInversionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: "", error: "Revisa los datos del formulario." };
  }
  const data = parsed.data;

  // 4. Verificar que el NPL existe y es público
  try {
    const npl = await nplService.getNpl(data.nplId);
    if (!npl.esPublico) {
      return { success: "", error: "El activo no está disponible." };
    }
  } catch {
    return { success: "", error: "No se encontró el activo solicitado." };
  }

  // 5. Datos auxiliares
  const hoy = new Date();
  const fechaHoyISO = hoy.toISOString().split("T")[0]; // YYYY-MM-DD
  const fechaLimite = new Date(hoy);
  fechaLimite.setDate(fechaLimite.getDate() + 2);

  let alejandroId: string;
  try {
    alejandroId = await findAlejandroId();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error buscando responsable";
    return { success: "", error: msg };
  }

  const clienteId = await findClienteIdByEmail(session.user.email);

  const tipoSolicitudLabel: Record<string, string> = {
    informacion_activos: "Información de activos",
    visita_consulta_comercial: "Visita / Consulta comercial",
    formalizar_inversion: "Formalizar inversión",
    otros: "Otros",
  };

  const contenidoNota = `
<p><strong>Tipo:</strong> ${tipoSolicitudLabel[data.tipoSolicitud] ?? data.tipoSolicitud}</p>
<p><strong>Procedencia:</strong> ${data.procedenciaSolicitud}</p>
<p><strong>Activo:</strong> ${data.nplTitulo}</p>
<p><strong>Mensaje del cliente:</strong></p>
<p>${data.textoSolicitud.replace(/\n/g, "<br/>")}</p>
  `.trim();

  // 6. Crear nota en expediente_notas
  try {
    await expedienteService.createNota(
      data.nplId,
      {
        tipoNota: "comercial",
        relevanciaNota: "alta",
        statusNota: "revisar",
        usuarioRelacionadoId: alejandroId,
        notaItems: [
          {
            fecha: fechaHoyISO,
            titulo: "solicitud_inversion",
            contenido: contenidoNota,
            documentos_upload: [],
          },
        ],
      },
      session.user.id,
    );
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Error creando nota de expediente";
    return { success: "", error: msg };
  }

  // 7. Crear task
  try {
    // Recuperar nuestro_codigo_npl para el campo expediente de la task
    const nplData = await nplService.getNpl(data.nplId);
    const codigoExpediente = nplData.nuestroCodigoNpl ?? `NPL-${data.nplId}`;

    await taskService.createTask(
      {
        title: "solicitud_inversion",
        description: data.textoSolicitud.slice(0, 500),
        expediente: codigoExpediente,
        status: "PENDIENTE",
        priority: "ALTA",
        category: "NEGOCIACION",
        assigneeId: alejandroId,
        nplId: data.nplId,
        clienteId: clienteId ?? undefined,
        fechaPropuesta: hoy,
        fechaLimite: fechaLimite,
        notas: "",
      },
      session.user.id,
    );
  } catch (e) {
    // La nota ya fue creada; informamos del problema parcial
    const msg = e instanceof Error ? e.message : "Error creando tarea";
    return {
      success: "",
      error: `La nota fue registrada pero falló la creación de la tarea: ${msg}`,
    };
  }

  return {
    success:
      "Solicitud enviada correctamente. Nos pondremos en contacto contigo en breve.",
    error: "",
  };
}
