import { useState } from "react"
import sanitizeHtml from "sanitize-html";

import './MaterialSelection.css'

export default function MaterialSelection({materials = [], fileRequirements, handleSubmitMaterials, prevMaterialSelections = []}) {

    const availableMaterials = materials?.filter(material => material.inStock)

    const [ selectedMaterials, setSelectedMaterials ] = useState( prevMaterialSelections.length > 0 ? prevMaterialSelections : []);

    function handleChange(e) {
        if (e.target.checked) {
            const checkedMaterial = availableMaterials.find((material => material.id === e.target.value))
            setSelectedMaterials((prev) => [...prev, checkedMaterial]);
        } else {
            setSelectedMaterials((prev) => prev.filter((material) => material.id !== e.target.value))
        }
    }

    const sanitizedFileText = sanitizeHtml(fileRequirements || '', {
        allowedTags: ['br', 'p', 'div', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i'],
        allowedAttributes: {},
        allowedSchemes: []
    });


    const [ hasReviewedRequirements, setHasReviewedRequirements ] = useState(false);
    const [ errorMessage, setErrorMessage] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setErrorMessage("");
        if (hasReviewedRequirements) {
            handleSubmitMaterials(selectedMaterials);
        } else {
            setErrorMessage("You must review the file requirements");
        }
    }

    return (
        <section className="material-selection">
            <h2>Select Preferred Materials (optional)</h2>
            <form className="material-form" onSubmit={handleSubmit}>
                {availableMaterials.map((material) => (
                    <div className="input-group-wrapper" key={material.id}>
                        <input
                            id={material.id}
                            name="materialSelection"
                            type="checkbox"
                            value={material.id}
                            onChange={handleChange}
                            checked={selectedMaterials.some(item => item.id === material.id )}
                            />
                        <label  htmlFor={material.id}>
                            {material.material} {material.size} {material.color}
                        </label>
                    </div>
                ))}
                    <p className="disclaimer">Material availability is not guaranteed </p>
                        <div>
                            <h2>File Requirements</h2>
                            <div 
                                dangerouslySetInnerHTML={{ __html: sanitizedFileText }}
                                style={{ whiteSpace: 'pre-wrap' }}
                                />
                        </div>
                    <div className="input-group-wrapper">
                        <input
                                id='fileRequirements'
                                name='fileRequirements'
                                type="checkbox"
                                value='reviewed'
                                onChange={() => setHasReviewedRequirements((prev) => !prev)}
                                aria-required={true}
                        />
                        <label htmlFor='fileRequirements'>
                                I have reviewed and understood the file requirements
                        </label>
                    </div>
                    { errorMessage !== '' ? (<p aria-live='polite' className="error-message">{errorMessage}</p>) : null}
                <button type="submit" disabled={!hasReviewedRequirements}>Submit</button>
            </form>
        </section>
    )
}