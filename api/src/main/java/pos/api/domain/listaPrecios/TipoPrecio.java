package pos.api.domain.listaPrecios;

public enum TipoPrecio {
    MINORISTA,  // Precio normal por unidad
    MAYORISTA,  // Precio por caja/paquete
    OFERTA,     // Precio promocional
    COSTO       // Precio de costo (solo para referencia interna)
}