import React from "react";

function FiltersSection({ searchTerm, setSearchTerm, viewMode, setViewMode }) {
  return (
    <div className="search-section">
      <div className="input-group search-box">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar rol por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="view-toggle mt-3">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === 'activos' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('activos')}
          >
            Roles Activos
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('todos')}
          >
            Todos los Roles
          </button>
        </div>
      </div>
    </div>
  );
}

export default FiltersSection;