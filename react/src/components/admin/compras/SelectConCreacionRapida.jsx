import React from "react";

const SelectConCreacionRapida = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Seleccionar...", 
  tipo,
  disabled = false,
  error = null,
  labelCrear = "Crear nuevo...",
  onOpenQuickModal
}) => {
  const handleChange = (e) => {
    if (e.target.value === "crear-nuevo") {
      onOpenQuickModal();
      // Mantener el valor anterior
      e.target.value = value || "";
    } else {
      const numericValue = e.target.value === "" ? 0 : parseInt(e.target.value);
      onChange(numericValue);
    }
  };

  return (
    <div className="position-relative">
      <select
        className={`form-select ${error ? 'is-invalid' : ''}`}
        value={value} // value ya será número desde el padre
        onChange={handleChange}
        required
        disabled={disabled}
      >
        <option value="0">{placeholder}</option> {/* Cambiado a 0 */}
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.razonSocial || option.nombreSucursal || option.nombreProducto || option.nombre}
          </option>
        ))}
        <option value="crear-nuevo" className="fw-bold text-primary">
          + {labelCrear}
        </option>
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default SelectConCreacionRapida;