import { useEffect, useState } from "react"

import './MaterialSelection.css'

export default function MaterialSelection({materials, fileRequirements, handleSubmitMaterials, prevMaterialSelections = []}) {

    function flattenMaterials (materials) {
        const inStockMaterials = materials.filter(item => item.inStock === true) 

        const flatMaterials = inStockMaterials.flatMap(({ name, variations, ...rest }) =>
                variations.flatMap(({ size, colors,}) =>
                colors.map(color => ({
                    id: (
                        name.toLowerCase() +
                        size.toLowerCase() +
                        color.toLowerCase()
                        ).replaceAll(' ', ''),
                    name, 
                    size,
                    color, 
                    ...rest }))
            )
        );
        return flatMaterials;
    }

    const availableMaterials = flattenMaterials(materials);

    function transformPrevMaterials(materials) {
    return materials.map(item => ({
        id: item.id,
        name: item.name,
        size: item.selectedVariations.size,
        color: item.selectedVariations.color
    }));
}

    const [ selectedMaterials, setSelectedMaterials ] = useState( prevMaterialSelections.length > 0 ? transformPrevMaterials(prevMaterialSelections) : []);

    function handleChange(e) {
        if (e.target.checked) {
            const checkedMaterial = availableMaterials.find((material => material.id === e.target.value))
            setSelectedMaterials((prev) => [...prev, checkedMaterial]);
        } else {
            setSelectedMaterials((prev) => prev.filter((material) => material.id !== e.target.value))
        }
    }

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
            <h4>Select Preferred Materials (optional)</h4>
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
                            {material.name} {material.size} {material.color}
                        </label>
                    </div>
                ))}
                    <p className="disclaimer">Material availability is not guaranteed </p>
                        <div>
                            <h4>File Requirements</h4>
                            <p>{fileRequirements}</p>
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