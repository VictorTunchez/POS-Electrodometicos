import { useState } from 'react'
import './App.css'
import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChangePassword from "./components/ChangePassword";

function App() {
  const [count, setCount] = useState(0)

  return (
       <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/cambiar-contrasena" element={<ChangePassword />} />
            </Routes>
          </BrowserRouter>
  )

}

export default App

