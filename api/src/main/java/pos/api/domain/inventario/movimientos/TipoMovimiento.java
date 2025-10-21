package pos.api.domain.inventario.movimientos;

public enum TipoMovimiento {
    ENTRADA,           // Para compras
    SALIDA,            // Para ventas
    AJUSTE_ENTRADA,    // Para ajustes positivos
    AJUSTE_SALIDA,     // Para ajustes negativos
    TRASLADO_ENTRADA,  // NUEVO: Entrada por traslado entre sucursales
    TRASLADO_SALIDA    // NUEVO: Salida por traslado entre sucursales
}
