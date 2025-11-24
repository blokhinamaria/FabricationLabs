import { useState } from 'react'
import { useAuth } from '../../../AuthContext'

export default function Details({submitDetails}) {

    const { user, updateUser } = useAuth();

    const [ userFullName, setUserFullName ] = useState(user.fullName || '');

    const [ classNumber, setClassNumber ] = useState('')
    const [ notes, setNotes] = useState('');
    const [ agreedToPolicy, setAgreedToPolicy ] = useState(false);
    const [ agreedToTerms, setAgreedToTerms ] = useState(false);

    const [ nameErrorMessage, setNameErrorMessage ] = useState('')
    const [ classErrorMessage, setClassErrorMessage ] = useState('')
    const [ notesErrorMessage, setNotesErrorMessage ] = useState('')
    const [ termErrorMessage, setTermErrorMessage ] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setNameErrorMessage('')
        setClassErrorMessage('')
        setNotesErrorMessage('')
        setTermErrorMessage('')

        if (userFullName.trim() === '') {
            setNameErrorMessage('Provide your full name')
            return
        } else {
            const isValid = validateFullName(userFullName)
            if (!isValid) {
                return
            }
        }
        
        // if (!classNumber || classNumber.trim() === '') {
        //     setClassErrorMessage('Provide the class number related to your project')
        //     return 
        // }

        // if (!notes || notes.trim() === '') {
        //     setNotesErrorMessage('Provide a few details about your needs')
        //     return 
        // }

        if ( !agreedToTerms || !agreedToPolicy ) {
            setTermErrorMessage('You must agree to terms and conditions and review the Policy and Guidelines')
            return 
        }

        if (user.fullName !== userFullName) {
            await changeName(userFullName)
        }

        submitDetails(userFullName, classNumber, notes)
    }

    async function changeName(name) {
        try {
            const response = await fetch(`/api/users?id=${user._id}`, {
                    method: "PUT",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({fullName: name})
                })
            if (response.ok) {
                console.log(`Name changed to: ${name}`)
                updateUser({fullName: name})
                
            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(`Error with the fetch request from changeName: ${err}`)
        }
    }

    function validateFullName(name) {
        const regex = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F'-]+(\s+[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F'-]+)+$/;
        const result = regex.test(name);
        if (!result) {
            setNameErrorMessage('Provide valid full name')
            // document.getElementById('email').classList.add('invalid');
            return false
        } else {
            // document.getElementById('email').classList.remove('invalid');
            return true
        }
    }

    return (
        <article>
            <h2>Confirm your details</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='name'>Full Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder={userFullName || 'Full Name'}
                            value={userFullName}
                            onChange={(e) => setUserFullName(e.target.value)}
                            aria-required={true}
                            />
                        {nameErrorMessage ? <p aria-live='polite' className='error-message'>{nameErrorMessage}</p> : null}
                    </div>
                    <div>
                        <label htmlFor='classNumber'>Class</label>
                        <input
                            type="text"
                            id="classNumber"
                            name="classNumber"
                            placeholder="ART XXX"
                            value={classNumber}
                            onChange={(e) => setClassNumber(e.target.value)}/>
                        {classErrorMessage ? <p aria-live='polite' className='error-message'>{classErrorMessage}</p> : null}
                    </div>
                    <div>
                        <label htmlFor='details'>Additional details</label>
                        <textarea
                            id="details"
                            name="details"
                            placeholder="Provide details of your project and the materials you need so we can better prepare for your visit"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}/>
                        {notesErrorMessage ? <p aria-live='polite' className='error-message'>{notesErrorMessage}</p> : null}
                    </div>
                    <div className='input-group-wrapper'>
                        <input
                            id='terms'
                            name='terms'
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            aria-required={true}
                        />
                        <label htmlFor='terms'>
                            I have read and agree to the Terms and Conditions
                        </label>
                    </div>
                    <div className='input-group-wrapper'> 
                            <input
                                id='policy'
                                name='policy'
                                type="checkbox"
                                checked={agreedToPolicy}
                                onChange={(e) => setAgreedToPolicy(e.target.checked)}
                                aria-required={true}
                            />
                            <label htmlFor='policy'>
                                I have read and understood the UTampa Fabrication Lab and Woodshop policy and guidelines
                            </label>
                    </div>
                    {termErrorMessage ? <p aria-live='polite' className='error-message'>{termErrorMessage}</p> : null}
                    <button type='submit'>Submit</button>
                </form>
        </article>
    )
}