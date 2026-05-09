/**
 * Seed de tareas
 *
 * Uso:
 *   bunx tsx ./src/db/seed/seed-tasks.ts
 *
 * IMPORTANTE antes de ejecutar:
 *   1. Aplica la migración:
 *         bunx drizzle-kit migrate
 *   2. Edita src/db/seed/data/tasksData.ts y reemplaza:
 *         REPLACE_WITH_YOUR_USER_ID  →  id real de tu usuario
 *         REPLACE_WITH_COMMUNITY_ID  →  uuid real de una comunidad existente
 *   3. Ajusta los nplId (1..10) si tus NPLs tienen ids distintos.
 *      Puedes consultar los ids con:
 *         SELECT id, titulo_operacion FROM npls ORDER BY id LIMIT 15;
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { task } from '../schema';
import { tasksData } from './data/tasksData';
import 'dotenv/config';

async function seedTasks() {
  const db = drizzle(process.env.DATABASE_URL!);

  // Borra tareas existentes para partir de cero
  console.log('🗑️  Eliminando tareas existentes...');
  await db.delete(task);

  console.log(`⏳ Insertando ${tasksData.length} tareas...`);

  const inserted = await db
    .insert(task)
    .values(tasksData)
    .returning({ id: task.id, title: task.title, status: task.status });

  console.log(`\n✅ ${inserted.length} tareas insertadas:`);
  inserted.forEach((t, i) =>
    console.log(`   ${String(i + 1).padStart(2)}. [${t.status.padEnd(10)}] ${t.title}`)
  );

  const byStatus = tasksData.reduce((acc, t) => {
    const s = t.status ?? 'PENDIENTE';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Resumen por estado:');
  Object.entries(byStatus).forEach(([s, n]) => console.log(`   ${s.padEnd(12)}: ${n}`));

  const withNpl = tasksData.filter((t) => t.nplId).length;
  console.log(`\n🔗 Con NPL vinculado : ${withNpl}`);
  console.log(`   Sin NPL            : ${tasksData.length - withNpl}`);

  process.exit(0);
}

seedTasks().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
