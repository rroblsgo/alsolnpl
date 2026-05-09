/**
 * Seed de 10 clientes adicionales (clientes 11-20)
 *
 * Uso:
 *   npx tsx ./src/db/seed/seed-clientes2.ts
 *
 * IMPORTANTE antes de ejecutar:
 *   1. Edita src/db/seed/data/clientesData2.ts y asegúrate de que CREATOR_ID
 *      coincide con el id real de tu usuario en la base de datos.
 *   2. Este script solo AÑADE registros — no elimina los existentes.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { clientes } from '../schema';
import { clientesData2 } from './data/clientesData2';
import 'dotenv/config';

async function seedClientes2() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log(`⏳ Insertando ${clientesData2.length} clientes adicionales...`);

  const inserted = await db
    .insert(clientes)
    .values(clientesData2)
    .returning({ id: clientes.id, nombre: clientes.nombre });

  console.log(`✅ ${inserted.length} clientes insertados:`);
  inserted.forEach((c, i) => console.log(`   ${i + 11}. ${c.nombre} (id: ${c.id})`));

  console.log('\n📊 Resumen:');
  console.log('   Activos:    ', clientesData2.filter((c) => c.estado === 'ACTIVO').length);
  console.log('   Prospectos: ', clientesData2.filter((c) => c.estado === 'PROSPECTO').length);
  console.log('   Con RGPD:   ', clientesData2.filter((c) => c.consentimientoRgpd).length);
  console.log('\n   Perfiles:');
  ['PARTICULAR', 'FAMILY_OFFICE', 'ASESOR_PROFESIONAL', 'INMOBILIARIA'].forEach((p) => {
    const count = clientesData2.filter((c) => c.perfilInversor === p).length;
    if (count) console.log(`     ${p}: ${count}`);
  });

  console.log('\n🎉 Seed de clientes adicionales completado.');
  process.exit(0);
}

seedClientes2().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
