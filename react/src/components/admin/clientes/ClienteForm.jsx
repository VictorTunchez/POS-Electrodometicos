import React, { useState, useEffect } from "react";

const ClienteForm = ({ cliente, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    tipoDocumento: "CUI", // Cambiado a CUI por defecto para Guatemala
    numeroDocumento: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Tipos de documento para Guatemala
  const tiposDocumento = [
    { value: "CUI", label: "CUI (DPI)" },
    { value: "NIT", label: "NIT" },
    { value: "PASAPORTE", label: "Pasaporte" },
    { value: "CEDULA", label: "Cédula" },
    { value: "LICENCIA", label: "Licencia" },
    { value: "OTRO", label: "Otro" }
  ];

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        tipoDocumento: cliente.tipoDocumento || "CUI", // Cambiado a CUI por defecto
        numeroDocumento: cliente.numeroDocumento || ""
      });
    }
  }, [cliente]);

  // Validaciones específicas para documentos guatemaltecos
  const validarDocumento = (tipo, numero) => {
    if (!numero.trim()) return "El número de documento es requerido";

    switch (tipo) {
      case "CUI":
        // CUI guatemalteco: 13 dígitos
        if (!/^\d{13}$/.test(numero.replace(/\s/g, ''))) {
          return "El CUI debe tener exactamente 13 dígitos";
        }
        break;
      
      case "NIT":
        // NIT guatemalteco: 8 dígitos + guión + 1 dígito (12345678-9)
        if (!/^\d{8}-\d$/.test(numero)) {
          return "El NIT debe tener formato: 12345678-9";
        }
        break;
      
      case "PASAPORTE":
        // Pasaporte: mínimo 6 caracteres, letras y números
        if (!/^[A-Z0-9]{6,20}$/i.test(numero)) {
          return "El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos";
        }
        break;
      
      case "CEDULA":
        // Cédula: variado, pero mínimo 5 caracteres
        if (numero.length < 5) {
          return "La cédula debe tener al menos 5 caracteres";
        }
        break;
      
      case "LICENCIA":
        // Licencia: variado, pero mínimo 5 caracteres
        if (numero.length < 5) {
          return "La licencia debe tener al menos 5 caracteres";
        }
        break;
      
      case "OTRO":
        // Otro: mínimo 3 caracteres
        if (numero.length < 3) {
          return "El documento debe tener al menos 3 caracteres";
        }
        break;
      
      default:
        break;
    }
    
    return null;
  };

  // Formatear automáticamente el NIT
  const formatearNIT = (valor) => {
    if (formData.tipoDocumento === "NIT") {
      // Remover todo excepto números
      const soloNumeros = valor.replace(/[^\d]/g, '');
      
      // Aplicar formato: 12345678-9
      if (soloNumeros.length <= 8) {
        return soloNumeros;
      } else if (soloNumeros.length === 9) {
        return `${soloNumeros.slice(0, 8)}-${soloNumeros.slice(8)}`;
      } else {
        return `${soloNumeros.slice(0, 8)}-${soloNumeros.slice(8, 9)}`;
      }
    }
    return valor;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorFinal = value;

    // Aplicar formato automático para NIT
    if (name === "numeroDocumento" && formData.tipoDocumento === "NIT") {
      valorFinal = formatearNIT(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: valorFinal
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Limpiar error específico del número de documento si cambia
    if (name === "numeroDocumento" && errors.numeroDocumento) {
      setErrors(prev => ({
        ...prev,
        numeroDocumento: ""
      }));
    }

    // Si cambia el tipo de documento, limpiar validación del número
    if (name === "tipoDocumento" && errors.numeroDocumento) {
      setErrors(prev => ({
        ...prev,
        numeroDocumento: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.length > 255) {
      newErrors.nombre = "El nombre no puede exceder los 255 caracteres";
    }

    // Validar email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    } else if (formData.email && formData.email.length > 255) {
      newErrors.email = "El email no puede exceder los 255 caracteres";
    }

    // Validar teléfono (formato guatemalteco)
    if (formData.telefono && !/^[0-9+\-\s()]{8,20}$/.test(formData.telefono)) {
      newErrors.telefono = "El formato del teléfono no es válido";
    }

    // Validar dirección
    if (formData.direccion && formData.direccion.length > 500) {
      newErrors.direccion = "La dirección no puede exceder los 500 caracteres";
    }

    // Validar tipo de documento
    if (!formData.tipoDocumento) {
      newErrors.tipoDocumento = "El tipo de documento es requerido";
    }

    // Validar número de documento con reglas específicas de Guatemala
    const errorDocumento = validarDocumento(formData.tipoDocumento, formData.numeroDocumento);
    if (errorDocumento) {
      newErrors.numeroDocumento = errorDocumento;
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

  // Texto de ayuda para el documento según el tipo
  const getDocumentoHelpText = () => {
    switch (formData.tipoDocumento) {
      case "CUI":
        return "13 dígitos (ej: 1234567890123)";
      case "NIT":
        return "Formato: 12345678-9";
      case "PASAPORTE":
        return "Mínimo 6 caracteres alfanuméricos";
      case "CEDULA":
        return "Mínimo 5 caracteres";
      case "LICENCIA":
        return "Mínimo 5 caracteres";
      case "OTRO":
        return "Mínimo 3 caracteres";
      default:
        return "";
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-person me-2"></i>
            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
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
            {/* Nombre */}
            <div className="col-md-6">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre completo"
                disabled={loading}
                maxLength={255}
              />
              {errors.nombre && (
                <div className="invalid-feedback">{errors.nombre}</div>
              )}
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                disabled={loading}
                maxLength={255}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Tipo Documento */}
            <div className="col-md-6">
              <label className="form-label">Tipo Documento *</label>
              <select
                className={`form-select ${errors.tipoDocumento ? 'is-invalid' : ''}`}
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                disabled={loading}
              >
                {tiposDocumento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
              {errors.tipoDocumento && (
                <div className="invalid-feedback">{errors.tipoDocumento}</div>
              )}
            </div>

            {/* Número Documento */}
            <div className="col-md-6">
              <label className="form-label">Número Documento *</label>
              <input
                type="text"
                className={`form-control ${errors.numeroDocumento ? 'is-invalid' : ''}`}
                name="numeroDocumento"
                value={formData.numeroDocumento}
                onChange={handleChange}
                placeholder={`Ingrese el número de documento`}
                disabled={loading}
                maxLength={formData.tipoDocumento === "NIT" ? 10 : 50}
              />
              {errors.numeroDocumento && (
                <div className="invalid-feedback">{errors.numeroDocumento}</div>
              )}
              <small className="text-muted">
                {getDocumentoHelpText()}
              </small>
            </div>

            {/* Teléfono */}
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: +502 1234-5678"
                disabled={loading}
                maxLength={20}
              />
              {errors.telefono && (
                <div className="invalid-feedback">{errors.telefono}</div>
              )}
            </div>

            {/* Dirección */}
            <div className="col-md-6">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingrese la dirección completa"
                disabled={loading}
                maxLength={500}
              />
              {errors.direccion && (
                <div className="invalid-feedback">{errors.direccion}</div>
              )}
            </div>
          </div>

          {/* Información sobre documentos */}
          <div className="mt-3 p-3 bg-light rounded">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              <strong>Documentos en Guatemala:</strong> 
              <br/>
              • <strong>CUI/DPI</strong>: Documento Personal de Identificación (13 dígitos)
              <br/>
              • <strong>NIT</strong>: Número de Identificación Tributaria (Formato: 12345678-9)
              <br/>
              • <strong>Pasaporte</strong>: Para extranjeros o guatemaltecos
            </small>
          </div>

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
                  {cliente ? "Actualizando..." : "Registrando..."}
                </>
              ) : (
                <>
                  <i className={`bi ${cliente ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                  {cliente ? "Actualizar Cliente" : "Registrar Cliente"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClienteForm;