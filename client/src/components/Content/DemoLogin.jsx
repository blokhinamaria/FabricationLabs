import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_URL} from '../../config'

export default function DemoLogin() {

const [ userEmail, setUserEmail] = useState('');
const [ errorMessage, setErrorMessage ] = useState('');

const [ authInProgress, setAuthInProgress] = useState(false);
const [ password, setPassword ] = useState('')

const navigate = useNavigate()

//Form submission
async function handleSubmit(formData) {
    
    const email = formData.get('email');
    setErrorMessage('')

    if (email) {
        const isDemoUser = isDemo(email);
        if (isDemoUser) {
            return;
        }

        const isValid = isEmailValid(email);
        if (isValid) {
            setUserEmail(email);
        } else {
            setErrorMessage('Please enter valid UT email')
            return
        }
    } else if (email === '') {
        setErrorMessage('Please enter valid UT email')
        return
    } else {
        setErrorMessage('Invalid email')
        return
        }
    
    await requestLink(email)
}

function isEmailValid(email) {

    const regex = /^[A-Za-z0-9._%+-]+@(ut\.edu|spartans\.ut\.edu)$/;
    const result = regex.test(email);
        if(!result) {
            setErrorMessage('Email is not valid. Please, enter valid UT email');
            document.getElementById('email').classList.add('invalid');
            return false;
        } else {
            document.getElementById('email').style.borderColor = 'green';
            return true;
        }
}

function isDemo(email) {
    const demoRegex = /^demo-(student|faculty|admin)@fabricationlabs\.com$/
    const result = demoRegex.test(email)
    if (result) {
        setAuthInProgress(true);
        setDemoUserInterface(true);
        return true;
    }
    return false;
}

function handleTryAgain() {
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
        const response = await fetch(`${API_URL}/api/login/demo`, {
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

return (
    <main className='flow-lg'>
        <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
        <article>
            <section className='wide flow'>
                <h3>Choose an account</h3>
                <button onClick={() => handleDemoLogin('faculty')}>Demo Faculty</button>
                <button onClick={() => handleDemoLogin('admin')}>Demo Admin</button>
                <button onClick={() => handleDemoLogin('student')}>Demo Student</button>
            </section>
            {errorMessage && <p>{errorMessage}</p>}
            <p><a onClick={handleTryAgain}>Or Sign in with UTampa Email here</a></p>

        </article>
    </main>
)
}