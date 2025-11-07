package pos.api.domain;

import org.openpdf.text.*;
import org.openpdf.text.Font;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pos.api.domain.cliente.IClienteRepository;
import pos.api.domain.compra.Compra;
import pos.api.domain.compra.ICompraRepository;
import pos.api.domain.inventario.IInventarioRepository;
import pos.api.domain.producto.IProductoRepository;
import pos.api.domain.sucursal.ISucursalRepository;
import pos.api.domain.venta.IVentaRepository;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {

    @Autowired
    private IVentaRepository ventaRepository;

    @Autowired
    private IClienteRepository clienteRepository;

    @Autowired
    private IProductoRepository productoRepository;

    @Autowired
    private ICompraRepository compraRepository;

    @Autowired
    private IInventarioRepository inventarioRepository;

    @Autowired
    private ISucursalRepository sucursalRepository;

    private final DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
    private final DecimalFormat decimalFormat = new DecimalFormat("#,##0.00", symbols);
    private final DecimalFormat integerFormat = new DecimalFormat("#,##0", symbols);

    public Map<String, Object> obtenerEstadisticasGenerales() {
        Map<String, Object> estadisticas = new HashMap<>();

        try {
            // Métricas principales
            estadisticas.put("ventasHoy", formatearBigDecimal(ventaRepository.findTotalVentasHoy()));
            estadisticas.put("totalClientes", clienteRepository.countByDeletedAtIsNull());
            estadisticas.put("totalProductos", productoRepository.countByDeletedAtIsNull());
            estadisticas.put("stockBajo", inventarioRepository.countByStockActualLessThanEqualStockMinimo());
            estadisticas.put("comprasMes", formatearBigDecimal(compraRepository.findTotalComprasEsteMes()));
            estadisticas.put("ventasHoyCount", ventaRepository.countVentasHoy());

            // Estadísticas de sucursales
            estadisticas.put("totalSucursales", sucursalRepository.countByDeletedAtIsNull());
            estadisticas.put("ventasPorSucursal", obtenerVentasPorSucursal());
//            estadisticas.put("sucursalesActivas", sucursalRepository.findSucursalesActivasConVentas());

            // Productos y tendencias
            estadisticas.put("productosPopulares", mapearProductosPopulares(ventaRepository.findProductosPopulares()));
            estadisticas.put("tendenciaVentas", calcularTendenciaVentas());
            estadisticas.put("clientesNuevosMes", clienteRepository.countClientesNuevosEsteMes());
            estadisticas.put("ultimaCompra", obtenerUltimaCompraFecha());

            // Meta configurable
            estadisticas.put("metaVentas", "50,000.00");

        } catch (Exception e) {
            // Solo inicializar con valores cero, sin datos de ejemplo
            inicializarEstadisticasConCeros(estadisticas);
        }

        return estadisticas;
    }

    private String formatearBigDecimal(BigDecimal valor) {
        if (valor == null) {
            return "0.00";
        }
        return decimalFormat.format(valor);
    }

    private String formatearNumero(Number valor) {
        if (valor == null) {
            return "0";
        }
        return integerFormat.format(valor);
    }

    private void inicializarEstadisticasConCeros(Map<String, Object> estadisticas) {
        estadisticas.put("ventasHoy", "0.00");
        estadisticas.put("totalClientes", 0L);
        estadisticas.put("totalProductos", 0L);
        estadisticas.put("stockBajo", 0L);
        estadisticas.put("comprasMes", "0.00");
        estadisticas.put("ventasHoyCount", 0L);
        estadisticas.put("tendenciaVentas", 0);
        estadisticas.put("clientesNuevosMes", 0L);
        estadisticas.put("ultimaCompra", "N/A");
        estadisticas.put("metaVentas", "50,000.00");
        estadisticas.put("totalSucursales", 0L);
        estadisticas.put("ventasPorSucursal", Collections.emptyList());
        estadisticas.put("sucursalesActivas", Collections.emptyList());
        estadisticas.put("productosPopulares", Collections.emptyList());
    }

    private List<Map<String, Object>> obtenerVentasPorSucursal() {
        try {
            List<Object[]> resultados = ventaRepository.findVentasPorSucursal();
            return resultados.stream().map(row -> {
                Map<String, Object> sucursal = new HashMap<>();
                sucursal.put("nombre", row[0]);
                sucursal.put("ventas", formatearBigDecimal((BigDecimal) row[1]));
                sucursal.put("porcentaje", row[2]);
                return sucursal;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Map<String, Object>> mapearProductosPopulares(List<Object[]> datos) {
        if (datos == null || datos.isEmpty()) {
            return Collections.emptyList();
        }

        return datos.stream().map(row -> {
            Map<String, Object> producto = new HashMap<>();
            producto.put("nombre", row[0]);
            producto.put("vendidos", formatearNumero(((Number) row[1]).longValue()));
            producto.put("ganancia", formatearBigDecimal((BigDecimal) row[2]));
            return producto;
        }).collect(Collectors.toList());
    }

    private Integer calcularTendenciaVentas() {
        try {
            BigDecimal ventasMesActual = ventaRepository.findTotalVentasEsteMes();
            BigDecimal ventasMesAnterior = ventaRepository.findTotalVentasMesAnterior();

            if (ventasMesAnterior == null || ventasMesAnterior.compareTo(BigDecimal.ZERO) == 0) {
                return ventasMesActual != null && ventasMesActual.compareTo(BigDecimal.ZERO) > 0 ? 100 : 0;
            }

            if (ventasMesActual == null) {
                return 0;
            }

            BigDecimal diferencia = ventasMesActual.subtract(ventasMesAnterior);
            BigDecimal porcentaje = diferencia.divide(ventasMesAnterior, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));

            return porcentaje.intValue();
        } catch (Exception e) {
            return 0;
        }
    }

    private Long obtenerClientesNuevosMes() {
        try {
            return clienteRepository.countClientesNuevosEsteMes();
        } catch (Exception e) {
            return 0L;
        }
    }

    private String obtenerUltimaCompraFecha() {
        try {
            Compra ultimaCompra = compraRepository.findFirstByOrderByFechaCompraDesc();
            if (ultimaCompra != null && ultimaCompra.getFechaCompra() != null) {
                return ultimaCompra.getFechaCompra().atZone(ZoneId.systemDefault())
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
            return "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    public byte[] generarReporte(String tipo, String formato) {
        try {
            return generarReportePdf(tipo);
        } catch (Exception e) {
            return generarReporteErrorPdf("Error generando reporte: " + e.getMessage());
        }
    }

    private byte[] generarReportePdf(String tipo) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 50, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            agregarEncabezadoReporte(document, tipo);
            document.add(new Chunk("\n"));

            Map<String, Object> estadisticas = obtenerEstadisticasGenerales();

            switch (tipo.toLowerCase()) {
                case "ventas":
                    agregarReporteVentas(document, estadisticas);
                    break;
                case "productos":
                    agregarReporteProductos(document, estadisticas);
                    break;
                case "sucursales":
                    agregarReporteSucursales(document, estadisticas);
                    break;
                case "general":
                default:
                    agregarReporteGeneral(document, estadisticas);
                    break;
            }

            agregarPieReporte(document);
            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }
    }

    private void agregarEncabezadoReporte(Document document, String tipo) throws DocumentException {
        // Logo y título
        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(59, 130, 246));
        Paragraph title = new Paragraph("Sistema POS - El Hogar", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font subtitleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        Paragraph subtitle = new Paragraph("Reporte de " + tipo.toUpperCase(), subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);

        // Fecha de generación
        Font dateFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
        Paragraph date = new Paragraph("Generado el: " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), dateFont);
        date.setAlignment(Element.ALIGN_CENTER);
        document.add(date);
    }

    private void agregarReporteGeneral(Document document, Map<String, Object> estadisticas) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59));
        Font metricFont = new Font(Font.HELVETICA, 10);
        Font valueFont = new Font(Font.HELVETICA, 10, Font.BOLD);

        // Métricas principales
        document.add(new Paragraph("Métricas Principales", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        agregarFilaMetrica(table, "Ventas Hoy", "Q" + estadisticas.get("ventasHoy"), metricFont, valueFont);
        agregarFilaMetrica(table, "Compras del Mes", "Q" + estadisticas.get("comprasMes"), metricFont, valueFont);
        agregarFilaMetrica(table, "Total Clientes", estadisticas.get("totalClientes").toString(), metricFont, valueFont);
        agregarFilaMetrica(table, "Total Productos", estadisticas.get("totalProductos").toString(), metricFont, valueFont);
        agregarFilaMetrica(table, "Stock Bajo", estadisticas.get("stockBajo").toString(), metricFont, valueFont);
        agregarFilaMetrica(table, "Sucursales Activas", estadisticas.get("totalSucursales").toString(), metricFont, valueFont);
        agregarFilaMetrica(table, "Tendencia Ventas", estadisticas.get("tendenciaVentas") + "%", metricFont, valueFont);

        document.add(table);
    }

    private void agregarReporteVentas(Document document, Map<String, Object> estadisticas) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59));

        document.add(new Paragraph("Resumen de Ventas", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        agregarFilaMetrica(table, "Ventas Hoy", "Q" + estadisticas.get("ventasHoy"));
        agregarFilaMetrica(table, "Transacciones Hoy", estadisticas.get("ventasHoyCount").toString());
        agregarFilaMetrica(table, "Tendencia Mensual", estadisticas.get("tendenciaVentas") + "%");
        agregarFilaMetrica(table, "Meta de Ventas", "Q" + estadisticas.get("metaVentas"));

        document.add(table);

        // Ventas por sucursal
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ventasSucursal = (List<Map<String, Object>>) estadisticas.get("ventasPorSucursal");
        if (ventasSucursal != null && !ventasSucursal.isEmpty()) {
            document.add(new Paragraph("\nVentas por Sucursal", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable sucursalTable = new PdfPTable(3);
            sucursalTable.setWidthPercentage(100);
            sucursalTable.setSpacingBefore(10f);

            // Encabezados
            sucursalTable.addCell(crearCeldaEncabezado("Sucursal"));
            sucursalTable.addCell(crearCeldaEncabezado("Ventas"));
            sucursalTable.addCell(crearCeldaEncabezado("Participación"));

            for (Map<String, Object> sucursal : ventasSucursal) {
                sucursalTable.addCell(crearCeldaNormal(sucursal.get("nombre").toString()));
                sucursalTable.addCell(crearCeldaNormal("Q" + sucursal.get("ventas")));
                sucursalTable.addCell(crearCeldaNormal(sucursal.get("porcentaje") + "%"));
            }

            document.add(sucursalTable);
        }
    }

    private void agregarReporteProductos(Document document, Map<String, Object> estadisticas) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59));

        document.add(new Paragraph("Productos Más Vendidos", sectionFont));
        document.add(new Paragraph(" "));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> productos = (List<Map<String, Object>>) estadisticas.get("productosPopulares");

        if (productos != null && !productos.isEmpty()) {
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            // Encabezados
            table.addCell(crearCeldaEncabezado("Producto"));
            table.addCell(crearCeldaEncabezado("Unidades Vendidas"));
            table.addCell(crearCeldaEncabezado("Ganancia Total"));

            for (Map<String, Object> producto : productos) {
                table.addCell(crearCeldaNormal(producto.get("nombre").toString()));
                table.addCell(crearCeldaNormal(producto.get("vendidos").toString()));
                table.addCell(crearCeldaNormal("Q" + producto.get("ganancia")));
            }

            document.add(table);
        } else {
            document.add(new Paragraph("No hay datos de productos disponibles.", new Font(Font.HELVETICA, 10)));
        }
    }

    private void agregarReporteSucursales(Document document, Map<String, Object> estadisticas) throws DocumentException {
        Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59));

        document.add(new Paragraph("Estadísticas de Sucursales", sectionFont));
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        agregarFilaMetrica(table, "Total Sucursales", estadisticas.get("totalSucursales").toString());

        document.add(table);
    }

    private void agregarFilaMetrica(PdfPTable table, String metric, String value) {
        table.addCell(crearCeldaNormal(metric));
        table.addCell(crearCeldaValor(value));
    }

    private void agregarFilaMetrica(PdfPTable table, String metric, String value, Font metricFont, Font valueFont) {
        table.addCell(new PdfPCell(new Phrase(metric, metricFont)));
        table.addCell(new PdfPCell(new Phrase(value, valueFont)));
    }

    private PdfPCell crearCeldaEncabezado(String texto) {
        Font font = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(texto, font));
        cell.setBackgroundColor(new Color(59, 130, 246));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell crearCeldaNormal(String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, new Font(Font.HELVETICA, 9)));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell crearCeldaValor(String texto) {
        PdfPCell cell = new PdfPCell(new Phrase(texto, new Font(Font.HELVETICA, 9, Font.BOLD)));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    private void agregarPieReporte(Document document) throws DocumentException {
        Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC, Color.GRAY);
        Paragraph footer = new Paragraph();
        footer.add(new Chunk("Reporte generado automáticamente por el Sistema POS El Hogar\n", footerFont));
        footer.add(new Chunk("© " + LocalDateTime.now().getYear() + " - Todos los derechos reservados", footerFont));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private byte[] generarReporteErrorPdf(String mensajeError) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font errorFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.RED);
            Paragraph error = new Paragraph(mensajeError, errorFont);
            document.add(error);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }
}
