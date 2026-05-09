/**
 * Seed de 10 NPLs adicionales (operaciones 11-20)
 *
 * Uso:
 *   npx tsx ./src/db/seed/seed-npls2.ts
 *
 * IMPORTANTE antes de ejecutar:
 *   1. Edita src/db/seed/data/npls2.ts y asegúrate de que CREATOR_ID
 *      coincide con el id real de tu usuario en la base de datos.
 *   2. Este script solo AÑADE registros — no elimina los existentes.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { npl } from '../schema';
import { npls2 } from './data/npls2';
import 'dotenv/config';

async function seedNpls2() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log(`⏳ Insertando ${npls2.length} NPLs adicionales (operaciones 11-20)...`);

  const inserted = await db
    .insert(npl)
    .values(npls2)
    .returning({ id: npl.id, titulo: npl.tituloOperacion });

  console.log(`✅ ${inserted.length} NPLs insertados:`);
  inserted.forEach((n, i) => console.log(`   ${i + 11}. ${n.titulo} (id: ${n.id})`));

  console.log('\n📊 Resumen:');
  console.log('   Públicos: ', npls2.filter((n) => n.esPublico).length);
  console.log('   Privados: ', npls2.filter((n) => !n.esPublico).length);
  console.log('   ACTIVO:   ', npls2.filter((n) => n.estado === 'ACTIVO').length);
  console.log('   RESERVADO:', npls2.filter((n) => n.estado === 'RESERVADO').length);

  console.log('\n🎉 Seed de NPLs adicionales completado.');
  process.exit(0);
}

seedNpls2().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
