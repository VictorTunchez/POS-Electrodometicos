// src/utils/validaciones.js

export const validarEmail = (email) => {
  if (!email) return "El correo es obligatorio";

  const emailLimpio = email.replace(/\s+/g, ''); // elimina cualquier espacio interno

  if (!/\S+@\S+\.\S+/.test(emailLimpio)) return "Formato de correo inválido";

  return null;
};

export const validarContrasena = (contrasena) => {
  if (!contrasena) return "La contraseña es obligatoria";

   // quitar espacios internos antes de validar
    const contrasenaLimpia = contrasena.replace(/\s+/g, '');

  // Regex: al menos 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  if (!regex.test(contrasenaLimpia)) {
    return "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial";
  }

  return null;
};
