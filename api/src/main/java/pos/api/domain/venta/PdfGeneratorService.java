package pos.api.domain.venta;

import lombok.RequiredArgsConstructor;
import org.openpdf.text.*;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("#,##0.00");

    public byte[] generarFacturaPdf(Venta venta) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Encabezado
            agregarEncabezado(document, venta);

            // Datos del cliente
            agregarDatosCliente(document, venta);

            // Línea separadora
            document.add(new Chunk("\n"));

            // Detalles de productos
            agregarDetallesProductos(document, venta);

            // Totales
            agregarTotales(document, venta);

            // Pie de página
            agregarPie(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de factura: " + e.getMessage(), e);
        }
    }

    public byte[] generarTicketPdf(Venta venta) {
        // Similar a generarFacturaPdf pero con un formato más simple y en tamaño ticket
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // Usar un tamaño de página más pequeño para ticket
            Document document = new Document(new Rectangle(216f, 720f), 10, 10, 10, 10);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Encabezado para ticket
            agregarEncabezadoTicket(document, venta);

            // Detalles de productos para ticket
            agregarDetallesProductosTicket(document, venta);

            // Totales para ticket
            agregarTotalesTicket(document, venta);

            // Pie para ticket
            agregarPieTicket(document);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF de ticket: " + e.getMessage(), e);
        }
    }

    private void agregarEncabezado(Document document, Venta venta) throws DocumentException {
        // Título
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("FACTURA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Información de la empresa
        Font companyFont = new Font(Font.HELVETICA, 10);
        Paragraph companyInfo = new Paragraph();
        companyInfo.add(new Chunk("Electrodomésticos El Hogar\n", new Font(Font.HELVETICA, 12, Font.BOLD)));
        companyInfo.add(new Chunk(venta.getSucursal().getNombreSucursal() + "\n", companyFont));
        companyInfo.add(new Chunk(venta.getSucursal().getDireccion() + "\n", companyFont));
        companyInfo.add(new Chunk("Tel: " + venta.getSucursal().getTelefono() + "\n", companyFont));
        companyInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(companyInfo);

        // Línea separadora
        document.add(new Chunk("\n"));

        // Información de la venta
        Font ventaFont = new Font(Font.HELVETICA, 10);
        Paragraph ventaInfo = new Paragraph();
        ventaInfo.add(new Chunk("No. Factura: " + venta.getNumeroFactura() + "\n", ventaFont));
        ventaInfo.add(new Chunk("Fecha: " + formatInstant(venta.getFechaVenta()) + "\n", ventaFont));
        ventaInfo.add(new Chunk("Vendedor: " + venta.getUsuario().getUsername() + "\n", ventaFont));
        ventaInfo.add(new Chunk("Forma de Pago: " + venta.getFormaPago() + "\n", ventaFont));
        document.add(ventaInfo);
    }

    private void agregarEncabezadoTicket(Document document, Venta venta) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Paragraph title = new Paragraph("TICKET DE VENTA", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font companyFont = new Font(Font.HELVETICA, 8);
        Paragraph companyInfo = new Paragraph();
        companyInfo.add(new Chunk("Electrodomésticos El Hogar\n", new Font(Font.HELVETICA, 10, Font.BOLD)));
        companyInfo.add(new Chunk(venta.getSucursal().getNombreSucursal() + "\n", companyFont));
        companyInfo.add(new Chunk(venta.getSucursal().getDireccion() + "\n", companyFont));
        companyInfo.add(new Chunk("Tel: " + venta.getSucursal().getTelefono() + "\n", companyFont));
        companyInfo.setAlignment(Element.ALIGN_CENTER);
        document.add(companyInfo);

        document.add(new Chunk("\n"));

        Font ventaFont = new Font(Font.HELVETICA, 8);
        Paragraph ventaInfo = new Paragraph();
        ventaInfo.add(new Chunk("No. Ticket: " + venta.getNumeroFactura() + "\n", ventaFont));
        ventaInfo.add(new Chunk("Fecha: " + formatInstant(venta.getFechaVenta()) + "\n", ventaFont));
        ventaInfo.add(new Chunk("Vendedor: " + venta.getUsuario().getUsername() + "\n", ventaFont));
        ventaInfo.add(new Chunk("Pago: " + venta.getFormaPago() + "\n", ventaFont));
        document.add(ventaInfo);
    }

    private void agregarDatosCliente(Document document, Venta venta) throws DocumentException {
        if (venta.getCliente() != null) {
            Font clientFont = new Font(Font.HELVETICA, 10);
            Paragraph clientInfo = new Paragraph();
            clientInfo.add(new Chunk("Cliente: " + venta.getCliente().getNombre() + "\n", clientFont));
            if (venta.getCliente().getNumeroDocumento() != null) {
                clientInfo.add(new Chunk("NIT/CUI: " + venta.getCliente().getNumeroDocumento() + "\n", clientFont));
            }
            if (venta.getCliente().getDireccion() != null) {
                clientInfo.add(new Chunk("Dirección: " + venta.getCliente().getDireccion() + "\n", clientFont));
            }
            document.add(clientInfo);
        } else {
            Font clientFont = new Font(Font.HELVETICA, 10);
            Paragraph clientInfo = new Paragraph("Cliente: CONSUMIDOR FINAL\n", clientFont);
            document.add(clientInfo);
        }
    }

    private void agregarDetallesProductos(Document document, Venta venta) throws DocumentException {
        // Crear tabla con 5 columnas
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(10f);

        // Encabezados de tabla
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        table.addCell(new PdfPCell(new Phrase("Producto", headerFont)));
        table.addCell(new PdfPCell(new Phrase("Cantidad", headerFont)));
        table.addCell(new PdfPCell(new Phrase("P. Unit.", headerFont)));
        table.addCell(new PdfPCell(new Phrase("Desc.", headerFont)));
        table.addCell(new PdfPCell(new Phrase("Total", headerFont)));

        // Datos de productos
        Font cellFont = new Font(Font.HELVETICA, 9);
        for (DetalleVenta detalle : venta.getDetalles()) {
            table.addCell(new PdfPCell(new Phrase(detalle.getProducto().getNombreProducto(), cellFont)));
            table.addCell(new PdfPCell(new Phrase(detalle.getCantidad() + " " + detalle.getUnidadMedida().getAbreviatura(), cellFont)));
            table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(detalle.getPrecioUnitario()), cellFont)));
            table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(detalle.getDescuento()), cellFont)));
            table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(detalle.getTotal()), cellFont)));
        }

        document.add(table);
    }

    private void agregarDetallesProductosTicket(Document document, Venta venta) throws DocumentException {
        // Para ticket, usamos una tabla más simple con 4 columnas
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.setSpacingAfter(5f);

        // Encabezados
        Font headerFont = new Font(Font.HELVETICA, 7, Font.BOLD);
        table.addCell(new PdfPCell(new Phrase("Producto", headerFont)));
        table.addCell(new PdfPCell(new Phrase("Cant", headerFont)));
        table.addCell(new PdfPCell(new Phrase("P.U.", headerFont)));
        table.addCell(new PdfPCell(new Phrase("Total", headerFont)));

        // Datos
        Font cellFont = new Font(Font.HELVETICA, 6);
        for (DetalleVenta detalle : venta.getDetalles()) {
            // En ticket, el nombre del producto puede truncarse
            String productName = detalle.getProducto().getNombreProducto();
            if (productName.length() > 20) {
                productName = productName.substring(0, 20) + "...";
            }
            table.addCell(new PdfPCell(new Phrase(productName, cellFont)));
            table.addCell(new PdfPCell(new Phrase(detalle.getCantidad() + detalle.getUnidadMedida().getAbreviatura(), cellFont)));
            table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(detalle.getPrecioUnitario()), cellFont)));
            table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(detalle.getTotal()), cellFont)));
        }

        document.add(table);
    }

    private void agregarTotales(Document document, Venta venta) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.setSpacingAfter(10f);

        Font font = new Font(Font.HELVETICA, 10);

        table.addCell(new PdfPCell(new Phrase("Subtotal:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getSubtotal()), font)));

        table.addCell(new PdfPCell(new Phrase("Impuesto:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getImpuesto()), font)));

        table.addCell(new PdfPCell(new Phrase("Descuento:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getDescuento()), font)));

        Font totalFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        table.addCell(new PdfPCell(new Phrase("TOTAL:", totalFont)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getTotal()), totalFont)));

        document.add(table);
    }

    private void agregarTotalesTicket(Document document, Venta venta) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(5f);

        Font font = new Font(Font.HELVETICA, 8);

        table.addCell(new PdfPCell(new Phrase("Subtotal:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getSubtotal()), font)));

        table.addCell(new PdfPCell(new Phrase("Impuesto:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getImpuesto()), font)));

        table.addCell(new PdfPCell(new Phrase("Descuento:", font)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getDescuento()), font)));

        Font totalFont = new Font(Font.HELVETICA, 9, Font.BOLD);
        table.addCell(new PdfPCell(new Phrase("TOTAL:", totalFont)));
        table.addCell(new PdfPCell(new Phrase("Q" + DECIMAL_FORMAT.format(venta.getTotal()), totalFont)));

        document.add(table);
    }

    private void agregarPie(Document document) throws DocumentException {
        Font footerFont = new Font(Font.HELVETICA, 8, Font.ITALIC);
        Paragraph footer = new Paragraph();
        footer.add(new Chunk("¡Gracias por su compra!\n", footerFont));
        footer.add(new Chunk("El Hogar - " + LocalDateTime.now().getYear() + "\n", footerFont));
        footer.add(new Chunk("Este documento es una representación impresa de su factura.", footerFont));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private void agregarPieTicket(Document document) throws DocumentException {
        Font footerFont = new Font(Font.HELVETICA, 6, Font.ITALIC);
        Paragraph footer = new Paragraph();
        footer.add(new Chunk("¡Gracias por su compra!\n", footerFont));
        footer.add(new Chunk("El Hogar - " + LocalDateTime.now().getYear(), footerFont));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private String formatInstant(Instant instant) {
        LocalDateTime dateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }
}
