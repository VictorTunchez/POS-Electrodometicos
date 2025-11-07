package pos.api.domain.sucursal;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SucursalService {

    private final ISucursalRepository sucursalRepository;

    public SucursalResponseDto crearSucursal(SucursalRequestDto dto) {
        if (sucursalRepository.findByNombreSucursal(dto.nombreSucursal()).isPresent()) {
            throw new IllegalStateException("Ya existe una sucursal con el nombre: " + dto.nombreSucursal());
        }

        Sucursal sucursal = new Sucursal();
        sucursal.setNombreSucursal(dto.nombreSucursal());
        sucursal.setDireccion(dto.direccion());
        sucursal.setTelefono(dto.telefono());

        Sucursal guardada = sucursalRepository.save(sucursal);
        return mapToResponse(guardada);
    }

    public List<SucursalResponseDto> listarSucursales() {
        return sucursalRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SucursalResponseDto obtenerSucursal(Long id) {
        Sucursal sucursal = sucursalRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + id));
        return mapToResponse(sucursal);
    }

    public SucursalResponseDto actualizarSucursal(Long id, SucursalRequestDto dto) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + id));

        if (!sucursal.getNombreSucursal().equals(dto.nombreSucursal()) &&
                sucursalRepository.findByNombreSucursal(dto.nombreSucursal()).isPresent()) {
            throw new IllegalStateException("Ya existe una sucursal con el nombre: " + dto.nombreSucursal());
        }

        sucursal.setNombreSucursal(dto.nombreSucursal());
        sucursal.setDireccion(dto.direccion());
        sucursal.setTelefono(dto.telefono());

        return mapToResponse(sucursalRepository.save(sucursal));
    }

    public void eliminarSucursal(Long id) {
        Sucursal sucursal = sucursalRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + id));

        if (!sucursal.getUsuarios().isEmpty()) {
            throw new IllegalStateException("No se puede eliminar la sucursal. Tiene " +
                    sucursal.getUsuarios().size() + " usuario(s) asignado(s)");
        }

        sucursal.setDeletedAt(Instant.now());
        sucursalRepository.save(sucursal);
    }

    public void restaurarSucursal(Long id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada con ID: " + id));

        sucursal.setDeletedAt(null);
        sucursalRepository.save(sucursal);
    }

    public List<SucursalResponseDto> listarTodasSucursales() {
        return sucursalRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private SucursalResponseDto mapToResponse(Sucursal sucursal) {
        return new SucursalResponseDto(
                sucursal.getId(),
                sucursal.getNombreSucursal(),
                sucursal.getDireccion(),
                sucursal.getTelefono(),
                sucursal.getCreatedAt(),
                sucursal.getUpdatedAt(),
                sucursal.getDeletedAt()
        );
    }
}


