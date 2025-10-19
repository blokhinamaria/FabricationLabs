import { useState } from 'react'
import { Link } from 'react-router-dom';

import './Login.css'


export default function Login() {

const [ varificationInProgress, setVarificationInProgress] = useState(false);

const [ email, setEmail] = useState('');
const [ inputVlaue, setInputValue ] = useState('');
const [ errorMessage, setErrorMessage ] = useState('');

//Form submission
function handleSubmit(formData) {
    const email = formData.get('email');
    console.log(email);
    if (email) {
        const validation = isEmailValid(email);
        if (validation) {
            setVarificationInProgress(true);
            setEmail(email);
        }
    } else if (email === '') {
        setErrorMessage('Please, enter valid UT email')
    } else {
        setErrorMessage('Invalid email')
    }
    
}

function isEmailValid(email) {
    const regex = /^[A-Za-z0-9._%+-]+@(ut\.edu|spartans\.ut\.edu)$/;
    const result = regex.test(email);
        if(!result) {
            setErrorMessage('Email is not valid. Please, enter valid UT email');
            document.getElementById('email').classList.add('invalid');
            console.log(errorMessage);
            return false;
        } else {
            document.getElementById('email').style.borderColor = 'green';
            return true;
        }
}

function handleClick() {

}

    return (
        <main>

            <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
            <h2>Please sign in with your UTampa Email to start</h2>
            { !varificationInProgress ? 
                <form id='signIn' action={handleSubmit}>
                    <input className='' aria-label='email' type='email' id='email' name='email' placeholder='email@spartan.ut.edu' value={inputVlaue} onChange={e => setInputValue(e.target.value)}></input>
                    { errorMessage ? <p className='error-message'>{errorMessage}</p> : null}
                    <button type='submit'>Sign In</button>
                </form>
                : 
                <div>
                    <h2>Check {email} and confirm sign in</h2>
                    <p>Not seeing the email confirmation? <a>Try again</a></p>
                    <Link to='/dashboard'><button onClick={handleClick}>For Development: Skip to Dashboard</button></Link>
                </div>
            }
            
        </main>
    )
}