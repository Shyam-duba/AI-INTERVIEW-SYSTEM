import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import InterviewPage from './pages/Interview'
import EditProfile from './pages/EditProfile'
import StartInterview from './pages/StartInterview'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import ReportsPage from './pages/ReportsPage'


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
          path="/"
          element={
              <ProtectedRoute>
                <Home></Home>
              </ProtectedRoute>
          }
        ></Route>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Register />}/>
        <Route path='/logout' element={<Logout />}/>
        <Route path='/interview' element={<StartInterview />}/>
        <Route path='/interview/:id' element={<InterviewPage />}/>
        <Route path='/edit-profile' element={<EditProfile />}/>
        <Route path='/resume-analyzer' element={<ResumeAnalyzer />}/>
        <Route path='/reports/:id' element={<ReportsPage />}/>
        {/* <Route path='/interview' element={<Chat />}/> */}
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
