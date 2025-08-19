import { useState } from 'react'
import './App.css'
import FormularioLogin from "./components/FormularioLogin";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChangePassword from "./components/FormularioCambiarContrasena";

function App() {
  const [count, setCount] = useState(0)

  return (
       <BrowserRouter>
            <Routes>
              <Route path="/" element={<FormularioLogin />} />
              <Route path="/cambiar-contrasena" element={<ChangePassword />} />
            </Routes>
          </BrowserRouter>
  )

}

export default App

