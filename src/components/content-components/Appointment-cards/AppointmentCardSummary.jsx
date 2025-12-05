import { useNavigate } from 'react-router-dom'

export default function AppointmentSummary({appointment, handleClickItem, mode='create'}) {

    const appointmentType = (appointment?.type === 'class-reservation' ? 'Class Reservation' : 'Appointment');
    const isClassReservation = appointment?.type === 'class-reservation'

    const appointmentDate = new Date(appointment.date)
    const reservationEnd = (appointment?.type === 'class-reservation' && appointment.endTime ? appointment.endTime : null)


    const navigate = useNavigate()

    function handleCancel() {
        navigate('/dashboard')
    }

    return (
        <section className="appointment-overview">
            {/* Equipment+Materials section */}
            <div className="appointment-overview-group hover" onClick={() => handleClickItem('equipment')}>
                <div>
                    <p>{appointmentType} for</p>
                    <h3>{appointment?.equipmentName}</h3>           
                </div>                     
                { appointment.materialPreference ? (
                    <div> 
                        <p>Preferred  Materials</p>
                            {appointment.materialSelections.map(material => (
                                <p key={material.id}><strong>{material.material} {material.size} {material.color}</strong></p>
                            ))}
                    </div>
                    ) : null}
            </div>
            
            {/* Date+Time name */}
            {appointment?.date && (
                <div className='appointment-overview-group hover' onClick={() => handleClickItem('time')}>
                        <p>{appointmentType} at</p>
                        <div className="appointment-icon-text">
                            <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                            <p>{appointmentDate.toDateString()}</p>
                        </div>
                        <div className="appointment-icon-text">
                            <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                            <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}{isClassReservation && `–${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
                            
                        </div>
                    </div>
                    
            )}
            {mode !== 'edit' &&
                <div className='appointment-button-group'>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            }
        </section>
    )
}