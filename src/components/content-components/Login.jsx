import { useState } from 'react'
import { useNavigate } from 'react-router-dom';


import './Login.css'

export default function Login() {

const [ userEmail, setUserEmail] = useState('');
const [ errorMessage, setErrorMessage ] = useState('');

const [ authInProgress, setAuthInProgress] = useState(false);
const [ demoUserInterface, setDemoUserInterface] = useState(false);
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
    
    await requestLink(email)
}

async function requestLink(email, password=null) {
    setErrorMessage('')
    try {
        if (!password) {
            const response = await fetch('/api/request-link', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email })
            });
            if (response.ok) {
                setAuthInProgress(true)
            } else {
                throw new Error('Something went wrong')
            }
        } else {
            const response = await fetch('/api/request-link', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email, password: password })
            });
            if (response.ok) {
                setAuthInProgress(true)
                const data = await response.json();
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            } else {
                const data = await response.json();
                setErrorMessage(data.error)
                throw new Error('Something went wrong')
                
            }
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
    setDemoUserInterface(false)
}

async function handleDemoSubmit(formData) {
    setErrorMessage('')
    const email = formData.get('email')
    const password = formData.get('password');

    if (!email || !password) {
        setErrorMessage('All fields are required')
        return
    }

    const isDemoUser = isDemo(email)

    if (!isDemoUser) {
        setErrorMessage('Demo user email required')
        return
    }

    await requestLink(email, password)

    

}

    return (
        <main>

            <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
            
            { !authInProgress ? 
                <article>
                    <h2>Please sign in with your UTampa Email to start</h2>
                    <form id='signIn' action={handleSubmit}>
                            <input
                                aria-label='email'
                                aria-required={true}
                                type='email'
                                id='email'
                                name='email'
                                placeholder='email@spartan.ut.edu'
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}>
                            </input>
                            { errorMessage ? <p aria-live='polite' className='error-message'>{errorMessage}</p> : null}
                        <button type='submit'>Sign In</button>
                    
                    </form>
                </article>
                : 
                (!demoUserInterface ? (<article>
                    <h2>Check <strong>{userEmail}</strong>  and confirm sign in</h2>
                    <p>Not seeing the email confirmation? Check your span email or <a onClick={handleTryAgain}>Try again</a></p>
                    
                </article>
                ) : (
                    <form id='signIn' action={handleDemoSubmit}>
                        <div>
                            <input
                                aria-label='email'
                                aria-required={true}
                                type='email'
                                id='email'
                                name='email'
                                placeholder='email@spartan.ut.edu'
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}>
                            </input>
                        </div>

                        <div>
                            <input
                                aria-label='password'
                                aria-required={true}
                                type='password'
                                id='password'
                                name='password'
                                placeholder='demo password'
                                value={password}
                                onChange={e => setPassword(e.target.value)}>
                            </input>
                            { errorMessage ? <p aria-live='polite' className='error-message'>{errorMessage}</p> : null}
                        </div>
                        <button type='submit'>Demo Sign In</button>
                        <button type='button' onClick={() => (setAuthInProgress(false), setDemoUserInterface(false), setUserEmail(''))}>Cancel</button>
                    
                    </form>
                ))
            }
        </main>
    )
}