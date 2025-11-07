package pos.api.controller;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.DashboardService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Map;


@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Map<String, Object> estadisticas = dashboardService.obtenerEstadisticasGenerales();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            logger.error("Error al obtener estadísticas del dashboard", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "No se pudieron cargar las estadísticas"));
        }
    }

    @GetMapping("/reportes/{tipo}")
    public ResponseEntity<byte[]> generarReporte(
            @PathVariable String tipo,
            @RequestParam(defaultValue = "pdf") String formato) {
        try {
            byte[] reporte = dashboardService.generarReporte(tipo, formato);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            String filename = String.format("reporte-%s-%s.pdf",
                    tipo, LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));

            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename(filename)
                    .build());

            return new ResponseEntity<>(reporte, headers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al generar reporte: " + tipo, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
