import { useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/content-components/Login';
import Dashboard from './components/content-components/Dashboard';


import './App.css'
import NewAppointment from './components/content-components/NewAppointment';

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
        <Wrapper>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route index element={<Login />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='dashboard/newappointment' element={<NewAppointment />} />
          </Route>
          </Routes>
        </Wrapper>
      </Router>
      
    </>
  )
}

export default App
