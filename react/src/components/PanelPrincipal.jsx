
import React, { useEffect, useState } from "react";
import servicioAutenticacion from "../services/servicioAutenticacion";

 function PanelPrincipal() {
   const [saludo, setSaludo] = useState("");
   const [error, setError] = useState("");

   useEffect(() => {
     const fetchSaludo = async () => {
       try {
         const mensaje = await servicioAutenticacion.obtenerSaludo();
         setSaludo(mensaje);
       } catch (err) {
         setError("Acceso denegado: No se pudo obtener los datos");
       }
     };

     fetchSaludo();
   }, []);

   if (error) return <div>{error}</div>;

   return (
     <div className="panel-principal">
       <h2>{saludo}</h2>
     </div>
   );
 }

 export default PanelPrincipal;
