import { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AppProviders } from './AppProviders.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { AvailabilityProvider } from './AvailabilityContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './components/content-components/Login.jsx';
import Dashboard from './components/content-components/Dashboard.jsx';
import AdminDashboard from './components/content-components/AdminDashboard.jsx';

import './App.css'
import NewAppointment from './components/content-components/NewAppointment.jsx';
import EditAppointment from './components/content-components/EditAppointment.jsx';
import NewReservation from  './components/content-components/NewReservation.jsx';
import Equipment from './components/content-components/Admin-components/Equipment.jsx';
import EditEquipment from './components/content-components/Admin-components/EditEquipment.jsx';
import Schedule from './components/content-components/Admin-components/Schedule.jsx';

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
            <Routes>
              <Route path='/' element={<Layout />}>
                <Route index element={<Login />} />
                <Route path='dashboard' element={<Dashboard />} />
                <Route element={<AvailabilityProvider><Outlet /></AvailabilityProvider>}>
                  <Route path='dashboard/newappointment' element={<NewAppointment />} />
                  <Route path='dashboard/editappointment' element={<EditAppointment />} />
                  <Route path='dashboard/newreservation' element={<NewReservation />} />
                </Route>
                <Route path="admin-dashboard" element={<AdminDashboard />} />
                <Route path="admin-dashboard/equipment" element={<Equipment />} />
                <Route path="admin-dashboard/equipment/edit" element={<EditEquipment />} />
                <Route element={<AvailabilityProvider><Outlet /></AvailabilityProvider>}>
                  <Route path="admin-dashboard/schedule" element={<Schedule />} />
                </Route>
            </Route>
            </Routes>
          </Wrapper>
        </AuthProvider>
      </Router>
      
    </>
  )
}

export default App
