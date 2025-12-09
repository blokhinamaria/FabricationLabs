import { useState, useRef } from "react";
import { Tooltip } from "@mui/material";
import { AddIcon, CloseSmallIcon, DeleteIcon } from "../../../icons";
 

export default function EquipmentMaterials({equipment, onUpdate}) {

    const [ materials, setMaterials ] = useState(equipment?.materials || []);
    const groupedByMaterial = materials.length !== 0 ? {...Object.groupBy(materials, ({material}) => material)} : {}
    const groupedByMaterialAndSize = Object.fromEntries(
        Object.entries(groupedByMaterial).map(([material, sizeColors]) => [
            material,
            Object.entries(Object.groupBy(sizeColors, ({ size }) => size)).map(([size, colors]) => ({
            size,
            colors
            }))
        ])
        );
    // const [ newColorLabel, setNewColorLabel ] = useState('Add New Color')
    const labelRefs = useRef({});
    const [showAddButtons, setShowAddButtons] = useState({});
    const dialogRef = useRef({});

    const [ formError, setFormError ] = useState('');
    const [loading, setLoading ] = useState(false)

    const [ materialUpdated, setMaterialUpdated ] = useState(false)

    function handleMaterialChange(target, sizeColors) {
        const materialsIds = sizeColors.flatMap(({colors}) => colors.map(color => color.id))
        const updatedMaterials = materials.map((material) => {
            if (materialsIds.includes(material.id)) {
                return {...material, inStock: target.checked}
            }
            return material
        })
        setMaterials(updatedMaterials);
        setMaterialUpdated(true)
    }

    function handleSizeChange(target, colors) {
        const materialIds = colors.map(color => color.id)
        const updatedMaterials = materials.map((material) => {
            if (materialIds.includes(material.id)) {
                    return {...material, inStock: target.checked}
                }
                return material;
            })
            setMaterials(updatedMaterials);
            setMaterialUpdated(true)
    }

    function handleColorChange(target) {
        const updatedMaterials = materials.map((material) => {
                if (material.id === target.value) {
                    return {...material, inStock: target.checked}
                }
                return material;
            })
        setMaterials(updatedMaterials);
        setMaterialUpdated(true)
    }

    function handleLableEdit(e, id) {
        const hasContent = e.target.textContent.trim().length > 0;
        setShowAddButtons(prev => ({ ...prev, [id]: hasContent }));
        if (e.target.textContent.trim().length === 0) {
            e.target.textContent = 'Add new color'
        }
        if (e.target.textContent.trim().toLowerCase() === 'add new color' || e.target.textContent.trim().toLowerCase() === 'add new size') {
            setShowAddButtons(prev => ({ ...prev, [id]: false }));
        }
    }


    function handleAddNew(id, array, type) {
        if (type === 'new-color') {
            const text = labelRefs.current[id]?.textContent;
            const material = array[0].material;
            const size = array[0].size;
            const newColor = text;

            
            const alreadyExists = array.find(color =>
                color.material.toLowerCase() === material.toLowerCase() && 
                color.size.toLowerCase() === size.toLowerCase() && 
                color.color?.toLowerCase() === newColor.toLowerCase()
            );

            if(alreadyExists) {
                alert('This material already exists');
                setShowAddButtons(prev => ({ ...prev, [id]: false }));
                return;
            }

            const newItem = {
                id: `${material}?${size}?${newColor}`,
                inStock: true,
                material: material,
                size: size,
                color: newColor
            }

            const sizeHasOtherColors = materials.some(item => 
                item.material.toLowerCase() === material.toLowerCase() &&
                item.size.toLowerCase() === size.toLowerCase() && item.color
            );

            if (!sizeHasOtherColors) {
                setMaterials(prev => 
                    prev.map(item => 
                        (item.material.toLowerCase() === material.toLowerCase() &&
                        item.size.toLowerCase() === size.toLowerCase() && 
                        !item.color)
                            ? newItem
                            : item
                    )
                );
            } else {
                setMaterials([...materials, newItem])
            }

            labelRefs.current[id].textContent = 'Add new color';
            setShowAddButtons(prev => ({ ...prev, [id]: false }));
            setMaterialUpdated(true)
            return;
        } else if (type === 'new-size') {
            const text = labelRefs.current[id]?.textContent;
            const material = array[0].colors[0].material;
            const newSize = text;

            const alreadyExists = array.find(item => 
                item.size.toLowerCase() === newSize.toLowerCase());

            if(alreadyExists) {
                alert('This material already exists');
                setShowAddButtons(prev => ({ ...prev, [id]: false }));
                return;
            }

            const newItem = {
                id: `${material}?${newSize}`,
                inStock: true,
                material: material,
                size: newSize,
            }

            const materialHasOtherSizes = materials.some(item => 
                item.material.toLowerCase() === material.toLowerCase() && item.size
            );

            if (!materialHasOtherSizes) {
                setMaterials(prev => 
                prev.map(item => 
                    item.material.toLowerCase() === material.toLowerCase() && !item.size
                        ? newItem
                        : item
                )
            );
            } else {
                setMaterials([...materials, newItem])
                setMaterialUpdated(true)
            }

            
            labelRefs.current[id].textContent = 'Add new size';
            setShowAddButtons(prev => ({ ...prev, [id]: false }));
            return;
        } 
    }

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openModal = () => {
        dialogRef.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = () => {
        dialogRef.current.close()
        setIsDialogOpen(false)
        setNewMaterialError('')
        setNewMaterial('')
        setNewMaterialColor('')
        setNewMaterialSize('')
    }

    //close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            closeModal();
        }
    }

    function handleDelete(material, size, color) {
        setMaterials(prev => {
        // If deleting a specific color
            if (color) {
                // Check if this is the last color for this size
                const colorsForThisSize = prev.filter(item =>
                    item.material.toLowerCase() === material.toLowerCase() &&
                    item.size.toLowerCase() === size.toLowerCase() &&
                    item.color
                );

                if (colorsForThisSize.length === 1) {
                    // Last color - replace with size without color
                    return prev.map(item => {
                        if (item.material.toLowerCase() === material.toLowerCase() &&
                            item.size.toLowerCase() === size.toLowerCase() &&
                            item.color.toLowerCase() === color.toLowerCase()) {
                            return {
                                id: `${material}?${size}`,
                                inStock: true,
                                material: material,
                                size: size
                            };
                        }
                        return item;
                    });
                } else {
                    // Not the last color - just remove it
                    return prev.filter(item => !(
                        item.material.toLowerCase() === material.toLowerCase() &&
                        item.size.toLowerCase() === size.toLowerCase() &&
                        item.color.toLowerCase() === color.toLowerCase()
                    ));
                }
            }
        
            // If deleting a size
            if (size && !color) {
                // Check if this is the last size for this material
                const sizesForThisMaterial = prev.filter(item =>
                    item.material.toLowerCase() === material.toLowerCase() &&
                    item.size
                );

                if (sizesForThisMaterial.length === 1) {
                    // Last size - replace with material without size
                    return prev.map(item => {
                        if (item.material.toLowerCase() === material.toLowerCase() &&
                            item.size.toLowerCase() === size.toLowerCase()) {
                            return {
                                id: material,
                                inStock: true,
                                material: material,
                                size: ''
                            };
                        }
                        return item;
                    }).filter((item, index, self) => 
                        // Remove duplicates - keep only one material entry
                        self.findIndex(i => i.id === item.id) === index
                    );
                } else {
                    // Not the last size - remove all items with this size
                    return prev.filter(item => !(
                        item.material.toLowerCase() === material.toLowerCase() &&
                        item.size.toLowerCase() === size.toLowerCase()
                    ));
                }
            }
            // If deleting entire material
            return prev.filter(item => 
                item.material.toLowerCase() !== material.toLowerCase()
            );
    }
    );
    setMaterialUpdated(true)
}

    const [newMaterial, setNewMaterial] = useState('')
    const [newMaterialSize, setNewMaterialSize] = useState('')
    const [newMaterialColor, setNewMaterialColor] = useState('')
    const [ newMaterialError, setNewMaterialError] = useState('')

    function createNewMaterial(e) {
        e.preventDefault();
        if (newMaterial.trim().length === 0) {
            setNewMaterialError('Material name required')
            return;
        }
        setNewMaterialError('')

        const material = newMaterial;
        const size = newMaterialSize;
        const color = newMaterialColor;
        
        const alreadyExists = materials.find(item => 
                item.material.toLowerCase() === material.toLowerCase()
            );
        
        if(alreadyExists) {
            alert('This material already exists');
            return;
        }
        
        if (color) {
            const newItem = {
                id: `${material}?${size}?${color}`,
                inStock: true,
                material: newMaterial,
                size: size,
                color: color
            }
            setMaterials([...materials, newItem])
            setMaterialUpdated(true)
            closeModal()
            return;
        } else {
            const newItem = {
                id: `${material}?${size}`,
                inStock: true,
                material: newMaterial,
                size: size,
            }
            setMaterials([...materials, newItem])
            setMaterialUpdated(true)
            closeModal()
            return;
        }
    }

async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    function inStockIds(material) {
        if (material.inStock) {
            return material.id;
        }
    }

    const prevInStockIds = equipment.materials
        .map(material => inStockIds(material))
        .filter(Boolean)
        .sort()
        .join(',');
    
    const currentInStockIds = materials
        .map(material => inStockIds(material))
        .filter(Boolean)
        .sort()
        .join(',');
    
    const materialsStockChanged = prevInStockIds !== currentInStockIds;

    if (!materialsStockChanged) {
        setFormError('Materials were not changed');
        return; 
    }

    // Materials changed - update them
    const equipmentUpdates = {
        materials: materials
    };

    setLoading(true);
    try {
        await onUpdate(equipmentUpdates);
        setMaterialUpdated(false)
    } catch (err) {
        console.log(err);
        setFormError('Something went wrong. Please try again');
    } finally {
        setLoading(false);
    }
}

    function handleRestore() {
        setMaterials(equipment.materials)
        setMaterialUpdated(false)
        setFormError('')
    }

    return (
        <section>
            <form onSubmit={handleSubmit}>
                    <div>
                        <h2>Materials</h2>
                        {Object.entries(groupedByMaterialAndSize).map(([material, sizeColor]) => (
                            <div key={material}>
                                <div className='input-group-wrapper'>
                                    <input
                                        type='checkbox'
                                        id={material}
                                        name='material'
                                        value={material}
                                        checked={sizeColor.some(({colors}) => colors.some(color => color.inStock))}
                                        onChange={e => handleMaterialChange(e.target, sizeColor)}
                                    />
                                    <label htmlFor={material}>{material}</label>
                                    <Tooltip title="Delete Material" arrow placement="right">
                                        <DeleteIcon onClick={() => handleDelete(material)} />
                                    </Tooltip>
                                </div>
                                <div style={{marginInlineStart: '20px', textAlign: 'start'}}>
                                    {sizeColor[0].size && sizeColor.map(({size, colors}) => (
                                    <div  key={size}>
                                        <div  className='input-group-wrapper'>
                                            <input
                                                type='checkbox'
                                                id={size}
                                                name='size'
                                                value={size}
                                                checked={colors.some(color => color.inStock)}
                                                onChange={(e) => handleSizeChange(e.target, colors)}
                                            />
                                            <label htmlFor={size}>{size}</label>
                                            <Tooltip title="Delete Size" arrow placement="right">
                                                <DeleteIcon onClick={() => handleDelete(material, size)} />
                                            </Tooltip>
                                        </div>
                                        <div style={{marginInlineStart: '40px', textAlign: 'start'}}>
                                            {colors[0].color && colors.map(color => (
                                                <div key={color.id} className='input-group-wrapper'>
                                                    <input
                                                        type='checkbox'
                                                        id={color.id}
                                                        name='color'
                                                        value={color.id}
                                                        checked={color.inStock}
                                                        onChange={e => handleColorChange(e.target)}
                                                    />
                                                    <label htmlFor={color.id}>{color.color}</label>
                                                    <Tooltip title="Delete Color" arrow placement="right">
                                                        <DeleteIcon onClick={() => handleDelete(color.material, color.size, color.color)} />
                                                    </Tooltip>
                                                </div>
                                            ))}
                                            <div className='input-group-wrapper'>
                                                <input
                                                    type='checkbox'
                                                    id='new-color'
                                                    name='new-color'
                                                    disabled
                                                />
                                                <label
                                                    htmlFor='new-color'
                                                    ref={el => labelRefs.current[colors[0].id] = el}
                                                    contentEditable={true}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => handleLableEdit(e, colors[0].id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddNew(colors[0].id, colors, 'new-color')
                                                        }
                                                    }}
                                                    >
                                                        Add new color                                   
                                                </label>
                                                {showAddButtons[colors[0].id] && <span onClick={() => handleAddNew(colors[0].id, colors, 'new-color')}>
                                                        <Tooltip title={"Add Color"} arrow placement='right'>
                                                            <AddIcon/>
                                                        </Tooltip>
                                                    </span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className='input-group-wrapper'>
                                    <input
                                                    type='checkbox'
                                                    id='new-size'
                                                    name='new-size'
                                                    disabled
                                                />
                                                <label
                                                    htmlFor='new-size'
                                                    ref={el => labelRefs.current[material] = el}
                                                    contentEditable={true}
                                                    suppressContentEditableWarning={true}
                                                    onBlur={(e) => handleLableEdit(e, material)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddNew(material, sizeColor, 'new-size')
                                                        }
                                                    }}
                                                    >
                                                        Add new size                                   
                                                </label>
                                                {showAddButtons[material] && <span onClick={() => handleAddNew(material, sizeColor, 'new-size')}>
                                                        <Tooltip title={"Add Size"} arrow placement='right'>
                                                            <AddIcon/>
                                                        </Tooltip>
                                                    </span>}
                                            </div>
                                </div>
                            </div>
                        ))}
                        <button
                            className='small' 
                            onClick={openModal}
                            aria-expanded={isDialogOpen}
                            aria-controls="new-size-dialog"
                            aria-haspopup="dialog"
                            type="button"
                            >
                            + Add New Material
                        </button>              
                    </div>
                    {formError && <p className="error-message">{formError}</p>}
                    <button type='submit' disabled={!materialUpdated} onClick={handleSubmit}>{loading ? "Saving" : 'Save'}</button>
                    <button type='button' disabled={!materialUpdated} onClick={handleRestore}>Restore</button>
                </form>
                <dialog id='new-material-dialog' ref={dialogRef} onClick={(e) => handleDialogClick(e)}>
                    <div className="dialog-close-button-wrapper">
                        <button  onClick={() => closeModal()} className="dialog-close-button">Close <CloseSmallIcon/></button>
                    </div>
                    <form  onSubmit={createNewMaterial}>
                        <h3>Add new material</h3>
                        <div className='input-group-wrapper column'>
                            <label htmlFor='new-size'>New Material</label>
                            <input
                                type='text'
                                id='new-size'
                                name='new-size'
                                value={newMaterial}
                                onChange={e => setNewMaterial(e.target.value)}
                            />
                            </div>
                            {newMaterialError && <p>{newMaterialError}</p>}
                            <div className='input-group-wrapper column'>
                                <label htmlFor='new-size'>New Size</label>
                                <input
                                    type='text'
                                    id='new-size'
                                    name='new-size'
                                    value={newMaterialSize}
                                    onChange={e => setNewMaterialSize(e.target.value)}
                                />
                            </div>
                            <div className='input-group-wrapper column'>
                                <label htmlFor='new-size'>New Color</label>
                                <input
                                    type='text'
                                    id='new-size'
                                    name='new-size'
                                    value={newMaterialColor}
                                    onChange={e => setNewMaterialColor(e.target.value)}
                                />
                            </div>
                            <button type="submit">+ Add new material</button>
                        </form>
                    </dialog>
        </section>
    )
}