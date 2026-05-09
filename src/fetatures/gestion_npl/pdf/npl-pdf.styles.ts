import { StyleSheet } from '@react-pdf/renderer';

export const COLORS = {
  primary:     '#1a2e4a',
  accent:      '#2d6a4f',
  accentRed:   '#c0392b',
  accentBlue:  '#2563eb',
  orange:      '#ea580c',
  bgLight:     '#f8fafc',
  bgHeader:    '#1a2e4a',
  bgKpi:       '#0f1f33',
  border:      '#cbd5e1',
  borderLight: '#e2e8f0',
  white:       '#ffffff',
  text:        '#1e293b',
  textMuted:   '#64748b',
  textLight:   '#94a3b8',
  success:     '#16a34a',
  danger:      '#dc2626',
  muted:       '#94a3b8',
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingTop: 0,
    paddingBottom: 44,
    paddingHorizontal: 0,
  },

  // ─── Cabecera ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.bgHeader,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerBrand: {
    color: COLORS.white,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  headerSubbrand: {
    color: COLORS.textLight,
    fontSize: 7,
    letterSpacing: 2,
    marginTop: 2,
  },
  headerConfidential: {
    backgroundColor: COLORS.accentRed,
    color: COLORS.white,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    letterSpacing: 1,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#2d4a6e',
    marginBottom: 16,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  headerAddress: {
    color: COLORS.textLight,
    fontSize: 9,
    marginBottom: 0,
  },

  // ─── Barra KPIs ────────────────────────────────────────────────────────────
  kpiBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgKpi,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  kpiItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#2d4a6e',
    paddingRight: 16,
    paddingLeft: 8,
  },
  kpiItemFirst: { paddingLeft: 0 },
  kpiItemLast:  { borderRightWidth: 0 },
  kpiLabel: {
    color: COLORS.textLight,
    fontSize: 6,
    letterSpacing: 1,
    marginBottom: 3,
  },
  kpiValue: {
    color: COLORS.accent,
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  kpiValueWhite: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },

  // ─── Imagen ────────────────────────────────────────────────────────────────
  mainImage: {
    width: '100%',
    height: 190,
    objectFit: 'cover',
  },

  // ─── Contenido ─────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },

  // ─── Cabecera de sección — SIN EMOJIS ─────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 14,
    marginBottom: 0,
  },
  sectionMarker: {
    // Cuadradito de color a la izquierda del título — reemplaza el emoji
    width: 4,
    height: 12,
    backgroundColor: COLORS.accent,
    marginRight: 8,
    borderRadius: 1,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
  },

  // ─── Tabla de datos ────────────────────────────────────────────────────────
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowLast:    { borderBottomWidth: 0 },
  tableRowAlt:     { backgroundColor: COLORS.bgLight },
  tableCell: {
    flex: 1,
    padding: 7,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  tableCellLast:   { borderRightWidth: 0 },
  tableCellLabel: {
    color: COLORS.textLight,
    fontSize: 6,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  tableCellValue: {
    color: COLORS.text,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableCellValueGreen: {
    color: COLORS.accent,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  tableCellValueMuted: {
    color: COLORS.textMuted,
    fontSize: 8,
  },

  // ─── Escenarios de rentabilidad ────────────────────────────────────────────
  scenariosGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  scenarioCard: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  scenarioCardLast: { borderRightWidth: 0 },
  scenarioCardHighlight: { backgroundColor: '#f0fdf4' },
  scenarioBadge: {
    // Sustituye el emoji ⭐ / ⚡ — rectángulo de color
    width: 20,
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginBottom: 6,
  },
  scenarioBadgeAlt: {
    backgroundColor: COLORS.orange,
  },
  scenarioTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  scenarioLabel:  { fontSize: 6.5, color: COLORS.textMuted },
  scenarioValue:  { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: COLORS.text },
  scenarioRoi: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
    marginTop: 4,
  },
  scenarioRoiAnual: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 1,
    marginBottom: 2,
  },

  // ─── Actuaciones / hitos ───────────────────────────────────────────────────
  hitosList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  hitoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  hitoRowLast:   { borderBottomWidth: 0 },
  hitoBullet:    { width: 14, fontSize: 8, color: COLORS.textMuted },
  hitoText:      { flex: 1, fontSize: 8, color: COLORS.text, lineHeight: 1.4 },

  // ─── Bloque de HTML rico ───────────────────────────────────────────────────
  richTextContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    padding: 10,
  },

  // ─── Deudores ──────────────────────────────────────────────────────────────
  deudorCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
  },
  deudorBadge: {
    backgroundColor: COLORS.orange,
    color: COLORS.white,
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    marginLeft: 6,
  },

  // ─── Pie de página ─────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft:       { color: COLORS.textLight, fontSize: 6.5 },
  footerCenter: {
    color: '#4a6080',
    fontSize: 6,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  footerRight: { color: COLORS.textLight, fontSize: 6.5 },

  // ─── Utilidades ────────────────────────────────────────────────────────────
  spacer:      { height: 10 },
  smallSpacer: { height: 5 },
  row:         { flexDirection: 'row' },
});
