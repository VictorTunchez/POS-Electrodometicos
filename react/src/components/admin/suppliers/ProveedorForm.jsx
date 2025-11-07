import React, { useState, useEffect } from "react";

const ProveedorForm = ({ proveedor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    razonSocial: "",
    nombreComercial: "",
    nit: "",
    direccion: "",
    departamento: "",
    municipio: "",
    telefono: "",
    email: "",
    contactoNombre: "",
    contactoTelefono: "",
    observaciones: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Lista de departamentos de Guatemala
  const departamentos = [
    "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", 
    "El Progreso", "Escuintla", "Guatemala", "Huehuetenango", 
    "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango", 
    "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", 
    "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
  ];

  useEffect(() => {
    if (proveedor) {
      setFormData({
        razonSocial: proveedor.razonSocial || "",
        nombreComercial: proveedor.nombreComercial || "",
        nit: proveedor.nit || "",
        direccion: proveedor.direccion || "",
        departamento: proveedor.departamento || "",
        municipio: proveedor.municipio || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        contactoNombre: proveedor.contactoNombre || "",
        contactoTelefono: proveedor.contactoTelefono || "",
        observaciones: proveedor.observaciones || ""
      });
    }
  }, [proveedor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de Razón Social
    if (!formData.razonSocial.trim()) {
      newErrors.razonSocial = "La razón social es obligatoria";
    } else if (formData.razonSocial.length > 200) {
      newErrors.razonSocial = "La razón social no puede exceder los 200 caracteres";
    }

    // Validación de NIT (formato guatemalteco: 1234567-8)
    if (!formData.nit.trim()) {
      newErrors.nit = "El NIT es obligatorio";
    } else if (!/^[0-9]{1,8}-[0-9kK]$/.test(formData.nit)) {
      newErrors.nit = "Formato de NIT inválido. Debe ser: 1234567-8";
    }

    // Validación de Email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    } else if (formData.email && formData.email.length > 100) {
      newErrors.email = "El email no puede exceder los 100 caracteres";
    }

    // Validación de Teléfono
    if (formData.telefono && !/^[0-9+\-\s()]{8,20}$/.test(formData.telefono)) {
      newErrors.telefono = "El formato del teléfono no es válido";
    }

    // Validación de Teléfono de Contacto
    if (formData.contactoTelefono && !/^[0-9+\-\s()]{8,20}$/.test(formData.contactoTelefono)) {
      newErrors.contactoTelefono = "El formato del teléfono de contacto no es válido";
    }

    // Validación de Departamento
    if (formData.departamento && formData.departamento.length > 50) {
      newErrors.departamento = "El departamento no puede exceder los 50 caracteres";
    }

    // Validación de Municipio
    if (formData.municipio && formData.municipio.length > 50) {
      newErrors.municipio = "El municipio no puede exceder los 50 caracteres";
    }

    // Validación de Dirección
    if (formData.direccion && formData.direccion.length > 300) {
      newErrors.direccion = "La dirección no puede exceder los 300 caracteres";
    }

    // Validación de Nombre Comercial
    if (formData.nombreComercial && formData.nombreComercial.length > 200) {
      newErrors.nombreComercial = "El nombre comercial no puede exceder los 200 caracteres";
    }

    // Validación de Contacto Nombre
    if (formData.contactoNombre && formData.contactoNombre.length > 100) {
      newErrors.contactoNombre = "El nombre del contacto no puede exceder los 100 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error en el formulario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-building me-2"></i>
            {proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h5>
          <button 
            className="btn-close" 
            onClick={onCancel}
            disabled={loading}
          ></button>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Razón Social */}
            <div className="col-md-6">
              <label htmlFor="razonSocial" className="form-label">
                Razón Social *
              </label>
              <input
                type="text"
                className={`form-control ${errors.razonSocial ? 'is-invalid' : ''}`}
                id="razonSocial"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Ingrese la razón social"
                maxLength={200}
              />
              {errors.razonSocial && (
                <div className="invalid-feedback">{errors.razonSocial}</div>
              )}
            </div>

            {/* Nombre Comercial */}
            <div className="col-md-6">
              <label htmlFor="nombreComercial" className="form-label">
                Nombre Comercial
              </label>
              <input
                type="text"
                className={`form-control ${errors.nombreComercial ? 'is-invalid' : ''}`}
                id="nombreComercial"
                name="nombreComercial"
                value={formData.nombreComercial}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Ingrese el nombre comercial"
                maxLength={200}
              />
              {errors.nombreComercial && (
                <div className="invalid-feedback">{errors.nombreComercial}</div>
              )}
            </div>

            {/* NIT */}
            <div className="col-md-6">
              <label htmlFor="nit" className="form-label">
                NIT *
                <small className="text-muted ms-1">→ Formato: 1234567-8</small>
              </label>
              <input
                type="text"
                className={`form-control ${errors.nit ? 'is-invalid' : ''}`}
                id="nit"
                name="nit"
                value={formData.nit}
                onChange={handleInputChange}
                disabled={loading}
                maxLength={15}
                placeholder="1234567-8"
              />
              {errors.nit && (
                <div className="invalid-feedback">{errors.nit}</div>
              )}
              <small className="text-muted">
                Número de Identificación Tributaria de Guatemala
              </small>
            </div>

            {/* Teléfono */}
            <div className="col-md-6">
              <label htmlFor="telefono" className="form-label">
                Teléfono Principal
              </label>
              <input
                type="text"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Ej: +502 1234-5678"
                maxLength={20}
              />
              {errors.telefono && (
                <div className="invalid-feedback">{errors.telefono}</div>
              )}
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="proveedor@empresa.com"
                maxLength={100}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Departamento */}
            <div className="col-md-6">
              <label htmlFor="departamento" className="form-label">
                Departamento
              </label>
              <select
                className={`form-control ${errors.departamento ? 'is-invalid' : ''}`}
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map(depto => (
                  <option key={depto} value={depto}>
                    {depto}
                  </option>
                ))}
              </select>
              {errors.departamento && (
                <div className="invalid-feedback">{errors.departamento}</div>
              )}
            </div>

            {/* Municipio */}
            <div className="col-md-6">
              <label htmlFor="municipio" className="form-label">
                Municipio
              </label>
              <input
                type="text"
                className={`form-control ${errors.municipio ? 'is-invalid' : ''}`}
                id="municipio"
                name="municipio"
                value={formData.municipio}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Ingrese el municipio"
                maxLength={50}
              />
              {errors.municipio && (
                <div className="invalid-feedback">{errors.municipio}</div>
              )}
            </div>

            {/* Dirección */}
            <div className="col-md-6">
              <label htmlFor="direccion" className="form-label">
                Dirección
              </label>
              <input
                type="text"
                className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Ingrese la dirección completa"
                maxLength={300}
              />
              {errors.direccion && (
                <div className="invalid-feedback">{errors.direccion}</div>
              )}
            </div>

            {/* Información de Contacto */}
            <div className="col-md-6">
              <label htmlFor="contactoNombre" className="form-label">
                Nombre del Contacto
              </label>
              <input
                type="text"
                className={`form-control ${errors.contactoNombre ? 'is-invalid' : ''}`}
                id="contactoNombre"
                name="contactoNombre"
                value={formData.contactoNombre}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Nombre de la persona de contacto"
                maxLength={100}
              />
              {errors.contactoNombre && (
                <div className="invalid-feedback">{errors.contactoNombre}</div>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="contactoTelefono" className="form-label">
                Teléfono del Contacto
              </label>
              <input
                type="text"
                className={`form-control ${errors.contactoTelefono ? 'is-invalid' : ''}`}
                id="contactoTelefono"
                name="contactoTelefono"
                value={formData.contactoTelefono}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Teléfono del contacto"
                maxLength={20}
              />
              {errors.contactoTelefono && (
                <div className="invalid-feedback">{errors.contactoTelefono}</div>
              )}
            </div>

            {/* Observaciones */}
            <div className="col-12">
              <label htmlFor="observaciones" className="form-label">
                Observaciones
              </label>
              <textarea
                className="form-control"
                id="observaciones"
                name="observaciones"
                rows="3"
                value={formData.observaciones}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Observaciones adicionales..."
              ></textarea>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  {proveedor ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>
                  <i className={`bi ${proveedor ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                  {proveedor ? "Actualizar Proveedor" : "Crear Proveedor"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProveedorForm;