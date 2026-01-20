import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { API_URL} from '../../config'

export default function Login() {

    const [ userEmail, setUserEmail] = useState('');
    const [ errorMessage, setErrorMessage ] = useState('');

    const [ authInProgress, setAuthInProgress] = useState(false);

    const navigate = useNavigate()

    async function handleSubmit(formData) {
        
        const email = formData.get('email');
        setErrorMessage('')

        if (email) {

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

    async function requestLink(email) {
        setErrorMessage('')
        try {
            const response = await fetch(`${API_URL}/api/login/request-link`, {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email })
            });
            const data = await response.json();
            console.log(response)
            if (response.ok) {
                setAuthInProgress(true)
                return
            } else {
                setErrorMessage(data.error)
                return
            }
        } catch (err) {
            setErrorMessage('Something went wrong. Please try again later')
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
        setErrorMessage('')
        navigate('/')
        setAuthInProgress(false)
    }

    function handleClick() {
        navigate('/login/demo')
    }
    

    return (
        <main className='flow-lg'>
            <h1>Welcome to the University of Tampa<br /><span className="title-emphasis">Fabrication Labs</span></h1>
            <article>
            { !authInProgress ? 
                <>
                    <h3>Sign in with your UTampa Email to start</h3>
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
                </>
                : 
                <div className='flow'>
                    <h3>Check <strong>{userEmail}</strong>  and confirm sign in</h3>
                    <p>Not seeing the email confirmation? Check your span email or <a onClick={handleTryAgain}>Try again</a></p>
                </div>
            }
            
                <button type='button' onClick={handleClick}>Or Try Demo</button>
            </article>
        </main>
    )
}