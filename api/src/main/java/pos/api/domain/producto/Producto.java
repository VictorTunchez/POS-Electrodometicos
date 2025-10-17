package pos.api.domain.producto;

import jakarta.persistence.*;
import lombok.*;
import pos.api.domain.listaPrecios.PrecioProducto;
import pos.api.domain.unidadMedida.UnidadMedida;
import pos.api.domain.categoria.Categoria;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @Column(name = "nombre_producto", nullable = false, length = 200)
    private String nombreProducto;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

//    @Column(name = "precio_compra", nullable = false, precision = 10, scale = 2)
//    private BigDecimal precioCompra;

//    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
//    private BigDecimal precioVenta;

    @Column(name = "ultimo_costo", precision = 10, scale = 2)
    private BigDecimal ultimoCosto = BigDecimal.ZERO;

    @Column(name = "costo_promedio", precision = 10, scale = 2)
    private BigDecimal costoPromedio = BigDecimal.ZERO;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrecioProducto> precios = new ArrayList<>();

    // NUEVO: Margen por defecto para cálculos automáticos
    @Column(name = "margen_default", precision = 5, scale = 2)
    private BigDecimal margenDefault = new BigDecimal("30.00"); // 30% por defecto

    @Column(nullable = true)
    private String imagen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    // NUEVO: Unidad de medida principal (venta) - OBLIGATORIA
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidad_medida_id", nullable = false)
    private UnidadMedida unidadMedida;

    // NUEVO: Unidad de compra  - para cuando compras en cajas y vendes en unidades
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_compra_id")
    private UnidadMedida unidadCompra;

    // NUEVO: Factor de conversión (ej: 1 caja = 4 unidades)
    @Column(name = "factor_conversion", precision = 10, scale = 4)
    private BigDecimal factorConversion;

    private Boolean destacado = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public boolean isActivo() {
        return deletedAt == null;
    }

    // NUEVO: Metodo para validar la consistencia de las unidades
    public void validarUnidades() {
        if (unidadCompra != null && factorConversion == null) {
            throw new IllegalStateException("El factor de conversión es obligatorio cuando se especifica unidad de compra");
        }
        if (unidadCompra != null && factorConversion != null && factorConversion.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("El factor de conversión debe ser mayor a cero");
        }
    }
}