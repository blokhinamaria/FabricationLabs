import { useState, useRef } from "react"
import sanitizeHtml from "sanitize-html";

export default function EquipmentFileReq({file, onUpdate}) {

    const [ fileText, setFileText] = useState(file)
    const [ formError, setFormError ] = useState('')
    const [ loading, setLoading] = useState(false)

    const dialogRef = useRef(null)
    const fileRequirementsRef = useRef(null);

    const sanitizedFileText = sanitizeHtml(file || '', {
            allowedTags: ['br', 'p', 'div', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i'],
            allowedAttributes: {},
            allowedSchemes: []
        });

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openModal = () => {
        dialogRef.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = () => {
        dialogRef.current.close()
        setIsDialogOpen(false)
    }

    //close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            closeModal();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const newText = sanitizeHtml(fileRequirementsRef.current.innerHTML || '', {
            allowedTags: ['br', 'p', 'div', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i'],
            allowedAttributes: {},
            allowedSchemes: []
        });

        setFormError('');
        
        const isChanged = file !== newText;
        
        if (!isChanged) {
            setFormError('File requirements match the original');
            return; 
        }

        // Content changed - update it
        const equipmentUpdates = {
            fileRequirements: newText
        };

        setLoading(true); 
        try {
            await onUpdate(equipmentUpdates);
            setFileText(newText); 
            closeModal()
        } catch (err) {
            console.log(err);
            setFormError('Something went wrong. Please try again');
        } finally {
            setLoading(false); 
        }
    }

    return (
        <section className="flow">
            <h2>File Requirements</h2>
            <div className='file-requirements-text'
                dangerouslySetInnerHTML={{ __html: sanitizedFileText }}
                style={{ whiteSpace: 'pre-wrap' }}
                />
            <button 
                onClick={openModal}
                aria-expanded={isDialogOpen}
                aria-controls="delete-dialog"
                aria-haspopup="dialog"
                >
                Edit
            </button>
            <dialog id='delete-dialog' ref={dialogRef} onClick={handleDialogClick}>
                <div className="dialog-close-button-wrapper">
                    <button  onClick={closeModal} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <h3>Edit File Requirements</h3>
                    <div
                        ref={fileRequirementsRef}
                        className="file-requirements-text"
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: fileText }}
                        style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}
                        >
                        </div>
                    {formError && <p className="warning">{formError}</p>}
                    <button
                    type="submit"
                    // disabled={file === fileText}
                    >{loading ? "Saving" : 'Save'}</button>
                </form>
            </dialog>
        </section>
    )
}