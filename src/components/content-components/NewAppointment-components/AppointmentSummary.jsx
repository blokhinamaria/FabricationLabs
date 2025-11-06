import { useNavigate } from "react-router-dom"

export default function AppointmentSummary({appointment, handleClickItem, mode}) {

    const navigate = useNavigate();

    //populate the form with appointment data
    const appointmentDate = new Date(appointment.date)

    function handleCancel() {
        navigate('/dashboard')
    }

    return (
        <section className="appointment-overview">
            <div onClick={() => handleClickItem('equipment')}>
                <p>Appointment for</p>
                <h3>{appointment?.equipmentName}</h3>
            </div>
                                                        
            { appointment.materialPreference ? (
                <div onClick={() => handleClickItem('materials')}> 
                    <p><strong>Preferred  Materials</strong></p>
                        {appointment.materialSelections.map(material => (
                            <p key={material.id}>{material.name} {material.selectedVariations.size} {material.selectedVariations.color}</p>
                        ))}
                </div>
                ) : null}
            
            {appointment?.date && (
                <div className='appointment-overview-details' onClick={() => handleClickItem('time')}>
                    <p>Appointment at</p>
                    <div className="appointment-icon-text">
                        <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                        <p>{appointmentDate.toDateString()}</p>
                    </div>
                    <div className="appointment-icon-text">
                        <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                        <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                    </div>
                </div>
            )}

            
            <button className="small" onClick={handleCancel}>Cancel</button>
        </section>
    )
}