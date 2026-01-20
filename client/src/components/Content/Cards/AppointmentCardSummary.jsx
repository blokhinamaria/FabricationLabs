import { useNavigate } from 'react-router-dom'
import { AlarmIcon, CalendarIcon } from '../../Icons/Icons';

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
        <div className='card'>
            {/* Equipment+Materials section */}
            <div className="card-content-group hover" onClick={() => handleClickItem('equipment')}>
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
                <div className='card-content-group hover' onClick={() => handleClickItem('time')}>
                    <div>
                        <p>{appointmentType} at</p>
                        <div className="card-icon-text">
                            <CalendarIcon />
                            <p>{appointmentDate.toDateString()}</p>
                        </div>
                        <div className="card-icon-text">
                            <AlarmIcon />
                            <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}{isClassReservation && `–${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
                            
                        </div>
                    </div>
                </div>
            )}
            {mode !== 'edit' &&
                <div className='appointment-button-group'>
                    <button onClick={handleCancel}>Cancel</button>
                </div>
            }
        </div>
    )
}