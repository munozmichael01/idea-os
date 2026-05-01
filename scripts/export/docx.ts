import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx'
import type { IdeaFull } from '@/lib/types'
import { AgentType } from '@/lib/types'

const AGENT_LABELS: Record<AgentType, string> = {
  market: 'Viabilidad de mercado',
  competition: 'Análisis competitivo',
  economics: 'Modelo económico',
  gtm: 'Go-to-market',
  founder_fit: 'Fit con el fundador',
}

function scoreBar(score: number): string {
  const filled = Math.round(score)
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + `  ${score}/10`
}

function heading1(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  })
}

function heading2(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
  })
}

function body(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 },
  })
}

function bullet(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}`, size: 22 })],
    spacing: { after: 80 },
    indent: { left: 360 },
  })
}

function scoreRow(label: string, value: number, max = 10) {
  const pct = Math.round((value / max) * 100)
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20 })] })],
        width: { size: 40, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: `${value.toFixed(1)} / ${max}`, size: 20 })] })],
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: `${pct}%`, size: 20 })] })],
        width: { size: 20, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      }),
    ],
  })
}

export async function generateDocx(idea: IdeaFull): Promise<Buffer> {
  const children: (Paragraph | Table)[] = []

  // ── Cover ──────────────────────────────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Business Case', bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: idea.title, bold: true, size: 36 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: new Date().toLocaleDateString('es-ES'), size: 22, color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  )

  // ── Executive Summary ──────────────────────────────────────────────────────
  children.push(heading1('Resumen ejecutivo'))

  if (idea.description) children.push(body(idea.description))

  const compositeScore = idea.compositeScore ?? 0
  const confidenceScore = idea.confidenceScore ?? 0
  const volatilityScore = idea.volatilityScore ?? 0

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        scoreRow('Score compuesto', compositeScore),
        scoreRow('Confianza', confidenceScore * 10),
        scoreRow('Volatilidad (riesgo)', volatilityScore * 10),
      ],
    }),
    new Paragraph({ spacing: { after: 200 } })
  )

  // ── Agent analyses ─────────────────────────────────────────────────────────
  children.push(heading1('Análisis por dimensión'))

  const agentOrder: AgentType[] = ['market', 'competition', 'economics', 'gtm', 'founder_fit']

  for (const agentType of agentOrder) {
    const analysis = idea.analyses
      .filter((a) => a.agentType === agentType)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    if (!analysis) continue

    children.push(
      heading2(`${AGENT_LABELS[agentType]}  —  ${scoreBar(analysis.score)}`),
      body(analysis.headline)
    )

    if (analysis.strengths.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Fortalezas', bold: true, size: 22 })], spacing: { after: 80 } })
      )
      analysis.strengths.forEach((s) => children.push(bullet(s)))
    }

    if (analysis.risks.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: 'Riesgos', bold: true, size: 22 })], spacing: { before: 120, after: 80 } })
      )
      analysis.risks.forEach((r) => children.push(bullet(r)))
    }

    children.push(
      new Paragraph({ children: [new TextRun({ text: 'Recomendación', bold: true, size: 22 })], spacing: { before: 120, after: 80 } }),
      body(analysis.recommendation)
    )
  }

  // ── Critical hypotheses ────────────────────────────────────────────────────
  const criticalHypotheses = idea.hypotheses.filter((h) => h.criticality === 'high')

  if (criticalHypotheses.length > 0) {
    children.push(heading1('Hipótesis críticas'))
    criticalHypotheses.forEach((h) => {
      const statusLabel = { unvalidated: '⚠ Sin validar', confirmed: '✓ Confirmada', invalidated: '✗ Invalidada' }[h.status]
      children.push(bullet(`[${statusLabel}] ${h.description}`))
    })
  }

  // ── Next validation actions ────────────────────────────────────────────────
  const nextActions = idea.analyses
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .reduce<Record<string, string>>((acc, a) => {
      if (!acc[a.agentType]) acc[a.agentType] = a.nextValidationAction
      return acc
    }, {})

  if (Object.keys(nextActions).length > 0) {
    children.push(heading1('Próximas acciones de validación'))
    for (const [agentType, action] of Object.entries(nextActions)) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${AGENT_LABELS[agentType as AgentType]}: `, bold: true, size: 22 }),
            new TextRun({ text: action, size: 22 }),
          ],
          spacing: { after: 120 },
        })
      )
    }
  }

  const doc = new Document({
    sections: [{ children }],
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '1a1a1a' },
        },
      },
    },
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
