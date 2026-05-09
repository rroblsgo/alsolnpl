import { Extension } from '@tiptap/core';

export const TableCellTextAlign = Extension.create({
  name: 'tableCellTextAlign',

  addGlobalAttributes() {
    return [
      {
        types: ['tableCell', 'tableHeader'],
        attributes: {
          textAlign: {
            default: 'left',
            parseHTML: (element) => element.style.textAlign || 'left',
            renderHTML: (attributes) => {
              if (!attributes.textAlign || attributes.textAlign === 'left') {
                return {};
              }

              return {
                style: `text-align: ${attributes.textAlign}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setCurrentTableTextAlign:
        (alignment: 'left' | 'center' | 'right') =>
        ({ editor, chain }) => {
          if (editor.isActive('tableHeader')) {
            return chain()
              .focus()
              .updateAttributes('tableHeader', { textAlign: alignment })
              .run();
          }

          return chain()
            .focus()
            .updateAttributes('tableCell', { textAlign: alignment })
            .run();
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCellTextAlign: {
      setCurrentTableTextAlign: (
        alignment: 'left' | 'center' | 'right'
      ) => ReturnType;
    };
  }
}
