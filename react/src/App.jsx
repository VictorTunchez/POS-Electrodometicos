import { useState } from 'react'
import './App.css'
import FormularioLogin from "./components/FormularioLogin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FormularioCambiarContrasena from "./components/FormularioCambiarContrasena";
import PanelPrincipal from "./components/PanelPrincipal"

function App() {
  const [count, setCount] = useState(0)

  return (
       <BrowserRouter>
            <Routes>
              <Route path="/" element={<FormularioLogin />} />
              <Route path="/cambiar-contrasena" element={<FormularioCambiarContrasena />} />
              <Route path="/panel" element={<PanelPrincipal />} />
            </Routes>
          </BrowserRouter>
  )

}

export default App

