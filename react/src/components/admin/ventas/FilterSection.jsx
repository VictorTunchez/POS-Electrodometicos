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

  const handleFormaPagoChange = (e) => {
    onFiltersChange({
      ...filters,
      formaPago: e.target.value
    });
  };

  const handleTipoVentaChange = (e) => {
    onFiltersChange({
      ...filters,
      tipoVenta: e.target.value
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
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label">Tipo de búsqueda</label>
            <select
              className="form-select"
              value={filters.searchType}
              onChange={handleSearchTypeChange}
            >
              <option value="numeroFactura">N° Factura</option>
              <option value="cliente">Cliente</option>
              <option value="sucursal">Sucursal</option>
            </select>
          </div>
          
          <div className="col-md-2">
            <label className="form-label">Buscar</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={`Buscar por ${filters.searchType === 'numeroFactura' ? 'número de factura' : filters.searchType === 'cliente' ? 'cliente' : 'sucursal'}...`}
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
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Forma Pago</label>
            <select
              className="form-select"
              value={filters.formaPago}
              onChange={handleFormaPagoChange}
            >
              <option value="TODOS">Todos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              {/* <option value="MIXTO">Mixto</option> */}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Tipo Venta</label>
            <select
              className="form-select"
              value={filters.tipoVenta}
              onChange={handleTipoVentaChange}
            >
              <option value="TODOS">Todos</option>
              <option value="CONTADO">Contado</option>
              {/* <option value="CREDITO">Crédito</option> */}
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
    </div>
  );
};

export default FiltersSection;