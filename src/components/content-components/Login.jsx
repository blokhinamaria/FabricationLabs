import { useState } from 'react'
import { useNavigate } from 'react-router-dom';


import './Login.css'


export default function Login() {

const [ userEmail, setUserEmail] = useState('');
const [ inputVlaue, setInputValue ] = useState('');
const [ errorMessage, setErrorMessage ] = useState('');

const [ authInProgress, setAuthInProgress] = useState(false);
// const [ message, setMessage ] = useState('');

const navigate = useNavigate()

//Form submission
async function handleSubmit(formData) {
    const email = formData.get('email');
    setErrorMessage('')
    if (email) {
        const isValid = isEmailValid(email);
        if (isValid) {
            setUserEmail(email);
        } else {
            setErrorMessage('Please, enter valid UT email')
            return
        }
    } else if (email === '') {
        setErrorMessage('Please, enter valid UT email')
        return
    } else {
        setErrorMessage('Invalid email')
        return
        }

    try {
        const response = await fetch('/api/request-link', {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: email })
        })
        const data = await response.json()
        if (response.ok) {
            setAuthInProgress(true)
        } else {
            throw new Error('Something went wrong')
        }
    } catch (err) {
        setErrorMessage('Something went wrong. Please try again')
        console.log(err)
    }
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

function handleTryAgain() {
    navigate('/')
}

    return (
        <main>

            <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
            <h2>Please sign in with your UTampa Email to start</h2>
            { !authInProgress ? 
                <form id='signIn' action={handleSubmit}>
                    <input className='' aria-label='email' type='email' id='email' name='email' placeholder='email@spartan.ut.edu' value={inputVlaue} onChange={e => setInputValue(e.target.value)}></input>
                    { errorMessage ? <p className='error-message'>{errorMessage}</p> : null}
                    <button type='submit'>Sing In</button>
                </form>
                : 
                <div>
                    <h2>Check {userEmail} and confirm sign in</h2>
                    <p>Not seeing the email confirmation? <a onClick={handleTryAgain}>Try again</a></p>
                    {/* <Link to='/dashboard'><button onClick={handleClick}>For Development: Skip to Dashboard</button></Link> */}
                </div>
            }
            
        </main>
    )
}