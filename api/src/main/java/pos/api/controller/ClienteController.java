package pos.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pos.api.domain.cliente.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Validated
public class ClienteController {

    private final ClienteService clienteService;

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_CREAR')")
    @PostMapping
    public ResponseEntity<ClienteResponseDto> crearCliente(@RequestBody @Valid ClienteRequestDto dto) {
        ClienteResponseDto response = clienteService.crearCliente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_VER')")
    @GetMapping
    public ResponseEntity<List<ClienteResponseDto>> listarClientes() {
        List<ClienteResponseDto> response = clienteService.listarClientes();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_VER')")
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> obtenerCliente(@PathVariable Long id) {
        ClienteResponseDto response = clienteService.obtenerCliente(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_EDITAR')")
    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> actualizarCliente(
            @PathVariable Long id,
            @RequestBody @Valid ActualizarClienteRequestDto dto) {
        ClienteResponseDto response = clienteService.actualizarCliente(id, dto);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_ELIMINAR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@autorizacionService.tienePermiso('CLIENTES_VER')")
    @GetMapping("/buscar")
    public ResponseEntity<ClienteResponseDto> buscarClientePorDocumento(@RequestParam String numeroDocumento) {
        Cliente cliente = clienteService.buscarPorNumeroDocumento(numeroDocumento);
        return ResponseEntity.ok(clienteService.mapToResponse(cliente));
    }
}