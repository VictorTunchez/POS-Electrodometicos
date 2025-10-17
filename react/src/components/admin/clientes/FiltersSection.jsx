import React from "react";

const FiltersSection = ({ filters, onFiltersChange }) => {
  // Tipos de documento específicos de Guatemala
  const tiposDocumento = [
    { value: "TODOS", label: "Todos los documentos" },
    { value: "CUI", label: "CUI (DPI)" },
    { value: "NIT", label: "NIT" },
    { value: "PASAPORTE", label: "Pasaporte" },
    { value: "CEDULA", label: "Cédula" },
    { value: "LICENCIA", label: "Licencia" },
    { value: "OTRO", label: "Otro" }
  ];

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

  const handleTipoDocumentoChange = (e) => {
    onFiltersChange({
      ...filters,
      tipoDocumento: e.target.value
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
              <option value="nombre">Nombre</option>
              <option value="documento">Documento</option>
              <option value="email">Email</option>
              <option value="telefono">Teléfono</option>
            </select>
          </div>
          
          <div className="col-md-3">
            <label className="form-label">Buscar</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder={
                  filters.searchType === 'nombre' ? 'Buscar por nombre...' :
                  filters.searchType === 'documento' ? 'Buscar por documento...' :
                  filters.searchType === 'email' ? 'Buscar por email...' :
                  'Buscar por teléfono...'
                }
                value={filters.searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Tipo de Documento - Actualizado para Guatemala */}
          <div className="col-md-2">
            <label className="form-label">Tipo Documento</label>
            <select
              className="form-select"
              value={filters.tipoDocumento || "TODOS"}
              onChange={handleTipoDocumentoChange}
            >
              {tiposDocumento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información sobre documentos guatemaltecos */}
        {/* <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Documentos en Guatemala: <strong>CUI/DPI</strong> (Documento Personal de Identificación), 
            <strong> NIT</strong> (Número de Identificación Tributaria)
          </small>
        </div> */}
      </div>
    </div>
  );
};

export default FiltersSection;