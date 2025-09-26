import { useMemo } from "react";

export const useProductosFilters = (
  productos,
  inventario,
  categorias,
  sucursales,
  selectedSucursal,
  inventarioCargado
) => {
  // Combinar datos de productos con inventario
  const productosConInventario = useMemo(() => {
    if (!inventarioCargado) {
      console.log("Inventario no cargado aún, mostrando productos básicos");
      // Mientras carga el inventario, mostrar productos sin información de inventario
      return productos.map(producto => ({
        ...producto,
        nombreCategoria: categorias.find(cat => 
          cat.id === producto.categoriaId || cat.id.toString() === producto.categoriaId?.toString()
        )?.nombreCategoria || "Sin categoría",
        inventario: [],
        stockTotal: 0,
        tieneStockBajo: false,
        tieneInventarioEnSucursal: false,
        inventarioCargado: false
      }));
    }

    console.log("Combinando productos con inventario cargado");
    return productos.map(producto => {
      const inventarioProducto = inventario.filter(inv => 
        inv.productoId === producto.id || inv.productoId === producto.id.toString()
      );
      
      const categoria = categorias.find(cat => 
        cat.id === producto.categoriaId || cat.id.toString() === producto.categoriaId?.toString()
      );
      
      return {
        ...producto,
        nombreCategoria: categoria?.nombreCategoria || "Sin categoría",
        inventario: inventarioProducto,
        stockTotal: inventarioProducto.reduce((total, inv) => total + (parseInt(inv.stockActual) || 0), 0),
        tieneStockBajo: inventarioProducto.some(inv => 
          (parseInt(inv.stockActual) || 0) <= (parseInt(inv.stockMinimo) || 0)
        ),
        tieneInventarioEnSucursal: selectedSucursal === "TODAS" 
          ? inventarioProducto.length > 0
          : inventarioProducto.some(inv => 
              inv.sucursalId?.toString() === selectedSucursal.toString()
            ),
        inventarioCargado: true
      };
    });
  }, [productos, inventario, categorias, selectedSucursal, inventarioCargado]);

  // Función para obtener nombre de sucursal
  const obtenerNombreSucursal = (sucursalId) => {
    const sucursal = sucursales.find(s => 
      s.id === sucursalId || s.id.toString() === sucursalId?.toString()
    );
    return sucursal?.nombreSucursal || "Sucursal desconocida";
  };

 
  const filtrarProductos = useMemo(() => {
    return (productos, filters) => {
      const {
        searchTerm = "",
        filterCategoria = "TODAS",
        filterDestacados = false,
        stockFilter = "TODOS",
        viewMode = "activos",
        selectedSucursal = "TODAS"
      } = filters;

      return productos.filter(producto => {
        const matchesSearch =
          producto.nombreProducto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.descripcion && producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (producto.codigoBarras && producto.codigoBarras.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategoria = filterCategoria === "TODAS" || producto.categoriaId?.toString() === filterCategoria;
        const matchesDestacados = !filterDestacados || producto.destacado;
        const matchesStock =
          stockFilter === "TODOS" ||
          (stockFilter === "CON_STOCK" && producto.stockTotal > 0) ||
          (stockFilter === "SIN_STOCK" && producto.stockTotal === 0) ||
          (stockFilter === "STOCK_BAJO" && producto.tieneStockBajo);
        const matchesViewMode = viewMode === "todos" || producto.activo !== false;
        const matchesSucursal = selectedSucursal === "TODAS" 
          ? true
          : producto.tieneInventarioEnSucursal;

        return matchesSearch && matchesCategoria && 
               matchesDestacados && matchesStock && matchesViewMode && matchesSucursal;
      });
    };
  }, []);

  return {
    productosConInventario,
    obtenerNombreSucursal,
    filtrarProductos
  };
};
