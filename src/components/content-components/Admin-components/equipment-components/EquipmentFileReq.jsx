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
            await onUpdate()
            return
        }

        setFormError('File requirements match the original')
    }

    return (
        <section>
            <h2>File Requirements</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    id="file-requirements"
                    name="file-requirements"
                    placeholder="Provide file requirement for this type of equipment"
                    value={fileText}
                    onChange={(e) => setFileText(e.target.value)}
                />
                {formError && <p className="warning">{formError}</p>}
                <button
                type="submit"
                disabled={file === fileText}
                >Save</button>
            </form>

        </section>
    )
}