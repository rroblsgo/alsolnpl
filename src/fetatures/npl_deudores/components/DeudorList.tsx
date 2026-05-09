import Link from 'next/link';
import { deudorService } from '../services/DeudorService';
import DeudorItem from './DeudorItem';
import DeleteDeudorDialog from './DeleteDeudorDialog';

type Props = {
  nplId: number;
};

export default async function DeudorList({ nplId }: Props) {
  const deudores = await deudorService.listByNpl(nplId);

  return (
    <>
      <DeleteDeudorDialog nplId={nplId} />

      {deudores.length > 0 ? (
        <ul
          role="list"
          className="mt-6 divide-y divide-gray-100 rounded-xl bg-white p-6 shadow-sm"
        >
          {deudores.map((deudor) => (
            <DeudorItem key={deudor.id} deudor={deudor} nplId={nplId} />
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            No hay deudores registrados para este NPL.
          </p>
          <Link
            href={`/dashboard/npl/${nplId}/deudores/create`}
            className="mt-3 inline-block font-semibold text-orange-500 hover:underline"
          >
            Añadir el primer deudor
          </Link>
        </div>
      )}
    </>
  );
}
