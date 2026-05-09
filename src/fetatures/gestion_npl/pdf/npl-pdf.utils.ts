// @ts-nocheck
/**
 * npl-pdf.utils.ts v7
 *
 * Fix: la tabla está DENTRO de un <li> (TipTap permite anidar tablas en listas).
 * parseList ahora procesa el interior de cada <li> recursivamente:
 * extrae primero el texto del <p> inicial como el item de lista,
 * y luego procesa cualquier tabla anidada dentro del mismo <li>.
 */

import React from 'react';
import { Text, View, Link } from '@react-pdf/renderer';
import { COLORS } from './npl-pdf.styles';

// ─── Formateo ─────────────────────────────────────────────────────────────────

export const fmtEuros = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);
};
export const fmtEurosShort = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (isNaN(n)) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
};
export const fmtPct = (v: number | null | undefined): string => v == null ? '—' : `${v.toFixed(2)} %`;
export const fmtM2  = (v: string | null | undefined): string => { if (!v) return '—'; const n = parseFloat(v); return isNaN(n) ? '—' : `${n.toLocaleString('es-ES')} m²`; };
export const fmtVal = (v: string | number | null | undefined): string => (v === null || v === undefined || v === '') ? '—' : String(v);

// ─── Utilidades ───────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
          .replace(/&nbsp;/g,' ').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'");
}
function getCssProp(style: string, prop: string): string | null {
  const m = new RegExp(`${prop}\\s*:\\s*([^;]+)`,'i').exec(style);
  return m ? m[1].trim() : null;
}
function getAttr(tag: string, attr: string): string {
  const m = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`,'i').exec(tag);
  return m ? m[1] : '';
}
export function htmlToText(html: string | null | undefined): string {
  if (!html) return '';
  return decodeEntities(
    html.replace(/<\/p>/gi,'\n').replace(/<\/h[1-6]>/gi,'\n\n').replace(/<br\s*\/?>/gi,'\n')
        .replace(/<li[^>]*>/gi,'• ').replace(/<\/li>/gi,'\n').replace(/<[^>]+>/g,'')
        .replace(/\n{3,}/g,'\n\n').trim()
  );
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type InlineStyle = { bold?:boolean; italic?:boolean; underline?:boolean; color?:string; background?:string; link?:string };
type InlineNode  = { text:string; style:InlineStyle };
type BlockNode   =
  | { kind:'paragraph'; align:string; inlines:InlineNode[] }
  | { kind:'heading';   level:2|3; align:string; inlines:InlineNode[] }
  | { kind:'listitem';  ordered:boolean; index:number; inlines:InlineNode[] }
  | { kind:'table';     rows:TableRow[] };
type TableRow  = { isHeader:boolean; cells:TableCell[] };
type TableCell = { inlines:InlineNode[]; align:string; colspan:number };

// ─── findBlockEnd: cierre correcto con conteo de niveles ──────────────────────

function findBlockEnd(html: string, openStart: number, tagName: string): number {
  const lo       = html.toLowerCase();
  const openStr  = `<${tagName}`;
  const closeStr = `</${tagName}>`;
  let depth = 0;
  let pos   = openStart;

  while (pos < html.length) {
    const nextOpen  = lo.indexOf(openStr,  pos);
    const nextClose = lo.indexOf(closeStr, pos);
    if (nextClose === -1) return html.length;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + openStr.length;
    } else {
      depth--;
      if (depth === 0) return nextClose + closeStr.length;
      pos = nextClose + closeStr.length;
    }
  }
  return html.length;
}

// ─── splitSegments: divide en bloques preservando orden ───────────────────────

type Segment = { type:'html'|'table'|'list'; content:string; ordered?:boolean };

function splitSegments(html: string): Segment[] {
  const segs: Segment[] = [];
  let pos = 0;

  while (pos < html.length) {
    const lo = html.toLowerCase();
    const tIdx  = lo.indexOf('<table', pos);
    const ulIdx = lo.indexOf('<ul',    pos);
    const olIdx = lo.indexOf('<ol',    pos);

    const candidates = [
      tIdx  >= 0 ? { idx:tIdx,  tag:'table', ordered:false } : null,
      ulIdx >= 0 ? { idx:ulIdx, tag:'ul',    ordered:false } : null,
      olIdx >= 0 ? { idx:olIdx, tag:'ol',    ordered:true  } : null,
    ].filter(Boolean) as Array<{idx:number; tag:string; ordered:boolean}>;

    if (!candidates.length) {
      const rest = html.slice(pos);
      if (rest.trim()) segs.push({ type:'html', content:rest });
      break;
    }

    candidates.sort((a,b) => a.idx - b.idx);
    const next = candidates[0];

    if (next.idx > pos) {
      const before = html.slice(pos, next.idx);
      if (before.trim()) segs.push({ type:'html', content:before });
    }

    const end     = findBlockEnd(html, next.idx, next.tag);
    const content = html.slice(next.idx, end);
    segs.push(next.tag === 'table'
      ? { type:'table', content }
      : { type:'list',  content, ordered:next.ordered }
    );
    pos = end;
  }
  return segs;
}

// ─── Parser de inlines ────────────────────────────────────────────────────────

function parseInlines(html: string): InlineNode[] {
  // Strip etiquetas estructurales que no son inlines
  const clean = html
    .replace(/<\/?p[^>]*>/gi, ' ')
    .replace(/<table[\s\S]*?<\/table>/gi, '') // eliminar tablas del inline (se procesan aparte)
    .trim();

  const nodes: InlineNode[] = [];
  const tokenRe = /(<[^>]+>|[^<]+)/g;
  let m: RegExpExecArray | null;
  const stack: InlineStyle[] = [{}];
  const current = (): InlineStyle => stack.reduce((a,s)=>({...a,...s}),{});

  while ((m = tokenRe.exec(clean)) !== null) {
    const token = m[1];
    if (!token.startsWith('<')) {
      const text = decodeEntities(token);
      if (text) nodes.push({ text, style:current() });
      continue;
    }
    const tagL = token.toLowerCase();
    if (tagL.startsWith('</')) { if (stack.length > 1) stack.pop(); continue; }
    if (tagL.startsWith('<br') || tagL.endsWith('/>')) { nodes.push({ text:'\n', style:current() }); continue; }

    const styleAttr = getAttr(token,'style');
    const color = getCssProp(styleAttr,'color');
    const bg    = getCssProp(styleAttr,'background-color');
    const add: InlineStyle = {};

    if (/^<strong|^<b[^a-z]/i.test(token)) add.bold      = true;
    if (/^<em|^<i[^a-z]/i.test(token))     add.italic    = true;
    if (/^<u[^a-z]/i.test(token))          add.underline = true;
    if (/^<a /i.test(token)) { add.color=COLORS.accentBlue; add.underline=true; add.link=getAttr(token,'href'); }
    if (/^<span|^<mark/i.test(token)) { if (color) add.color=color; if (bg) add.background=bg; }

    stack.push({ ...current(), ...add });
  }
  return nodes.filter(n => n.text !== '');
}

// ─── Parser de tablas ─────────────────────────────────────────────────────────

function parseTable(html: string): BlockNode & { kind:'table' } {
  const rows: TableRow[] = [];
  const rowRe = /<tr([^>]*)>([\s\S]*?)<\/tr>/gi;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(html)) !== null) {
    const cells: TableCell[] = [];
    // TipTap usa <th> tanto en thead como en tbody para la fila de cabecera
    const isHeaderRow = /<th/i.test(rm[2]);
    const cellRe = /<t[dh]([^>]*?)>([\s\S]*?)<\/t[dh]>/gi;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[2])) !== null) {
      const styleAttr = getAttr(cm[1],'style');
      // TipTap usa colwidth en lugar de colspan para anchos
      const colwidthM = /colwidth\s*=\s*["']?(\d+)["']?/i.exec(cm[1]);
      const colspanM  = /colspan\s*=\s*["']?(\d+)["']?/i.exec(cm[1]);
      // Usar colspan real si > 1, sino 1
      const colspan   = colspanM && parseInt(colspanM[1]) > 1 ? parseInt(colspanM[1]) : 1;
      const align     = getCssProp(styleAttr,'text-align') ?? 'left';
      cells.push({ inlines: parseInlines(cm[2]), align, colspan });
    }
    if (cells.length) rows.push({ isHeader: isHeaderRow, cells });
  }
  return { kind:'table', rows };
}

// ─── Parser de listas — PROCESA CONTENIDO DE <li> RECURSIVAMENTE ─────────────

function parseList(html: string, ordered: boolean): BlockNode[] {
  const blocks: BlockNode[] = [];
  let pos = 0;
  let idx = 1;
  const lo = html.toLowerCase();

  while (pos < html.length) {
    const liStart = lo.indexOf('<li', pos);
    if (liStart === -1) break;

    const liEnd = findBlockEnd(html, liStart, 'li');
    const liHtml = html.slice(liStart, liEnd);

    // Extraer el interior del <li>
    const innerM = /<li[^>]*>([\s\S]*?)<\/li>/i.exec(liHtml);
    if (!innerM) { pos = liEnd; continue; }
    const liInner = innerM[1];

    // ── Separar: texto del <p> inicial + tabla anidada (si existe) ──────────
    const tableStart = liInner.toLowerCase().indexOf('<table');

    if (tableStart === -1) {
      // Sin tabla — item normal
      const inlines = parseInlines(liInner);
      if (inlines.some(n => n.text.trim())) {
        blocks.push({ kind:'listitem', ordered, index: idx++, inlines });
      }
    } else {
      // Con tabla anidada: primero el texto antes de la tabla como listitem
      const textPart  = liInner.slice(0, tableStart);
      const tableEnd  = findBlockEnd(liInner, tableStart, 'table');
      const tableHtml = liInner.slice(tableStart, tableEnd);

      const inlines = parseInlines(textPart);
      if (inlines.some(n => n.text.trim())) {
        blocks.push({ kind:'listitem', ordered, index: idx++, inlines });
      }

      // Luego la tabla como bloque independiente
      blocks.push(parseTable(tableHtml));
    }

    pos = liEnd;
  }
  return blocks;
}

// ─── Parser de bloques HTML normales ─────────────────────────────────────────

function parseHtmlBlocks(html: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  const blockRe = /<(h2|h3|p)([^>]*?)>([\s\S]*?)<\/\1>/gi;
  let bm: RegExpExecArray | null;
  while ((bm = blockRe.exec(html)) !== null) {
    const tag    = bm[1].toLowerCase();
    const styleA = getAttr(bm[2],'style');
    const align  = getCssProp(styleA,'text-align') ?? 'left';
    const inlines = parseInlines(bm[3]);
    const valid   = inlines.filter(n => n.text.trim());
    if (!valid.length) continue;
    if      (tag==='h2') blocks.push({ kind:'heading',   level:2, align, inlines:valid });
    else if (tag==='h3') blocks.push({ kind:'heading',   level:3, align, inlines:valid });
    else                 blocks.push({ kind:'paragraph',          align, inlines });
  }
  return blocks;
}

// ─── Parser principal ─────────────────────────────────────────────────────────

function parseBlocks(html: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  for (const seg of splitSegments(html)) {
    if      (seg.type==='table') blocks.push(parseTable(seg.content));
    else if (seg.type==='list')  blocks.push(...parseList(seg.content, seg.ordered??false));
    else                         blocks.push(...parseHtmlBlocks(seg.content));
  }
  return blocks;
}

// ─── Renderizador ─────────────────────────────────────────────────────────────

const AM: Record<string,string> = { left:'left', center:'center', right:'right', justify:'justify' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function iS(n: InlineNode, fs=8): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s: Record<string, any> = { fontSize: fs };
  if (n.style.bold)       s.fontFamily      = 'Helvetica-Bold';
  if (n.style.italic)     s.fontStyle       = 'italic';
  if (n.style.underline)  s.textDecoration  = 'underline';
  if (n.style.color)      s.color           = n.style.color;
  if (n.style.background) s.backgroundColor = n.style.background;
  return s;
}
function rI(inlines: InlineNode[], fs=8) {
  return inlines.map((n,i) => {
    const s = iS(n,fs);
    if (n.style.link) return React.createElement(Link,{key:i,src:n.style.link,style:s},n.text);
    return React.createElement(Text,{key:i,style:s},n.text);
  });
}

function renderBlocks(blocks: BlockNode[]): React.ReactElement[] {
  return blocks.map((block,i) => {

    if (block.kind==='paragraph') return React.createElement(
      View,{key:i,style:{marginBottom:3}},
      React.createElement(Text,{style:{fontSize:8,color:COLORS.text,lineHeight:1.5,textAlign:AM[block.align]??'left'}},
        ...rI(block.inlines,8))
    );

    if (block.kind==='heading') {
      const fs = block.level===2 ? 13 : 11;
      return React.createElement(
        View,{key:i,style:{marginTop:6,marginBottom:4}},
        React.createElement(Text,{style:{fontSize:fs,fontFamily:'Helvetica-Bold',color:COLORS.primary,
          textAlign:AM[block.align]??'left',
          borderBottomWidth:block.level===2?1:0,borderBottomColor:COLORS.borderLight,
          paddingBottom:block.level===2?3:0}},
          ...rI(block.inlines,fs))
      );
    }

    if (block.kind==='listitem') return React.createElement(
      View,{key:i,style:{flexDirection:'row',marginBottom:2,paddingLeft:8}},
      React.createElement(Text,{style:{width:14,fontSize:8,color:COLORS.textMuted}}, block.ordered?`${block.index}.`:'\u2022'),
      React.createElement(Text,{style:{flex:1,fontSize:8,color:COLORS.text,lineHeight:1.5}},...rI(block.inlines,8))
    );

    if (block.kind==='table') return React.createElement(
      View,{key:i,style:{borderWidth:1,borderColor:COLORS.border,marginBottom:6,marginTop:4}},
      ...block.rows.map((row,ri) => {
        const isLast = ri===block.rows.length-1;
        const isAlt  = !row.isHeader && ri%2===1;
        return React.createElement(
          View,{key:ri,style:{flexDirection:'row',
            borderBottomWidth:isLast?0:1,borderBottomColor:COLORS.borderLight,
            backgroundColor:row.isHeader?COLORS.primary:isAlt?COLORS.bgLight:COLORS.white}},
          ...row.cells.map((cell,ci)=>{
            const isLastCell = ci===row.cells.length-1;
            return React.createElement(
              View,{key:ci,style:{flex:cell.colspan,padding:6,
                borderRightWidth:isLastCell?0:1,
                borderRightColor:row.isHeader?'#2d4a6e':COLORS.borderLight}},
              React.createElement(Text,{style:{fontSize:7.5,
                fontFamily:row.isHeader?'Helvetica-Bold':'Helvetica',
                color:row.isHeader?COLORS.white:COLORS.text,
                textAlign:AM[cell.align]??'left'}},
                ...cell.inlines.map((n,ni)=>{
                  const s=iS(n,7.5);
                  if(row.isHeader){s.color=COLORS.white;delete s.backgroundColor;}
                  return React.createElement(Text,{key:ni,style:s},n.text);
                }))
            );
          })
        );
      })
    );

    return React.createElement(View,{key:i});
  });
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function renderHtml(html: string | null | undefined): React.ReactElement | null {
  if (!html) return null;
  const blocks = parseBlocks(html);
  if (!blocks.length) return null;
  const elements = renderBlocks(blocks);
  if (!elements.length) return null;
  return React.createElement(View, null, ...elements);
}
