import React from "react";

const FiltersSection = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (e) => {
    onFiltersChange({
      ...filters,
      searchTerm: e.target.value
    });
  };

  const handleSearchTypeChange = (e) => {
    onFiltersChange({
      ...filters,
      searchType: e.target.value
    });
  };

  const handleEstadoChange = (e) => {
    onFiltersChange({
      ...filters,
      estado: e.target.value
    });
  };

  const handleFechaInicioChange = (e) => {
    onFiltersChange({
      ...filters,
      fechaInicio: e.target.value
    });
  };

  const handleFechaFinChange = (e) => {
    onFiltersChange({
      ...filters,
      fechaFin: e.target.value
    });
  };

  return (
    <div className="search-section">
      <div className="row g-3 align-items-end">
        <div className="col-md-2">
          <label className="form-label">Tipo de búsqueda</label>
          <select
            className="form-select"
            value={filters.searchType}
            onChange={handleSearchTypeChange}
          >
            <option value="numeroFactura">N° Factura</option>
            <option value="proveedor">Proveedor</option>
            <option value="sucursal">Sucursal</option>
          </select>
        </div>
        
        <div className="col-md-3">
          <label className="form-label">Buscar</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={`Buscar por ${filters.searchType === 'numeroFactura' ? 'número de factura' : filters.searchType === 'proveedor' ? 'proveedor' : 'sucursal'}...`}
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="col-md-2">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={filters.estado}
            onChange={handleEstadoChange}
          >
            <option value="TODOS">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RECIBIDA">Recibida</option>
            <option value="PARCIALMENTE_RECIBIDA">Parcialmente Recibida</option>
            <option value="CANCELADA">Cancelada</option>
            {/* <option value="FACTURADA">Facturada</option> */}
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">Fecha Inicio</label>
          <input
            type="date"
            className="form-control"
            value={filters.fechaInicio}
            onChange={handleFechaInicioChange}
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">Fecha Fin</label>
          <input
            type="date"
            className="form-control"
            value={filters.fechaFin}
            onChange={handleFechaFinChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;