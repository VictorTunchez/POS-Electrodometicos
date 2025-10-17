package pos.api.domain.unidadMedida;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UnidadMedidaDataInitializer {

    @Autowired
    private final IUnidadMedidaRepository unidadMedidaRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initUnidadesMedida() {
        if (unidadMedidaRepository.count() == 0) {
            List<UnidadMedida> unidades = List.of(
                    crearUnidad("Unidad", "UND", TipoUnidad.VENTA,
                            "Unidad individual de producto (solo venta)"),

                    crearUnidad("Caja", "CJ", TipoUnidad.AMBOS,
                            "Caja contenedora de múltiples unidades (compra y venta)"),

                    crearUnidad("Paquete", "PQT", TipoUnidad.COMPRA,
                            "Paquete de productos (solo compra)"),

                    crearUnidad("Kit", "KIT", TipoUnidad.VENTA,
                            "Conjunto de productos relacionados (venta)"),

                    crearUnidad("Servicio", "SRV", TipoUnidad.VENTA,
                            "Servicio técnico o instalación (solo venta)"),

                    crearUnidad("Par", "PAR", TipoUnidad.VENTA,
                            "Par de artículos (solo venta)"),

                    crearUnidad("Juego", "JGO", TipoUnidad.VENTA,
                            "Juego de productos (solo venta)")
            );

            unidadMedidaRepository.saveAll(unidades);
            System.out.println("Unidades de medida inicializadas correctamente");
        }
    }

    private UnidadMedida crearUnidad(String nombre, String abreviatura,
                                     TipoUnidad tipo, String descripcion) {
        UnidadMedida unidad = new UnidadMedida();
        unidad.setNombre(nombre);
        unidad.setAbreviatura(abreviatura);
        unidad.setTipo(tipo);
        unidad.setDescripcion(descripcion);
        unidad.setActivo(true);
        unidad.setCreatedAt(Instant.now());
        return unidad;
    }
}
