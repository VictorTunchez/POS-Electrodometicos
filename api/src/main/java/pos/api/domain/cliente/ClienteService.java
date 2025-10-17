package pos.api.domain.cliente;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClienteService {

    private final IClienteRepository clienteRepository;

    @Transactional
    public ClienteResponseDto crearCliente(ClienteRequestDto dto) {
        // Validar que el número de documento no esté repetido (si se proporciona)
        if (dto.numeroDocumento() != null && !dto.numeroDocumento().isBlank()) {
            if (clienteRepository.existsByNumeroDocumentoAndDeletedAtIsNull(dto.numeroDocumento())) {
                throw new IllegalArgumentException("Ya existe un cliente con el número de documento: " + dto.numeroDocumento());
            }
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(dto.nombre());
        cliente.setEmail(dto.email());
        cliente.setTelefono(dto.telefono());
        cliente.setDireccion(dto.direccion());
        cliente.setTipoDocumento(dto.tipoDocumento());
        cliente.setNumeroDocumento(dto.numeroDocumento());

        Cliente clienteGuardado = clienteRepository.save(cliente);
        return mapToResponse(clienteGuardado);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDto> listarClientes() {
        return clienteRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDto obtenerCliente(Long id) {
        Cliente cliente = clienteRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
        return mapToResponse(cliente);
    }

    @Transactional
    public ClienteResponseDto actualizarCliente(Long id, ActualizarClienteRequestDto dto) {
        Cliente cliente = clienteRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));

        // Validar número de documento si se está actualizando y no está repetido
        if (dto.numeroDocumento() != null && !dto.numeroDocumento().isBlank()
                && !dto.numeroDocumento().equals(cliente.getNumeroDocumento())) {
            if (clienteRepository.existsByNumeroDocumentoAndDeletedAtIsNull(dto.numeroDocumento())) {
                throw new IllegalArgumentException("Ya existe un cliente con el número de documento: " + dto.numeroDocumento());
            }
        }

        // Actualizar campos
        if (dto.nombre() != null) cliente.setNombre(dto.nombre());
        if (dto.email() != null) cliente.setEmail(dto.email());
        if (dto.telefono() != null) cliente.setTelefono(dto.telefono());
        if (dto.direccion() != null) cliente.setDireccion(dto.direccion());
        if (dto.tipoDocumento() != null) cliente.setTipoDocumento(dto.tipoDocumento());
        if (dto.numeroDocumento() != null) cliente.setNumeroDocumento(dto.numeroDocumento());

        Cliente clienteActualizado = clienteRepository.save(cliente);
        return mapToResponse(clienteActualizado);
    }

    @Transactional
    public void eliminarCliente(Long id) {
        Cliente cliente = clienteRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
        cliente.setDeletedAt(Instant.now());
        clienteRepository.save(cliente);
    }

    // Agregar este metodo al ClienteService
    @Transactional(readOnly = true)
    public Cliente buscarPorNumeroDocumento(String numeroDocumento) {
        return clienteRepository.findByNumeroDocumentoAndDeletedAtIsNull(numeroDocumento)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con documento: " + numeroDocumento));
    }

    public ClienteResponseDto mapToResponse(Cliente cliente) {
        return new ClienteResponseDto(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getEmail(),
                cliente.getTelefono(),
                cliente.getDireccion(),
                cliente.getTipoDocumento(),
                cliente.getNumeroDocumento(),
                cliente.getCreatedAt(),
                cliente.getUpdatedAt()
        );
    }
}