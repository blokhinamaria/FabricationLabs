import { useLayoutEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { AvailabilityProvider } from './AvailabilityContext.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import './App.css'

import Layout from './components/Layout.jsx';
import Login from './components/content-components/Login.jsx';

// students + faculty
const Dashboard = lazy(() => import('./components/content-components/Dashboard.jsx'))
const NewAppointment = lazy(() => import('./components/content-components/NewAppointment.jsx'))
const EditAppointment = lazy(() => import('./components/content-components/EditAppointment.jsx'))
// import Dashboard from './components/content-components/Dashboard.jsx';
// import NewAppointment from './components/content-components/NewAppointment.jsx';
// import EditAppointment from './components/content-components/EditAppointment.jsx';

//faculty
const NewReservation = lazy(() => import('./components/content-components/NewReservation.jsx'))
// import NewReservation from  './components/content-components/NewReservation.jsx';

//admin
const AdminDashboard = lazy(() => import('./components/content-components/AdminDashboard.jsx'))
const Equipment = lazy(() => import('./components/content-components/Admin-components/Equipment.jsx'))
const EditEquipment = lazy(() => import('./components/content-components/Admin-components/EditEquipment.jsx'))
const Schedule = lazy(() => import('./components/content-components/Admin-components/Schedule.jsx'))
// import AdminDashboard from './components/content-components/AdminDashboard.jsx';
// import Equipment from './components/content-components/Admin-components/Equipment.jsx';
// import EditEquipment from './components/content-components/Admin-components/EditEquipment.jsx';
// import Schedule from './components/content-components/Admin-components/Schedule.jsx';

function App() {

  const LoadingFallBack = () => {
    return <div>Loading...</div>
  }

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
            <Suspense fallback={<LoadingFallBack/>}>
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
                        <Equipment />
                      </ProtectedRoute>
                    } />
                  
                  <Route element={<AvailabilityProvider><Outlet /></AvailabilityProvider>}>
                    <Route path="admin-dashboard/schedule" element={
                      <ProtectedRoute allowedRoles={['admin', 'demo-admin']}>
                        <Schedule />
                      </ProtectedRoute>
                      } /> 
                  </Route>
                  
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
