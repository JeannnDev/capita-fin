import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency } from "./format"
import { format } from "date-fns"

interface TransactionData {
  date: string
  description: string
  category: string
  type: "income" | "expense"
  amount: number
}

interface ExportData {
  userName: string
  period: string
  transactions: TransactionData[]
  summary: {
    income: number
    expenses: number
    balance: number
  }
}

export const exportToPDF = ({ userName, period, transactions, summary }: ExportData) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Paleta Premium Purple
  const C = {
    deep:    [76,  29,  149] as [number, number, number],
    mid:     [109, 40,  217] as [number, number, number],
    primary: [139, 92,  246] as [number, number, number],
    soft:    [167, 139, 250] as [number, number, number],
    white:   [255, 255, 255] as [number, number, number],
    dark:    [15,  23,  42]  as [number, number, number],
    gray:    [100, 116, 139] as [number, number, number],
    muted:   [148, 163, 184] as [number, number, number],
    green:   [22,  163, 74]  as [number, number, number],
    red:     [220, 38,  38]  as [number, number, number],
  }

  // ─────────────────────────────────────────────────────────────
  // 1. CABEÇALHO COM ONDAS
  // ─────────────────────────────────────────────────────────────

  // Base (roxo primário)
  doc.setFillColor(...C.primary)
  doc.rect(0, 0, pageWidth, 55, "F")

  // Onda decorativa grande esquerda (roxo profundo)
  doc.setFillColor(...C.deep)
  doc.roundedRect(-8, 30, pageWidth * 0.58, 45, 16, 16, "F")

  // Onda direita (roxo médio)
  doc.setFillColor(...C.mid)
  doc.roundedRect(pageWidth * 0.38, 18, pageWidth * 0.72, 52, 20, 20, "F")

  // Toque suave no canto superior direito
  doc.setFillColor(...C.soft)
  doc.roundedRect(pageWidth * 0.68, -8, pageWidth * 0.45, 32, 12, 12, "F")

  // Faixa sólida no topo para limpar borda
  doc.setFillColor(...C.deep)
  doc.rect(0, 0, pageWidth, 10, "F")

  // ─────────────────────────────────────────────────────────────
  // 2. TEXTO DO CABEÇALHO — Com sombra/contorno para legibilidade
  // ─────────────────────────────────────────────────────────────

  // Texto "sombra" deslocado levemente (efeito de legibilidade)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(30)
  doc.setTextColor(30, 0, 80) // Sombra escura
  doc.text("CapitaFin", 19.5, 31.5)

  // Texto principal branco
  doc.setTextColor(...C.white)
  doc.text("CapitaFin", 19, 31)

  // Subtítulo com boa visibilidade
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  // Fundo escuro mini-badge para o subtítulo
  doc.setFillColor(30, 0, 80)
  doc.setGState(doc.GState({ opacity: 0.35 }))
  doc.roundedRect(18, 34, 74, 7, 2, 2, "F")
  doc.setGState(doc.GState({ opacity: 1 }))

  doc.setTextColor(230, 220, 255) // Lavanda clara
  doc.text("INTELIGÊNCIA FINANCEIRA PREMIUM", 19, 39)

  // Infos do documento à direita
  doc.setFontSize(7.5)
  doc.setTextColor(230, 220, 255)
  doc.text(`EMITIDO: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - 18, 27, { align: "right" })
  doc.text(`PERÍODO: ${period.toUpperCase()}`, pageWidth - 18, 34, { align: "right" })

  // ─────────────────────────────────────────────────────────────
  // 3. CARD DO CLIENTE
  // ─────────────────────────────────────────────────────────────
  doc.setFillColor(...C.white)
  doc.setDrawColor(220, 215, 245)
  doc.roundedRect(18, 63, pageWidth - 36, 22, 4, 4, "DF")

  doc.setTextColor(...C.muted)
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.text("CLIENTE / TITULAR", 28, 71)

  doc.setTextColor(...C.dark)
  doc.setFontSize(12)
  doc.text(userName, 28, 79)

  // ─────────────────────────────────────────────────────────────
  // 4. CARDS DE RESUMO — Design limpo e profissional
  // ─────────────────────────────────────────────────────────────
  const cardW = (pageWidth - 48) / 3
  const cardY = 93

  const drawCard = (
    x: number,
    label: string,
    value: number,
    color: [number, number, number],
    sign: string
  ) => {
    // Fundo branco com borda colorida sutil à esquerda
    doc.setFillColor(...C.white)
    doc.setDrawColor(225, 220, 248)
    doc.roundedRect(x, cardY, cardW, 28, 4, 4, "DF")

    // Linha colorida à esquerda (indicador elegante)
    doc.setFillColor(...color)
    doc.rect(x, cardY + 4, 2.5, 20, "F")

    // Label
    doc.setFontSize(6.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...C.muted)
    doc.text(label, x + 9, cardY + 10)

    // Valor
    doc.setFontSize(13)
    doc.setTextColor(...color)
    doc.text(`${sign}${formatCurrency(value)}`, x + 9, cardY + 22)
  }

  drawCard(18, "ENTRADAS TOTAL", summary.income, C.green, "+")
  drawCard(22 + cardW, "SAÍDAS TOTAL", summary.expenses, C.red, "-")
  drawCard(26 + cardW * 2, "RESULTADO", summary.balance, C.primary, summary.balance >= 0 ? "+" : "")

  // ─────────────────────────────────────────────────────────────
  // 5. TABELA — Com simulação de cantos arredondados
  // ─────────────────────────────────────────────────────────────
  const tableStartY = 136
  const tableTitle = "Detalhamento de Transações"

  doc.setTextColor(...C.dark)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(tableTitle, 18, tableStartY)

  const tableData = transactions.map(t => [
    format(new Date(t.date), "dd/MM/yyyy"),
    t.description.toUpperCase(),
    t.category.toUpperCase(),
    t.type === "income" ? "ENTRADA" : "SAÍDA",
    {
      content: formatCurrency(t.amount),
      styles: {
        textColor: (t.type === "income" ? C.green : C.red) as [number, number, number],
      }
    }
  ])

  // Calcula a altura da tabela para desenhar o container arredondado depois
  const rowHeight = 9
  const headHeight = 10
  const estimatedTableHeight = headHeight + tableData.length * rowHeight + 4
  const tableBodyY = tableStartY + 5

  // Container arredondado da tabela (fundo branco com borda)
  doc.setFillColor(...C.white)
  doc.setDrawColor(220, 215, 245)
  doc.roundedRect(18, tableBodyY, pageWidth - 36, estimatedTableHeight, 5, 5, "DF")

  autoTable(doc, {
    startY: tableBodyY,
    head: [["DATA", "DESCRIÇÃO", "CATEGORIA", "TIPO", "VALOR"]],
    body: tableData,
    theme: "plain",
    headStyles: {
      fillColor: C.deep,
      textColor: C.white,
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
    },
    alternateRowStyles: {
      fillColor: [248, 246, 255],
    },
    columnStyles: {
      4: { halign: "right", fontStyle: "bold" }
    },
    // Arredonda manualmente o cabeçalho
    didDrawCell: (data) => {
      if (data.section === "body") {
        doc.setDrawColor(238, 235, 250)
        doc.line(
          data.cell.x,
          data.cell.y + data.cell.height,
          data.cell.x + data.cell.width,
          data.cell.y + data.cell.height
        )
      }
    },
    margin: { left: 18, right: 18 }
  })

  // ─────────────────────────────────────────────────────────────
  // 6. RODAPÉ
  // ─────────────────────────────────────────────────────────────
  const pageCount = (doc as unknown as { internal: { pages: string[] } }).internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(220, 215, 245)
    doc.line(18, pageHeight - 14, pageWidth - 18, pageHeight - 14)
    doc.setFontSize(6.5)
    doc.setTextColor(...C.gray)
    doc.text("CAPITAFIN — INTELIGÊNCIA FINANCEIRA PREMIUM", 18, pageHeight - 9)
    doc.text(`PÁGINA ${i} DE ${pageCount}`, pageWidth - 18, pageHeight - 9, { align: "right" })
  }

  doc.save(`EXTRATO_CAPITAFIN_${period.replace(/\//g, "-")}.pdf`)
}
