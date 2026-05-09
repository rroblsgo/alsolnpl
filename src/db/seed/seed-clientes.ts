/**
 * Seed de clientes
 *
 * Uso:
 *   npx tsx ./src/db/seed/seed-clientes.ts
 *
 * IMPORTANTE antes de ejecutar:
 *   1. Edita src/db/seed/data/clientesData.ts y reemplaza
 *      REPLACE_WITH_YOUR_USER_ID por el id real de tu usuario.
 *   2. Asegúrate de haber aplicado la migración:
 *         npx drizzle-kit generate
 *         npx drizzle-kit migrate
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { clientes } from '../schema';
import { clientesData } from './data/clientesData';
import 'dotenv/config';

async function seedClientes() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log(`⏳ Insertando ${clientesData.length} clientes...`);

  const inserted = await db
    .insert(clientes)
    .values(clientesData)
    .returning({ id: clientes.id, nombre: clientes.nombre });

  console.log(`✅ ${inserted.length} clientes insertados:`);
  inserted.forEach((c, i) => console.log(`   ${i + 1}. ${c.nombre} (id: ${c.id})`));

  console.log('\n📊 Resumen:');
  console.log('   Activos:    ', clientesData.filter(c => c.estado === 'ACTIVO').length);
  console.log('   Prospectos: ', clientesData.filter(c => c.estado === 'PROSPECTO').length);
  console.log('   Con RGPD:   ', clientesData.filter(c => c.consentimientoRgpd).length);

  process.exit(0);
}

seedClientes().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
