import { useState, useLayoutEffect } from "react"
import sanitizeHtml from "sanitize-html";

import './MaterialSelection.css'

export default function MaterialSelection({materials = [], fileRequirements, handleSubmitMaterials, prevMaterialSelections = []}) {

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);

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


    const [ hasReviewedRequirements, setHasReviewedRequirements ] = useState(sanitizedFileText ? false : true);
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
        <form className="material-form flow" onSubmit={handleSubmit}>
            {availableMaterials.length > 0 &&
                <div className="flow">
                    <h3>Select Preferred Materials*</h3>
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
                    <p className="disclaimer">*Material selection is optional. Material availability is not guaranteed </p>
            </div>}
            
            {sanitizedFileText &&
                <div className="flow">
                <h3>File Requirements</h3>
                <div 
                    dangerouslySetInnerHTML={{ __html: sanitizedFileText }}
                    style={{ whiteSpace: 'pre-wrap' }}
                    />
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
            </div>}
            
            <button type="submit" disabled={!hasReviewedRequirements}>Submit</button>
        </form>
    )
}