import React from "react";

const FiltersSection = ({ filters, onFiltersChange, onViewModeChange }) => {
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

  // Handler para el toggle switch
  const handleViewModeToggle = (nuevoModo) => {
    onViewModeChange(nuevoModo);
  };

  return (
    <div className="search-section">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Tipo de búsqueda</label>
          <select
            className="form-select"
            value={filters.searchType}
            onChange={handleSearchTypeChange}
          >
            <option value="razonSocial">Razón Social</option>
            <option value="nit">NIT</option>
          </select>
        </div>
        
        <div className="col-md-4">
          <label className="form-label">Buscar</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder={`Buscar por ${filters.searchType === 'razonSocial' ? 'razón social' : 'NIT'}...`}
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label">Estado</label>
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${filters.viewMode === 'activos' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleViewModeToggle('activos')}
            >
              Activos
            </button>
            <button
              type="button"
              className={`btn ${filters.viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleViewModeToggle('todos')}
            >
              Todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;