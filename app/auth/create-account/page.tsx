/**
 * REGISTRO DE USUARIOS — DESACTIVADO
 *
 * El registro de nuevos usuarios está deshabilitado.
 * Los usuarios son creados directamente por el administrador.
 *
 * Para reactivar el registro público:
 *   1. Elimina el redirect de abajo
 *   2. Descomenta el bloque JSX que contiene <RegisterForm />
 *
 */

// import RegisterForm from '@/src/fetatures/auth/components/RegisterForm';
// import { generatePageTitle } from '@/utils/metadata';
// import { Metadata } from 'next';
// import Link from 'next/link';

// export const metadata: Metadata = {
//   title: generatePageTitle('Crear cuenta'),
// };

// export default function RegisterPage() {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-white/10 dark:bg-gray-900">
//       <div className="mb-8 text-center">
//         <h1 className="text-xl font-bold text-gray-900 dark:text-white">
//           Crear cuenta
//         </h1>
//         <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
//           Completa los datos para solicitar acceso
//         </p>
//       </div>
//       <RegisterForm />
//       <div className="mt-6 text-center">
//         <Link
//           href="/auth/login"
//           className="text-sm text-blue-700 hover:text-blue-800 dark:text-blue-400 transition-colors"
//         >
//           ¿Ya tienes cuenta? Accede aquí
//         </Link>
//       </div>
//     </div>
//   );
// }

import { redirect } from 'next/navigation';

export default function RegisterPage() {
  redirect('/auth/login');
}
