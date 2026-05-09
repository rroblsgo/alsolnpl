/**
 * RichTextContent
 *
 * Renderiza HTML generado por TipTap aplicando los mismos estilos
 * que el editor (.tiptap definidos en globals.css).
 *
 * Ubicación: src/shared/components/ui/RichTextContent.tsx
 */

import DOMPurify from 'isomorphic-dompurify';

type Props = {
  html: string | null | undefined;
  className?: string;
  emptyText?: string;
};

export default function RichTextContent({
  html,
  className = '',
  emptyText = '',
}: Props) {
  if (!html || html === '<p></p>') {
    return emptyText ? (
      <p className={`text-gray-400 italic ${className}`}>{emptyText}</p>
    ) : null;
  }

  const sanitized = DOMPurify.sanitize(html);

  // Añadir https:// a links que no tienen protocolo (ej. www.ejemplo.com)
  // Excluye: https://, http://, mailto:, tel:, # (anclas internas)
  const withFixedLinks = sanitized.replace(
    /href="(?!https?:\/\/|mailto:|tel:|#)([^"]+)"/gi,
    'href="https://$1"'
  );

  return (
    <div
      className={`tiptap ${className}`}
      dangerouslySetInnerHTML={{ __html: withFixedLinks }}
    />
  );
}
