package pos.api.domain.proveedor;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pos.api.domain.compra.*;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProveedorService {

    private final IProveedorRepository proveedorRepository;
    private final ICompraRepository compraRepository;

    public ProveedorResponseDto crearProveedor(ProveedorRequestDto dto) {
        // Validar NIT único
        if (proveedorRepository.existsByNitAndDeletedAtIsNull(dto.nit())) {
            throw new IllegalStateException("Ya existe un proveedor con el NIT: " + dto.nit());
        }

        Proveedor proveedor = new Proveedor();
        proveedor.setRazonSocial(dto.razonSocial());
        proveedor.setNombreComercial(dto.nombreComercial());
        proveedor.setNit(dto.nit()); // Cambiado de ruc a nit
        proveedor.setDireccion(dto.direccion());
        proveedor.setDepartamento(dto.departamento()); // Nuevo
        proveedor.setMunicipio(dto.municipio()); // Nuevo
        proveedor.setTelefono(dto.telefono());
        proveedor.setEmail(dto.email());
        proveedor.setContactoNombre(dto.contactoNombre());
        proveedor.setContactoTelefono(dto.contactoTelefono());
        proveedor.setObservaciones(dto.observaciones());

        Proveedor guardado = proveedorRepository.save(proveedor);
        return mapToResponse(guardado);
    }

    public List<ProveedorResponseDto> listarProveedoresActivos() {
        return proveedorRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProveedorResponseDto> listarTodosProveedores() {
        return proveedorRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProveedorResponseDto> listarProveedoresInactivos() {
        return proveedorRepository.findByDeletedAtIsNotNull().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProveedorResponseDto obtenerProveedor(Long id) {
        Proveedor proveedor = proveedorRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));
        return mapToResponse(proveedor);
    }

    public ProveedorResponseDto actualizarProveedor(Long id, ActualizarProveedorRequestDto dto) {
        Proveedor proveedor = proveedorRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));

        // Validar NIT único si cambió
        if (!dto.nit().equals(proveedor.getNit()) &&
                proveedorRepository.existsByNitAndIdNotAndDeletedAtIsNull(dto.nit(), id)) {
            throw new IllegalStateException("Ya existe un proveedor con el NIT: " + dto.nit());
        }

        proveedor.setRazonSocial(dto.razonSocial());
        proveedor.setNombreComercial(dto.nombreComercial());
        proveedor.setNit(dto.nit()); // Cambiado de ruc a nit
        proveedor.setDireccion(dto.direccion());
        proveedor.setDepartamento(dto.departamento()); // Nuevo
        proveedor.setMunicipio(dto.municipio()); // Nuevo
        proveedor.setTelefono(dto.telefono());
        proveedor.setEmail(dto.email());
        proveedor.setContactoNombre(dto.contactoNombre());
        proveedor.setContactoTelefono(dto.contactoTelefono());
        proveedor.setObservaciones(dto.observaciones());

        Proveedor actualizado = proveedorRepository.save(proveedor);
        return mapToResponse(actualizado);
    }

    public void eliminarProveedor(Long id) {
        Proveedor proveedor = proveedorRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));
        proveedor.setDeletedAt(Instant.now());
        proveedorRepository.save(proveedor);
    }

    public List<ProveedorResponseDto> buscarProveedores(String razonSocial, String nit) {
        if (razonSocial != null && nit != null) {
            return proveedorRepository.findByRazonSocialContainingIgnoreCaseAndNitAndDeletedAtIsNull(razonSocial, nit).stream()
                    .map(this::mapToResponse)
                    .toList();
        } else if (razonSocial != null) {
            return proveedorRepository.findByRazonSocialContainingIgnoreCaseAndDeletedAtIsNull(razonSocial).stream()
                    .map(this::mapToResponse)
                    .toList();
        } else if (nit != null) {
            return proveedorRepository.findByNitAndDeletedAtIsNull(nit).stream()
                    .map(this::mapToResponse)
                    .toList();
        } else {
            return listarProveedoresActivos();
        }
    }

    public void restaurarProveedor(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado con ID: " + id));
        proveedor.setDeletedAt(null);
        proveedorRepository.save(proveedor);
    }

    public List<CompraResponseDto> obtenerComprasPorProveedor(Long proveedorId) {
        // Primero validar que el proveedor existe
        if (!proveedorRepository.existsByIdAndDeletedAtIsNull(proveedorId)) {
            throw new IllegalArgumentException("Proveedor no encontrado con ID: " + proveedorId);
        }

        return compraRepository.findByProveedorId(proveedorId).stream()
                .map(this::mapToCompraResponse)
                .toList();
    }

    private CompraResponseDto mapToCompraResponse(Compra compra) {
        return new CompraResponseDto(
                compra.getId(),
                compra.getNumeroFactura(),
                compra.getNumeroControl(),
                compra.getProveedor().getId(),
                compra.getProveedor().getRazonSocial(),
                compra.getSucursal().getId(),
                compra.getSucursal().getNombreSucursal(),
                compra.getFechaCompra(),
                compra.getFechaRecepcion(),
                compra.getEstado(),
                compra.getSubtotal(),
                compra.getImpuesto(),
                compra.getDescuento(),
                compra.getTotal(),
                compra.getObservaciones(),
                compra.getDetalles().stream().map(this::mapToDetalleResponse).toList(),
                compra.getCreatedAt(),
                compra.getUpdatedAt()
        );
    }

    private DetalleCompraResponseDto mapToDetalleResponse(DetalleCompra detalle) {
        return new DetalleCompraResponseDto(
                detalle.getId(),
                detalle.getProducto().getId(),
                detalle.getProducto().getNombreProducto(),
                detalle.getProducto().getCodigoBarras(),
                detalle.getUnidadMedida().getId(),
                detalle.getUnidadMedida().getNombre(),
                detalle.getUnidadMedida().getAbreviatura(),
                detalle.getCantidad(),
                detalle.getCantidadRecibida(),
                detalle.getCostoUnitario(),
                detalle.getSubtotal(),
                detalle.getImpuesto(),
                detalle.getDescuento(),
                detalle.getTotal()
        );
    }

    private ProveedorResponseDto mapToResponse(Proveedor proveedor) {
        return new ProveedorResponseDto(
                proveedor.getId(),
                proveedor.getRazonSocial(),
                proveedor.getNombreComercial(),
                proveedor.getNit(),
                proveedor.getDireccion(),
                proveedor.getDepartamento(), // Nuevo
                proveedor.getMunicipio(), // Nuevo
                proveedor.getTelefono(),
                proveedor.getEmail(),
                proveedor.getContactoNombre(),
                proveedor.getContactoTelefono(),
                proveedor.getObservaciones(),
                proveedor.getCreatedAt(),
                proveedor.getUpdatedAt(),
                proveedor.getDeletedAt()
        );
    }
}
