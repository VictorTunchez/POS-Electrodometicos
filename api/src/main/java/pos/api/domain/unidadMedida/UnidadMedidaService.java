package pos.api.domain.unidadMedida;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UnidadMedidaService {

    private final IUnidadMedidaRepository unidadMedidaRepository;

    public UnidadMedidaResponseDto crear(UnidadMedidaRequestDto dto) {
        // Validar nombre único
        if (unidadMedidaRepository.existsByNombre(dto.nombre())) {
            throw new IllegalStateException("Ya existe una unidad de medida con el nombre: " + dto.nombre());
        }

        // Validar abreviatura única
        if (unidadMedidaRepository.existsByAbreviatura(dto.abreviatura())) {
            throw new IllegalStateException("Ya existe una unidad de medida con la abreviatura: " + dto.abreviatura());
        }

        UnidadMedida unidadMedida = new UnidadMedida();
        unidadMedida.setNombre(dto.nombre());
        unidadMedida.setAbreviatura(dto.abreviatura());
        unidadMedida.setTipo(dto.tipo());
        unidadMedida.setDescripcion(dto.descripcion());
        unidadMedida.setActivo(true);

        UnidadMedida guardada = unidadMedidaRepository.save(unidadMedida);
        return mapToResponse(guardada);
    }

    public UnidadMedidaResponseDto actualizar(Long id, ActualizarUnidadMedidaRequestDto dto) {
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + id));

        // Validar nombre único (si cambió)
        if (!dto.nombre().equals(unidadMedida.getNombre()) &&
                unidadMedidaRepository.existsByNombreAndIdNot(dto.nombre(), id)) {
            throw new IllegalStateException("Ya existe una unidad de medida con el nombre: " + dto.nombre());
        }

        // Validar abreviatura única (si cambió)
        if (!dto.abreviatura().equals(unidadMedida.getAbreviatura()) &&
                unidadMedidaRepository.existsByAbreviaturaAndIdNot(dto.abreviatura(), id)) {
            throw new IllegalStateException("Ya existe una unidad de medida con la abreviatura: " + dto.abreviatura());
        }

        unidadMedida.setNombre(dto.nombre());
        unidadMedida.setAbreviatura(dto.abreviatura());
        unidadMedida.setTipo(dto.tipo());
        unidadMedida.setDescripcion(dto.descripcion());

        if (dto.activo() != null) {
            unidadMedida.setActivo(dto.activo());
        }

        UnidadMedida actualizada = unidadMedidaRepository.save(unidadMedida);
        return mapToResponse(actualizada);
    }

    public List<UnidadMedidaResponseDto> listarActivas() {
        return unidadMedidaRepository.findByActivoTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public UnidadMedidaResponseDto obtenerPorId(Long id) {
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + id));
        return mapToResponse(unidadMedida);
    }

    public void eliminarLogico(Long id) {
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + id));

        // Validar que no este siendo usada por productos antes de desactivar
        unidadMedida.setActivo(false);
        unidadMedidaRepository.save(unidadMedida);
    }

    public void restaurar(Long id) {
        UnidadMedida unidadMedida = unidadMedidaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Unidad de medida no encontrada con ID: " + id));
        unidadMedida.setActivo(true);
        unidadMedidaRepository.save(unidadMedida);
    }

    public List<UnidadMedidaResponseDto> listarPorTipo(TipoUnidad tipo) {
        return unidadMedidaRepository.findByTipoAndActivoTrue(tipo).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private UnidadMedidaResponseDto mapToResponse(UnidadMedida unidadMedida) {
        return new UnidadMedidaResponseDto(
                unidadMedida.getId(),
                unidadMedida.getNombre(),
                unidadMedida.getAbreviatura(),
                unidadMedida.getTipo(),
                unidadMedida.getDescripcion(),
                unidadMedida.getActivo(),
                unidadMedida.getCreatedAt(),
                unidadMedida.getUpdatedAt()
        );
    }
}