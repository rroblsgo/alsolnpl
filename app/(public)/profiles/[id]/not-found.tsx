import Heading from '@/src/shared/components/typography/Heading';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-10 text-center">
      <Heading level={2} className="text-red-500">
        Perfil no encontrado
      </Heading>
      <Link href="/" className="text-2xl">
        Tal vez quieras ir al Inicio
      </Link>
    </div>
  );
}
