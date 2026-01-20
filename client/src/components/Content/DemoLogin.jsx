import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL} from '../../config';
import LoadingOrbit from '../Icons/LoadingOrbit.jsx';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';


export default function DemoLogin() {


const [ errorMessage, setErrorMessage ] = useState('');

const [ authInProgress, setAuthInProgress] = useState(false);

const navigate = useNavigate()

function handleTryEmail() {
    setErrorMessage('')
    navigate('/')
    setAuthInProgress(false)
}

async function handleDemoLogin(role) {
    setErrorMessage('')
    
    if (!role) {
        setErrorMessage('Role required')
        return
    }

    try {
        setAuthInProgress(true);
        const response = await fetch(`${API_URL}/api/login/demo`, {
            credentials: 'include',
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ role: role })
        });
        const data = await response.json();
        if (!response.ok) {
            setErrorMessage(data.error)
            return
        }
        window.location.assign(data.redirect);
    } catch (err) {
        setErrorMessage('Something went wrong. Please try again later')
        console.log(err)
    }
}

function handleTryAgain() {
    setErrorMessage('');
    setAuthInProgress(false);
}

return (
    <main className='flow-lg'>
        {!authInProgress ?
            <>
                <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
                <article>
                    <section className='wide flow'>
                        <h3>Choose an account</h3>
                        <button onClick={() => handleDemoLogin('faculty')}>Demo Faculty</button>
                        <button onClick={() => handleDemoLogin('admin')}>Demo Admin</button>
                        <button onClick={() => handleDemoLogin('student')}>Demo Student</button>
                    </section>
                    {errorMessage && <p>{errorMessage}</p>}
                    <p><a onClick={handleTryEmail}>Or Sign In with UTampa Email Here</a></p>

                </article>
            </>
            : 
            <>  
                <Tooltip 
                    title={"The application may take a short moment to initialize. Thank you for your patience."}
                    arrow
                    placement="right"
                    followCursor
                    slots={{transition: Zoom,}}
                    >
                    <h2>
                        Loading Your Workspace...
                    </h2>
                    <LoadingOrbit />
                </Tooltip>
                {errorMessage && 
                    <div className='flow'>
                        <p>{errorMessage}</p>
                        <p><a onClick={handleTryAgain}>Try Demo Again</a></p>
                        <p><a onClick={handleTryEmail}>Or Sign In with UTampa Email Here</a></p>
                    </div>
                }
            </>
        }
    </main>
)
}