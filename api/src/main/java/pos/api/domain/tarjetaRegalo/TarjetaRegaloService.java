package pos.api.domain.tarjetaRegalo;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TarjetaRegaloService {

    private final ITarjetaRegaloRepository tarjetaRepository;

    private String usuarioActual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public TarjetaRegaloResponseDto crear(TarjetaRegaloRequestDto dto) {

        if (tarjetaRepository.existsByCodigoAndDeletedAtIsNull(dto.codigo())) {
            throw new IllegalStateException("Ya existe una tarjeta con el código: " + dto.codigo());
        }

        TarjetaRegalo t = new TarjetaRegalo();
        t.setCodigo(dto.codigo());
        t.setMontoInicial(dto.montoInicial());
        t.setSaldoActual(dto.montoInicial());
        t.setMoneda(dto.moneda());
        t.setFechaEmision(Instant.now());
        t.setFechaExpiracion(dto.fechaExpiracion());
        t.setEstado(EstadoTarjeta.ACTIVA);

        t.setCreadoPor(usuarioActual());

        return mapToResponse(tarjetaRepository.save(t));
    }

    public List<TarjetaRegaloResponseDto> listar() {
        return tarjetaRepository.findByDeletedAtIsNull()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TarjetaRegaloResponseDto obtener(Long id) {
        TarjetaRegalo t = tarjetaRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada: " + id));
        return mapToResponse(t);
    }

    @Transactional
    public TarjetaRegaloResponseDto actualizar(Long id, ActualizarTarjetaRegaloRequestDto dto) {

        TarjetaRegalo t = tarjetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada: " + id));

        if (t.getEstado() == EstadoTarjeta.ANULADA || t.getEstado() == EstadoTarjeta.EXPIRADA) {
            throw new IllegalStateException("No se puede modificar una tarjeta anulada o expirada");
        }

        if (tarjetaRepository.existsByCodigoAndIdNotAndDeletedAtIsNull(dto.codigo(), id)) {
            throw new IllegalStateException("El código ya está en uso: " + dto.codigo());
        }

        t.setCodigo(dto.codigo());
        t.setFechaExpiracion(dto.fechaExpiracion());
        t.setModificadoPor(usuarioActual());

        return mapToResponse(tarjetaRepository.save(t));
    }

    @Transactional
    public void anular(Long id) {

        TarjetaRegalo t = tarjetaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada: " + id));

        if (t.getEstado() == EstadoTarjeta.ANULADA) {
            throw new IllegalStateException("La tarjeta ya está anulada");
        }

        t.setEstado(EstadoTarjeta.ANULADA);
        t.setEliminadoPor(usuarioActual());
        t.setDeletedAt(Instant.now());

        tarjetaRepository.save(t);
    }

    private TarjetaRegaloResponseDto mapToResponse(TarjetaRegalo t) {
        return new TarjetaRegaloResponseDto(
                t.getId(),
                t.getCodigo(),
                t.getMontoInicial(),
                t.getSaldoActual(),
                t.getMoneda(),
                t.getFechaEmision(),
                t.getFechaExpiracion(),
                t.getEstado(),
                t.getCreadoPor(),
                t.getCreatedAt(),
                t.getModificadoPor(),
                t.getUpdatedAt(),
                t.getEliminadoPor(),
                t.getDeletedAt()
        );
    }
}

