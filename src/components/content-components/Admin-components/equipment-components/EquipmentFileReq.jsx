import { useState } from "react"

export default function EquipmentFileReq({file, onUpdate}) {

    const [ fileText, setFileText] = useState(file)
    const [ formError, setFormError ] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError('')
        const equipmentUpdates = {}
        
        const isChanged = file !== fileText
        if (isChanged) {
            equipmentUpdates.fileRequirements = fileText;
            console.log(equipmentUpdates)
            await onUpdate(equipmentUpdates)
            return
        }

        setFormError('File requirements match the original')
    }

    return (
        <section>
            <h2>File Requirements</h2>
            <form onSubmit={handleSubmit}>
                <div
                    contentEditable="true"
                    onDoubleClickCapture={(e) => setFileText(e.currentTarget.innerHTML)} 
                    suppressContentEditableWarning={true}
                    dangerouslySetInnerHTML={{ __html: fileText }}
                    style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}
                    >
                </div>
                {formError && <p className="warning">{formError}</p>}
                <button
                type="submit"
                disabled={file === fileText}
                >Save</button>
            </form>

        </section>
    )
}