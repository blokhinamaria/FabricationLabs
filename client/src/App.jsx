import { useLayoutEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { AvailabilityProvider } from './AvailabilityContext.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import './App.css'
import './styles/typography.css'
import './styles/buttons.css'
import './styles/form.css'
import './components/Content/Cards/card.css'
import './styles/dialog.css'

import Layout from './components/Layout.jsx';
import LoadingFallback from './components/Layout/LoadingFallback.jsx';
import Login from './components/Content/Login.jsx';
import Styles from './components/Layout/Styles.jsx';

// students + faculty
const Dashboard = lazy(() => import('./components/Content/User/Dashboard.jsx'))
const NewAppointment = lazy(() => import('./components/Content/User/NewAppointment.jsx'))
const EditAppointment = lazy(() => import('./components/Content/User/EditAppointment.jsx'))

//faculty
const NewReservation = lazy(() => import('./components/Content/User/NewReservation.jsx'))

//admin
const AdminDashboard = lazy(() => import('./components/Content/Admin/AdminDashboard.jsx'))
const Equipment = lazy(() => import('./components/Content/Admin/Equipment.jsx'))
const EditEquipment = lazy(() => import('./components/Content/Admin/EditEquipment.jsx'))
const Schedule = lazy(() => import('./components/Content/Admin/Schedule.jsx'))

function App() {

  //Scroll to the top of the page when the route changes
  const Wrapper = ({children}) => {
    const location = useLocation();

    useLayoutEffect(() => {
      window.scrollTo( {top: 0, left: 0, behavior: 'smooth'})
    }, [location.pathname]);
    return children;
  }

  return (
    <>
      <Router>
        <AuthProvider>
          <Wrapper>
            <Suspense fallback={<LoadingFallback/>}>
              <Routes>
                <Route path='/' element={<Layout />}>
                  <Route index element={<Login />} />

                  {/* Student/Faculty routes */}
                  <Route path='dashboard' element={
                    <ProtectedRoute allowedRoles={['student', 'faculty', 'demo-student', 'demo-faculty']}>
                      <Dashboard />
                    </ProtectedRoute>
                    } />


                  <Route element={<AvailabilityProvider><Outlet /></AvailabilityProvider>}>
                    <Route path='dashboard/newappointment' element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'demo-student', 'demo-faculty']}>
                        <NewAppointment />
                      </ProtectedRoute>
                      } />

                    <Route path='dashboard/editappointment' element={
                      <ProtectedRoute allowedRoles={['student', 'faculty', 'demo-student', 'demo-faculty']}>
                        <EditAppointment />
                      </ProtectedRoute>
                      } />

                    <Route path='dashboard/newreservation' element={
                      <ProtectedRoute allowedRoles={['faculty', 'demo-faculty']}>
                        <NewReservation />
                      </ProtectedRoute>
                      } />
                  </Route>


                  {/* Admin routes */}
                  <Route path="admin-dashboard" element={
                      <ProtectedRoute allowedRoles={['admin', 'demo-admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                  <Route path="admin-dashboard/equipment" element={
                      <ProtectedRoute allowedRoles={['admin', 'demo-admin']}>
                        <Equipment />
                      </ProtectedRoute>
                    } />

                  <Route path="admin-dashboard/equipment/edit" element={
                      <ProtectedRoute allowedRoles={['admin', 'demo-admin']}>
                        <EditEquipment />
                      </ProtectedRoute>
                    } />
                  
                  <Route element={<AvailabilityProvider><Outlet /></AvailabilityProvider>}>
                    <Route path="admin-dashboard/schedule" element={
                      <ProtectedRoute allowedRoles={['admin', 'demo-admin']}>
                        <Schedule />
                      </ProtectedRoute>
                      } /> 
                  </Route>
                  <Route path='/styles' element={<Styles/>} />
                </Route>
              </Routes>
            </Suspense>
          </Wrapper>
        </AuthProvider>
      </Router>
      
    </>
  )
}

export default App
