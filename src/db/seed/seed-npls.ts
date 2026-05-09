/**
 * Seed de NPLs y deudores adicionales
 *
 * Uso:
 *   npx tsx ./src/db/seed/seed-npls.ts
 *
 * IMPORTANTE antes de ejecutar:
 *   1. Edita src/db/seed/data/npls.ts y reemplaza REPLACE_WITH_YOUR_USER_ID
 *      por el id real de tu usuario (UUID de la tabla users/auth).
 *   2. Asegúrate de haber aplicado la migración con:
 *         npx drizzle-kit generate
 *         npx drizzle-kit migrate
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { npl, nplDeudores } from '../schema';
import { npls } from './data/npls';
import { nplDeudores as deudoresData } from './data/nplDeudores';
import 'dotenv/config';

async function seedNpls() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log('⏳ Insertando NPLs...');

  // Insertar los 10 NPLs y recuperar los ids asignados
  const insertedNpls = await db.insert(npl).values(npls).returning({ id: npl.id });

  console.log(`✅ ${insertedNpls.length} NPLs insertados.`);

  // Reasignar nplId en los deudores adicionales al id real insertado
  // Los deudores del array usan índice 1-based (nplId: 7 → el 7º npl insertado)
  const idMap = insertedNpls.reduce<Record<number, number>>((acc, row, index) => {
    acc[index + 1] = row.id; // posición 1-based → id real de BD
    return acc;
  }, {});

  const deudoresConIds = deudoresData.map((d) => ({
    ...d,
    nplId: idMap[d.nplId] ?? d.nplId,
  }));

  console.log('⏳ Insertando deudores adicionales...');
  const insertedDeudores = await db.insert(nplDeudores).values(deudoresConIds).returning();
  console.log(`✅ ${insertedDeudores.length} deudores adicionales insertados.`);

  console.log('\n🎉 Seed de NPLs completado.');
  console.log('   NPLs públicos (visibles en /npl):',
    npls.filter((n) => n.esPublico).length
  );
  console.log('   NPLs privados (solo dashboard):',
    npls.filter((n) => !n.esPublico).length
  );
  process.exit(0);
}

seedNpls().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
