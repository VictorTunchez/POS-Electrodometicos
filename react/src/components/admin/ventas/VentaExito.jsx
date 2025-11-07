// import React, { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useVentas } from './useVentas';

// const VentaExito = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const { confirmarPagoStripe, loading } = useVentas();
//   const [procesado, setProcesado] = useState(false);

//   const sessionId = searchParams.get('sessionId');

//   useEffect(() => {
//     const procesarPagoExitoso = async () => {
//       if (!sessionId) {
//         navigate('/panel/ventas');
//         return;
//       }

//       if (!procesado) {
//         setProcesado(true);
//         console.log("Procesando pago exitoso con sessionId:", sessionId);
        
//         try {
//           const resultado = await confirmarPagoStripe(sessionId);
          
//           if (resultado) {
//             console.log("Pago confirmado exitosamente:", resultado);
            
//             // Limpiar la URL
//             window.history.replaceState({}, document.title, window.location.pathname);
            
//             // Redirigir a Ventas con el estado de la venta confirmada
//             navigate('/panel/ventas', { 
//               state: { 
//                 mostrarConfirmacion: true,
//                 ventaConfirmada: resultado 
//               } 
//             });
//           } else {
//             navigate('/panel/ventas', { 
//               state: { 
//                 error: 'No se pudo confirmar el pago' 
//               } 
//             });
//           }
//         } catch (err) {
//           console.error("Error al procesar pago:", err);
//           navigate('/panel/ventas', { 
//             state: { 
//               error: 'Error al procesar el pago' 
//             } 
//           });
//         }
//       }
//     };

//     procesarPagoExitoso();
//   }, [sessionId, procesado, confirmarPagoStripe, navigate]);

//   if (loading) {
//     return (
//       <div className="venta-exito-container">
//         <div className="row justify-content-center">
//           <div className="col-md-6">
//             <div className="card shadow">
//               <div className="card-body text-center py-5">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Cargando...</span>
//                 </div>
//                 <p className="mt-3">Confirmando pago con Stripe...</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="venta-exito-container">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <div className="card shadow">
//             <div className="card-body text-center py-5">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Redirigiendo...</span>
//               </div>
//               <p className="mt-3">Procesando pago, por favor espere...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VentaExito;