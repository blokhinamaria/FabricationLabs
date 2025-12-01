import { useState, useRef } from "react"
import sanitizeHtml from "sanitize-html";

export default function EquipmentFileReq({file, onUpdate}) {

    const [ fileText, setFileText] = useState(file)
    const [ formError, setFormError ] = useState('')

    const dialogRef = useRef(null)

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
        e.preventDefault()
        const newText = sanitizeHtml(e.target.firstChild.innerHTML || '', {
            allowedTags: ['br', 'p', 'div', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i'],
            allowedAttributes: {},
            allowedSchemes: []
        });

        console.log(newText)
        
        setFormError('')
        const equipmentUpdates = {}
        
        const isChanged = file !== newText
        if (isChanged) {
            equipmentUpdates.fileRequirements = newText;
            console.log(equipmentUpdates)
            setFileText(newText)
            await onUpdate(equipmentUpdates)
            closeModal();
            return
        }

        setFormError('File requirements match the original')
    }

    return (
        <section>
            <h2>File Requirements</h2>
            <div 
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
                <button onClick={closeModal}>Close</button>
                <form onSubmit={handleSubmit}>
                    <div
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
                    >Save</button>
                </form>
            </dialog>
            

        </section>
    )
}