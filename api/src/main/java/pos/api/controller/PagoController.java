package pos.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.venta.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class PagoController {

    private final VentaService ventaService;
    private final StripeService stripeService;

    @PostMapping("/confirmar-stripe")
    public ResponseEntity<VentaResponseDto> confirmarPagoStripe(@RequestParam String sessionId) {
        VentaResponseDto response = ventaService.confirmarPagoStripe(sessionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verificar/{sessionId}")
    public ResponseEntity<Map<String, Object>> verificarEstadoPago(@PathVariable String sessionId) {
        try {
            boolean exitoso = stripeService.verificarPagoExitoso(sessionId);
            Map<String, Object> response = Map.of(
                    "exitoso", exitoso,
                    "sessionId", sessionId
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "exitoso", false,
                    "error", e.getMessage()
            ));
        }
    }
}