import { useState } from "react"

import './MaterialSelection.css'

export default function MaterialSelection({materials, fileRequirements, handleSubmitMaterials}) {

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

    const [ selectedMaterials, setSelectedMaterials ] = useState([]);

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
                            />
                        <label  htmlFor={material.id}>
                            {material.name} {material.size} {material.color}
                        </label>
                    </div>
                ))}

                <p className="disclaimer">Material availability is not guaranteed </p>
                <h4>File Requirements</h4>
                <p>{fileRequirements}</p>
                    <div className="input-group-wrapper">
                        <input
                            id='fileRequirements'
                            name='fileRequirements'
                            type="checkbox"
                            value='reviewed'
                            onChange={() => setHasReviewedRequirements((prev) => !prev)}
                        />
                        <label htmlFor='fileRequirements'>
                            I have reviewed and understood the file requirements
                        </label>
                    </div>
                    { errorMessage !== '' ? (<p className="error-message">{errorMessage}</p>) : null}
                <button type="submit" disabled={!hasReviewedRequirements}>Submit</button>
            </form>
        </section>
    )
}