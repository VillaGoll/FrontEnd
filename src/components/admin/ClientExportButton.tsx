import { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import {
    FileDownload,
    TableChart,
    PictureAsPdf,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import statsService from '../../services/stats.service';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ── Paleta de colores compartida ──
const COLORS = {
    primary: '1976D2',         // Azul corporativo
    primaryDark: '1565C0',     // Azul oscuro
    primaryLight: 'E3F2FD',    // Azul muy claro (fondo)
    accent: '2196F3',          // Azul acento
    green: '4CAF50',           // Verde
    greenDark: '2E7D32',       // Verde oscuro
    greenLight: 'E8F5E9',      // Verde claro
    orange: 'FF9800',          // Naranja
    orangeLight: 'FFF3E0',     // Naranja claro
    white: 'FFFFFF',
    textDark: '37414F',        // Texto oscuro
    textMuted: 'B4B4B4',      // Texto apagado
    rowAlt: 'F5F7FA',         // Fila alternada
    border: 'DCDCDC',         // Bordes
    headerText: 'FFFFFF',     // Texto de encabezado
};

const ClientExportButton = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchData = async () => {
        const data = await statsService.getClientAnnualReport();
        return data;
    };

    const getFormattedDate = () => {
        return new Date().toLocaleDateString('es-GT', {
            timeZone: 'America/Guatemala',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // ──────────────────────────────────────────────
    // EXCEL GENERATION (ExcelJS — con estilos)
    // ──────────────────────────────────────────────
    const handleExportExcel = async () => {
        handleClose();
        setLoading(true);
        try {
            const { year, clients } = await fetchData();
            const totalClients = clients.length;
            const totalGames = clients.reduce((sum, c) => sum + c.total, 0);

            const wb = new ExcelJS.Workbook();
            wb.creator = 'CanchaSystem - VillaGol';
            wb.created = new Date();

            const ws = wb.addWorksheet('Reporte Anual', {
                properties: { defaultColWidth: 10 },
                pageSetup: { orientation: 'landscape', fitToPage: true, paperSize: 9 },
            });

            // ── Columnas ──
            const columnCount = 16; // #, Nombre, Teléfono, 12 meses, Total
            ws.columns = [
                { key: 'num', width: 6 },
                { key: 'name', width: 32 },
                { key: 'phone', width: 16 },
                ...MONTH_NAMES.map(m => ({ key: m.toLowerCase(), width: 8 })),
                { key: 'total', width: 10 },
            ];

            // ── Row 1: Título principal ──
            ws.mergeCells(1, 1, 1, columnCount);
            const titleCell = ws.getCell('A1');
            titleCell.value = '⚽  VillaGol — Reporte Anual de Clientes';
            titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: COLORS.white } };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            ws.getRow(1).height = 38;

            // ── Row 2: Subtítulo con fecha ──
            ws.mergeCells(2, 1, 2, columnCount);
            const subtitleCell = ws.getCell('A2');
            subtitleCell.value = `Año ${year}  |  Generado: ${getFormattedDate()}`;
            subtitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: COLORS.white } };
            subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
            subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            ws.getRow(2).height = 24;

            // ── Row 3: Tarjetas de resumen ──
            ws.getRow(3).height = 28;
            // Card 1: Total Clientes
            ws.mergeCells(3, 1, 3, 5);
            const card1 = ws.getCell('A3');
            card1.value = `📋  Total Clientes: ${totalClients}`;
            card1.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.primary } };
            card1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
            card1.alignment = { horizontal: 'center', vertical: 'middle' };
            card1.border = {
                top: { style: 'thin', color: { argb: COLORS.primary } },
                bottom: { style: 'thin', color: { argb: COLORS.primary } },
                left: { style: 'thin', color: { argb: COLORS.primary } },
                right: { style: 'thin', color: { argb: COLORS.primary } },
            };

            // Card 2: Total Juegos
            ws.mergeCells(3, 6, 3, 11);
            const card2 = ws.getCell('F3');
            card2.value = `🏆  Total Juegos en el Año: ${totalGames}`;
            card2.font = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.greenDark } };
            card2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
            card2.alignment = { horizontal: 'center', vertical: 'middle' };
            card2.border = {
                top: { style: 'thin', color: { argb: COLORS.green } },
                bottom: { style: 'thin', color: { argb: COLORS.green } },
                left: { style: 'thin', color: { argb: COLORS.green } },
                right: { style: 'thin', color: { argb: COLORS.green } },
            };

            // Rellenar celdas restantes de row 3
            for (let c = 12; c <= columnCount; c++) {
                const cell = ws.getCell(3, c);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.white } };
            }

            // ── Row 4: Vacía (separador) ──
            ws.getRow(4).height = 8;

            // ── Row 5: Encabezados de tabla ──
            const headerLabels = ['#', 'Nombre', 'Teléfono', ...MONTH_NAMES, 'Total'];
            const headerRow = ws.getRow(5);
            headerRow.height = 26;
            headerLabels.forEach((label, i) => {
                const cell = headerRow.getCell(i + 1);
                cell.value = label;
                cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.headerText } };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: COLORS.primary } },
                    bottom: { style: 'thin', color: { argb: COLORS.primary } },
                    left: { style: 'thin', color: { argb: COLORS.primary } },
                    right: { style: 'thin', color: { argb: COLORS.primary } },
                };
                // Color de fondo: Total en verde, resto en azul
                if (i === headerLabels.length - 1) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.green } };
                } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
                }
            });

            // ── Rows 6+: Datos de clientes ──
            clients.forEach((client, index) => {
                const rowNum = index + 6;
                const row = ws.getRow(rowNum);
                row.height = 20;
                const isAlt = index % 2 === 1;
                const bgColor = isAlt ? COLORS.rowAlt : COLORS.white;

                const values = [index + 1, client.name, client.phone || 'Sin teléfono', ...client.months, client.total];

                values.forEach((val, colIdx) => {
                    const cell = row.getCell(colIdx + 1);
                    cell.value = val;
                    cell.alignment = { horizontal: colIdx === 1 ? 'left' : 'center', vertical: 'middle' };
                    cell.border = {
                        top: { style: 'hair', color: { argb: COLORS.border } },
                        bottom: { style: 'hair', color: { argb: COLORS.border } },
                        left: { style: 'hair', color: { argb: COLORS.border } },
                        right: { style: 'hair', color: { argb: COLORS.border } },
                    };

                    // Columna Total — fondo verde claro
                    if (colIdx === values.length - 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.greenLight } };
                        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.greenDark } };
                    }
                    // Meses con actividad — azul bold
                    else if (colIdx >= 3 && colIdx <= 14) {
                        const numVal = val as number;
                        if (numVal > 0) {
                            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.primary } };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                        } else {
                            cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.textMuted } };
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                        }
                    }
                    // Columnas # , Nombre, Teléfono
                    else {
                        cell.font = { name: 'Calibri', size: 10, color: { argb: COLORS.textDark } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                    }
                });
            });

            // ── Fila de TOTALES ──
            const totalsRowNum = clients.length + 7; // +1 fila vacía de separación
            ws.getRow(clients.length + 6).height = 4; // separador

            const totalsRow = ws.getRow(totalsRowNum);
            totalsRow.height = 26;
            const totalsValues = [
                '',
                'TOTALES',
                '',
                ...Array.from({ length: 12 }, (_, m) => clients.reduce((sum, c) => sum + c.months[m], 0)),
                clients.reduce((sum, c) => sum + c.total, 0),
            ];

            totalsValues.forEach((val, colIdx) => {
                const cell = totalsRow.getCell(colIdx + 1);
                cell.value = val;
                cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: COLORS.white } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
                cell.alignment = { horizontal: colIdx === 1 ? 'left' : 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: COLORS.primaryDark } },
                    bottom: { style: 'thin', color: { argb: COLORS.primaryDark } },
                    left: { style: 'thin', color: { argb: COLORS.primaryDark } },
                    right: { style: 'thin', color: { argb: COLORS.primaryDark } },
                };
            });

            // ── Fila de footer ──
            const footerRowNum = totalsRowNum + 2;
            ws.mergeCells(footerRowNum, 1, footerRowNum, columnCount);
            const footerCell = ws.getCell(footerRowNum, 1);
            footerCell.value = `Generado por CanchaSystem  •  VillaGol  •  ${getFormattedDate()}`;
            footerCell.font = { name: 'Calibri', size: 8, italic: true, color: { argb: '999999' } };
            footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

            // ── Generar y descargar ──
            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `VillaGol_Clientes_Anual_${year}.xlsx`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Excel descargado exitosamente');
        } catch (error) {
            console.error('Error al exportar Excel:', error);
            toast.error('Error al generar el Excel');
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────────────────────────────────
    // PDF GENERATION
    // ──────────────────────────────────────────────
    const handleExportPDF = async () => {
        handleClose();
        setLoading(true);
        try {
            const { year, clients } = await fetchData();

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // ── HEADER ──
            doc.setFillColor(25, 118, 210); // primary
            doc.rect(0, 0, pageWidth, 32, 'F');

            doc.setFillColor(33, 150, 243); // accent
            doc.rect(0, 32, pageWidth, 3, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('VillaGol', 14, 16);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Reporte Anual de Clientes', 14, 25);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const yearText = `Año ${year}`;
            const yearWidth = doc.getTextWidth(yearText);
            doc.text(yearText, pageWidth - yearWidth - 14, 14);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            const dateText = `Generado: ${getFormattedDate()}`;
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - dateWidth - 14, 21);

            // ── SUMMARY CARDS (solo 2: Total Clientes y Total Juegos) ──
            const totalClients = clients.length;
            const totalGames = clients.reduce((sum, c) => sum + c.total, 0);

            const cardY = 40;
            const cardHeight = 16;
            const cardSpacing = 8;
            const cardWidth = (pageWidth - 28 - cardSpacing) / 2;

            // Card 1: Total Clientes
            doc.setFillColor(227, 242, 253); // primaryLight
            doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'F');
            doc.setDrawColor(25, 118, 210);
            doc.setLineWidth(0.3);
            doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'S');
            doc.setTextColor(25, 118, 210);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Total Clientes', 14 + cardWidth / 2, cardY + 5, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(String(totalClients), 14 + cardWidth / 2, cardY + 13, { align: 'center' });

            // Card 2: Total Juegos
            const card2X = 14 + cardWidth + cardSpacing;
            doc.setFillColor(232, 245, 233); // greenLight
            doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'F');
            doc.setDrawColor(76, 175, 80);
            doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'S');
            doc.setTextColor(76, 175, 80);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Total Juegos en el Año', card2X + cardWidth / 2, cardY + 5, { align: 'center' });
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(String(totalGames), card2X + cardWidth / 2, cardY + 13, { align: 'center' });

            // ── DATA TABLE ──
            const tableColumns = ['#', 'Nombre', 'Teléfono', ...MONTH_NAMES, 'Total'];

            const tableRows = clients.map((client, index) => [
                String(index + 1),
                client.name,
                client.phone || 'Sin teléfono',
                ...client.months.map(String),
                String(client.total),
            ]);

            // Totals row
            const totalsRowData = [
                '',
                'TOTALES',
                '',
                ...Array.from({ length: 12 }, (_, m) => String(clients.reduce((sum, c) => sum + c.months[m], 0))),
                String(clients.reduce((sum, c) => sum + c.total, 0)),
            ];
            tableRows.push(totalsRowData);

            autoTable(doc, {
                startY: cardY + cardHeight + 6,
                head: [tableColumns],
                body: tableRows,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    lineColor: [220, 220, 220],
                    lineWidth: 0.2,
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'center',
                    fontSize: 7,
                },
                bodyStyles: {
                    textColor: [55, 65, 81],
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250],
                },
                columnStyles: {
                    0: { halign: 'center', cellWidth: 8 },
                    1: { halign: 'left', cellWidth: 45 },
                    2: { halign: 'center', cellWidth: 25 },
                    3: { halign: 'center' },
                    4: { halign: 'center' },
                    5: { halign: 'center' },
                    6: { halign: 'center' },
                    7: { halign: 'center' },
                    8: { halign: 'center' },
                    9: { halign: 'center' },
                    10: { halign: 'center' },
                    11: { halign: 'center' },
                    12: { halign: 'center' },
                    13: { halign: 'center' },
                    14: { halign: 'center' },
                    15: { halign: 'center', fontStyle: 'bold' },
                },
                didParseCell: (data) => {
                    // Total column header → green
                    if (data.section === 'head' && data.column.index === 15) {
                        data.cell.styles.fillColor = [76, 175, 80];
                    }
                    // Totals row (last row) → blue
                    if (data.section === 'body' && data.row.index === tableRows.length - 1) {
                        data.cell.styles.fillColor = [25, 118, 210];
                        data.cell.styles.textColor = [255, 255, 255];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    // Month cells styling
                    if (data.section === 'body' && data.row.index < tableRows.length - 1) {
                        const colIdx = data.column.index;
                        if (colIdx >= 3 && colIdx <= 14) {
                            const val = parseInt(data.cell.raw as string);
                            if (val > 0) {
                                data.cell.styles.textColor = [25, 118, 210];
                                data.cell.styles.fontStyle = 'bold';
                            } else {
                                data.cell.styles.textColor = [180, 180, 180];
                            }
                        }
                        // Total column → green bg
                        if (colIdx === 15) {
                            const val = parseInt(data.cell.raw as string);
                            if (val > 0) {
                                data.cell.styles.fillColor = [232, 245, 233];
                                data.cell.styles.textColor = [46, 125, 50];
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    }
                },
                didDrawPage: () => {
                    // ── FOOTER ──
                    const footerY = pageHeight - 8;
                    doc.setFillColor(245, 245, 245);
                    doc.rect(0, footerY - 4, pageWidth, 12, 'F');
                    doc.setDrawColor(25, 118, 210);
                    doc.setLineWidth(0.5);
                    doc.line(0, footerY - 4, pageWidth, footerY - 4);

                    doc.setTextColor(120, 120, 120);
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.text('Generado por CanchaSystem  •  VillaGol', 14, footerY);

                    const pageNum = `Página ${doc.getCurrentPageInfo().pageNumber}`;
                    const pageNumWidth = doc.getTextWidth(pageNum);
                    doc.text(pageNum, pageWidth - pageNumWidth - 14, footerY);
                },
            });

            doc.save(`VillaGol_Clientes_Anual_${year}.pdf`);
            toast.success('PDF descargado exitosamente');
        } catch (error) {
            console.error('Error al exportar PDF:', error);
            toast.error('Error al generar el PDF');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="contained"
                size="small"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FileDownload />}
                onClick={handleClick}
                disabled={loading}
                sx={{
                    background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                {loading ? 'Generando...' : 'Descargar Lista'}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        minWidth: 220,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={handleExportExcel}
                    sx={{
                        py: 1.5,
                        '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' },
                    }}
                >
                    <ListItemIcon>
                        <TableChart sx={{ color: '#2e7d32' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Descargar Excel"
                        secondary="Formato .xlsx con diseño"
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                </MenuItem>
                <MenuItem
                    onClick={handleExportPDF}
                    sx={{
                        py: 1.5,
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                    }}
                >
                    <ListItemIcon>
                        <PictureAsPdf sx={{ color: '#c62828' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="Descargar PDF"
                        secondary="Formato .pdf profesional"
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                </MenuItem>
            </Menu>
        </>
    );
};

export default ClientExportButton;
