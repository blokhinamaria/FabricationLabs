import { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Layout from './components/Layout';
import Login from './components/content-components/Login';
import Dashboard from './components/content-components/Dashboard';


import './App.css'
import NewAppointment from './components/content-components/NewAppointment';
import EditAppointment from './components/content-components/EditAppointment';
import NewReservation from  './components/content-components/NewReservation';

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
                <Route path='dashboard/newappointment' element={<NewAppointment />} />
                <Route path='dashboard/editappointment' element={<EditAppointment />} />
                <Route path='dashboard/newreservation' element={<NewReservation />} />
            </Route>
            </Routes>
          </Wrapper>
        </AuthProvider>
      </Router>
      
    </>
  )
}

export default App
