package pos.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/panel")
@CrossOrigin(origins = "*")
public class PanelController {

    @GetMapping("/bienvenida")
    public ResponseEntity<String> saludoBienvenida() {
        return ResponseEntity.ok("¡Bienvenido al Sistema POS!");
    }
}

