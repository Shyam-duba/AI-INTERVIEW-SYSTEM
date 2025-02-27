import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function Logout() {
  localStorage.clear()
  return <Navigate to='/login'></Navigate>
}

function RegisterAndLogout(){
  localStorage.clear()
  return <Register />
}

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
              <ProtectedRoute>
                <Home></Home>
              </ProtectedRoute>
          }
        ></Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />}/>
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
