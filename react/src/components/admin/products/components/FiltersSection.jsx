import React from "react";

const FiltersSection = ({ 
  filters, 
  categorias, 
  sucursales, 
  onFiltersChange, 
  onSucursalChange, 
  onViewModeChange,
  inventarioCargado 
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  const handleSucursalChange = (sucursalId) => {
    handleFilterChange('selectedSucursal', sucursalId);
    onSucursalChange(sucursalId);
  };

  const handleViewModeChange = (nuevoModo) => {
    handleFilterChange('viewMode', nuevoModo);
    onViewModeChange(nuevoModo);
  };

  return (
    <div className="search-section">
      <div className="input-group search-box">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar producto por nombre, descripción o código de barras..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
        />
      </div>

      <div className="filters-row mt-3">
        <div className="row g-3">
          <div className="col-md-2">
            <label htmlFor="filterCategoria" className="form-label">Categoría</label>
            <select
              className="form-select"
              id="filterCategoria"
              value={filters.filterCategoria}
              onChange={(e) => handleFilterChange('filterCategoria', e.target.value)}
            >
              <option value="TODAS">Todas</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombreCategoria}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-2">
            <label htmlFor="selectedSucursal" className="form-label">
              Sucursal 
              {!inventarioCargado && <span className="text-warning ms-1">*</span>}
            </label>
            <select
              className="form-select"
              id="selectedSucursal"
              value={filters.selectedSucursal}
              onChange={(e) => handleSucursalChange(e.target.value)}
              disabled={!inventarioCargado}
            >
              <option value="TODAS">Todas</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombreSucursal}
                </option>
              ))}
            </select>
            {!inventarioCargado && (
              <small className="text-muted">Cargando inventario...</small>
            )}
          </div>
          
          <div className="col-md-2">
            <label htmlFor="stockFilter" className="form-label">Estado Stock</label>
            <select
              className="form-select"
              id="stockFilter"
              value={filters.stockFilter}
              onChange={(e) => handleFilterChange('stockFilter', e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="CON_STOCK">Con Stock</option>
              <option value="SIN_STOCK">Sin Stock</option>
              <option value="STOCK_BAJO">Stock Bajo</option>
            </select>
          </div>
          
          <div className="col-md-2">
            <label htmlFor="filterDestacados" className="form-label">Destacados</label>
            <div className="form-check form-switch mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="filterDestacados"
                checked={filters.filterDestacados}
                onChange={(e) => handleFilterChange('filterDestacados', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="filterDestacados">
                Solo destacados
              </label>
            </div>
          </div>
          
          <div className="col-md-2">
            <label className="form-label d-block">Vista</label>
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${filters.viewMode === 'activos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleViewModeChange('activos')}
              >
                Activos
              </button>
              <button
                type="button"
                className={`btn ${filters.viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleViewModeChange('todos')}
              >
                Todos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;