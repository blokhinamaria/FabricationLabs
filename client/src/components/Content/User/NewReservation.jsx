import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext.jsx";
import { ObjectId } from "bson";

import EquipmentSelection from "./AppointmentFlow/EquipmentSelection.jsx";
import AppointmentCardSummary from "../Cards/AppointmentCardSummary.jsx";
import DateTimeSelectionReservation from "./AppointmentFlow/DateTimeSelectionReservation.jsx";
import Details from "./AppointmentFlow/Details.jsx";
import AppointmentCard from "../Cards/AppointmentCard.jsx";

import './NewAppointment.css'
import { API_URL } from "../../../config.js";

export default function NewReservation() {

    const { user } = useAuth()

    const [ newAppointmentData, setNewAppointmentData ] = useState(
        {
            type: 'class-reservation',
            userId: new ObjectId(user._id),
            userName: user.fullName,
            userEmail: user.email,
            equipmentId: null,
            equipmentName: null,
            location: null,
            
            // Store only the specific selections made at booking time
            materialPreference: false, //boolean, false by default
            materialSelections: [],
            date: null, //date object
            startTime: null, // "09:00" / string
            endTime: null, // date object on reservations
            duration: null, // Number minutes
            
            status: 'scheduled', // 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'
            
            // Notes and tracking
            classNumber: '',
            notes: '', // User notes about the project
            adminNotes: '', // Staff notes (visible only to admins)
            
            // Timestamps
            createdAt: null, 
            updatedAt: null,
            cancelledAt: null
        }
    )

    //Navigation between steps

    const [ step, setStep ] = useState('equipment');
    const [ createAppointmentError, setCreateAppointmentError] = useState('')
    const [appointmentCreateMode, setAppointmentCreateMode] = useState({
        status: 'create',
    }) 


    function handleNext(step) {
        setStep(step)
    }

    function handleClickItem(step) {
        setStep(step)
        if (step === 'equipment' || step === 'materials') {
            setAppointmentCreateMode({
            status: 'create',
            prevEquipmentId: newAppointmentData.equipmentId.toString(),
            prevMaterialSelections: newAppointmentData.materialSelections,
        })
        } else if (step === 'time') {
        //     setAppointmentCreateMode({
        //     status: 'edit',
        //     prevDate: newAppointmentData.date,
        //     prevTime: newAppointmentData.startTime,
        //     prevEndTime: newAppointmentData.endTime
        // })
        //     setNewAppointmentData((prev) => ({
        //         ...prev,
        //         date: null,
        //         startTime: null, 
        //         endTime: null, 
        //     }))
        }
        
    }

    //STEP 1 : Equipment

    function submitEquipment(equipment, materialSelection = []) {

        if (materialSelection.length > 0) {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id),
            equipmentName: equipment.name,
            location: equipment.location,
            materialPreference: true,
            materialSelections: materialSelection,
            date: null,
            startTime: null, 
            endTime: null, 
        }))
        
    } else {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id),
            equipmentName: equipment.name,
            location: equipment.location,
            materialPreference: false,
            materialSelections: null,
            date: null,
            startTime: null, 
            endTime: null, 
        }))
        }
        //Move to the next step
        handleNext("time");
    }

    // STEP 2: date and time

    function submitDateTime(selectedDate, selectedStartSlot, endTime) {
        console.log(typeof selectedDate);
        const duration = Math.round(Math.abs(selectedDate.getTime() - endTime.getTime()) / 60000);

        setNewAppointmentData((prev) => ({
            ...prev,
            date: selectedDate,
            startTime: selectedStartSlot,
            endTime: endTime,
            duration: duration
        }))
        handleNext("details");
    }

    //STEP 3: Details

    async function submitDetails (fullName = user.fullName, classNumber, details ) {
        const updatedData = {
            ...newAppointmentData,
            userName: fullName,
            classNumber: classNumber,
            notes: details
        }
        setNewAppointmentData(updatedData)
        await bookAppointment(updatedData)
    }

    //STEP 4: Submit apppointment data and show confirmation

    const [ appointmentId, setAppointmentId] = useState(null)

    async function bookAppointment(appointmentData = newAppointmentData) {
        setCreateAppointmentError('')
        try {
            const response = await fetch(`${API_URL}/api/me/appointment`, {
                credentials: 'include',
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(appointmentData)
            })
            const data = await response.json();
            if (response.ok) {                                
                setStep('confirmation')
                setAppointmentId(data.appointmentId)
                return 
            } else {
                setCreateAppointmentError(data.error)
                return
            }
        } catch {
            setCreateAppointmentError('Something went wrong when creating your appointment. Please try again later')
        }
    }
    const navigate = useNavigate()
    function handleClick() {
        navigate('/dashboard')
    }

    return (
        <main className="flow-lg">
            <h1>New Class Reservation</h1>
            {(step === 'equipment' || step === 'materials')  && 
                <EquipmentSelection
                    submitEquipment={submitEquipment}
                    mode={appointmentCreateMode}
                />}
            {step === 'time' && 
                (   
                    <div className="appointment-booking-grid">  
                        <div className="appointment-sidebar">
                            <AppointmentCardSummary appointment={newAppointmentData} mode={'create'} handleClickItem={handleClickItem}/>
                        </div>
                        <div className="grid-main">
                            <DateTimeSelectionReservation
                                equipmentId={newAppointmentData.equipmentId}
                                lab={newAppointmentData.location}
                                submitDateTime={submitDateTime}
                                mode={appointmentCreateMode}
                                />
                        </div>
                    </div>
                )}
                
            {step === 'details' && 
                (   
                    <section className="flow-lg">  
                        <div className="card-box">
                            <AppointmentCardSummary appointment={newAppointmentData} mode={'create'} handleClickItem={handleClickItem}/>
                        </div>
                        <div>
                            <Details submitDetails={submitDetails}/>
                            {createAppointmentError && <p>{createAppointmentError}</p>}
                        </div>
                    </section>
                )
            }
            {step === 'confirmation' &&
                <section className="flow">
                    <h3>Class Reservation created</h3>
                    <div className="card-box">
                        <AppointmentCard id={appointmentId} />
                    </div>
                    
                    <button onClick={handleClick}>Back to dashboard</button>
                </section>
            }
        </main>
    )
}
