export const handleApiError = (error, defaultMessage = 'Error en la operación') => {
  if (error.response?.data) {
    const errorData = error.response.data;

    // Manejar estructura ErrorResponse de Spring Boot (con campo 'mensaje')
    if (errorData.mensaje) {
      if (errorData.detalles && Object.keys(errorData.detalles).length > 0) {
        const detalles = Object.values(errorData.detalles).join(', ');
        return `${errorData.mensaje}: ${detalles}`;
      }
      return errorData.mensaje;
    }

    // Manejar otros formatos de error comunes
    if (errorData.message) {
      return errorData.message;
    }

    if (errorData.error) {
      return errorData.error;
    }

    // Si el backend devuelve un string simple
    if (typeof errorData === 'string') {
      return errorData;
    }
  }

  // Para errores de red o otros tipos
  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};