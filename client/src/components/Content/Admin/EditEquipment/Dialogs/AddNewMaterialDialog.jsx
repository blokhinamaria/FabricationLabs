import { forwardRef, useState } from "react";
import { CloseSmallIcon } from "../../../../Icons/Icons";

const AddNewMaterialDialog = forwardRef(function AddNewMaterialDialog(
    { dialogId = "new-material-dialog", setIsDialogOpen, materials, setMaterials, setMaterialUpdated },
    dialogRef
    ) {
    const [newMaterial, setNewMaterial] = useState("");
    const [newMaterialSize, setNewMaterialSize] = useState("");
    const [newMaterialColor, setNewMaterialColor] = useState("");
    const [newMaterialError, setNewMaterialError] = useState("");

    const resetForm = () => {
        setNewMaterialError("");
        setNewMaterial("");
        setNewMaterialColor("");
        setNewMaterialSize("");
    };

    const closeModal = () => {
        if (!dialogRef?.current) return;
        if (dialogRef.current.open) dialogRef.current.close();
        setIsDialogOpen?.(false);
        resetForm();
    };

    // close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) closeModal();
    };

    function createNewMaterial(e) {
        e.preventDefault();

        const material = newMaterial.trim();
        const size = newMaterialSize.trim();
        const color = newMaterialColor.trim();

        if (material.length === 0) {
        setNewMaterialError("Material name required");
        return;
        }

        // Keep your original “duplicate by material name” rule
        const alreadyExists = materials?.some(
        (item) => item.material?.toLowerCase() === material.toLowerCase()
        );

        if (alreadyExists) {
        setNewMaterialError("This material already exists");
        return;
        }

        setNewMaterialError("");

        const id = color ? `${material}?${size}?${color}` : `${material}?${size}`;

        const newItem = {
        id,
        inStock: true,
        material,
        size,
        ...(color ? { color } : {}),
        };

        setMaterials((prev) => [...prev, newItem]);
        setMaterialUpdated(true);
        closeModal();
    }

    return (
        <dialog
            id={dialogId}
            ref={dialogRef}
            onClick={handleDialogClick}
            onClose={() => {
                // Keep parent ARIA state in sync when user hits Esc
                setIsDialogOpen?.(false);
                resetForm();
            }}
        >
            <div className="dialog-close-button-wrapper">
                <button onClick={closeModal} className="dialog-close-button" type="button">
                Close <CloseSmallIcon />
                </button>
            </div>

            <form onSubmit={createNewMaterial}>
                <h3 id={`${dialogId}-title`}>Add new material</h3>

                <div className="input-group-wrapper column">
                <label htmlFor={`${dialogId}-material`}>New Material</label>
                <input
                    type="text"
                    id={`${dialogId}-material`}
                    name="material"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    required
                />
                </div>

                {newMaterialError && <p role="alert">{newMaterialError}</p>}

                <div className="input-group-wrapper column">
                <label htmlFor={`${dialogId}-size`}>New Size</label>
                <input
                    type="text"
                    id={`${dialogId}-size`}
                    name="size"
                    value={newMaterialSize}
                    onChange={(e) => setNewMaterialSize(e.target.value)}
                />
                </div>

                <div className="input-group-wrapper column">
                <label htmlFor={`${dialogId}-color`}>New Color</label>
                <input
                    type="text"
                    id={`${dialogId}-color`}
                    name="color"
                    value={newMaterialColor}
                    onChange={(e) => setNewMaterialColor(e.target.value)}
                />
                </div>

                <button type="submit">+ Add new material</button>
            </form>
        </dialog>
    );
    });

export default AddNewMaterialDialog;
