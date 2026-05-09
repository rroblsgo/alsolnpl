/**
 * Seed de municipios españoles (INE — 8.124 registros)
 *
 * Uso:
 *   npx tsx ./src/db/seed/seed-municipios.ts
 *
 * Solo necesita ejecutarse UNA VEZ tras aplicar la migración.
 * Inserta en lotes de 500 para no sobrecargar el prepared statement limit de pg.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { municipios } from '../schema/municipios';
import { municipiosData } from './data/municipiosData';
import 'dotenv/config';

const BATCH_SIZE = 500;

async function seedMunicipios() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log(`⏳ Insertando ${municipiosData.length} municipios en lotes de ${BATCH_SIZE}...`);

  let inserted = 0;
  for (let i = 0; i < municipiosData.length; i += BATCH_SIZE) {
    const batch = municipiosData.slice(i, i + BATCH_SIZE);
    await db.insert(municipios).values(batch).onConflictDoNothing();
    inserted += batch.length;
    process.stdout.write(`\r   ${inserted} / ${municipiosData.length}`);
  }

  console.log('\n✅ Municipios insertados correctamente.');
  process.exit(0);
}

seedMunicipios().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
