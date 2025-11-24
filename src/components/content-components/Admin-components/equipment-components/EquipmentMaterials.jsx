export default function EquipmentMaterials() {

    const [ materials, setMaterials ] = useState(equipment?.materials);
    const groupedByMaterial = {...Object.groupBy(materials, ({material}) => material)}
    const groupedByMaterialAndSize = Object.fromEntries(
        Object.entries(groupedByMaterial).map(([material, sizeColors]) => [
            material,
            Object.entries(Object.groupBy(sizeColors, ({ size }) => size)).map(([size, colors]) => ({
            size,
            colors
            }))
        ])
        );
    const [ newColorLabel, setNewColorLabel ] = useState('Add New Color')
    const labelRefs = useRef({});
    const [showAddButtons, setShowAddButtons] = useState({});
    const dialogRef = useRef({});

    const navigate = useNavigate();
    const [ materialError, setMaterialError ] = useState('')

    console.log(materials)
    

    function handleMaterialChange(target, sizeColors) {
        const materialsIds = sizeColors.flatMap(({colors}) => colors.map(color => color.id))
        const updatedMaterials = materials.map((material) => {
            if (materialsIds.includes(material.id)) {
                return {...material, inStock: target.checked}
            }
            return material
        })
        setMaterials(updatedMaterials);
        setIsUpdated(true)
    }

    function handleSizeChange(target, colors) {
        const materialIds = colors.map(color => color.id)
        const updatedMaterials = materials.map((material) => {
            if (materialIds.includes(material.id)) {
                    return {...material, inStock: target.checked}
                }
                return material;
            })
            console.log(updatedMaterials)
            setMaterials(updatedMaterials);
            setIsUpdated(true)
    }

    function handleColorChange(target) {
        const updatedMaterials = materials.map((material) => {
                if (material.id === target.value) {
                    return {...material, inStock: target.checked}
                }
                return material;
            })
        setMaterials(updatedMaterials);
        setIsUpdated(true)
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
        if(type === 'new-color') {
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
    });
}

    const [newMaterial, setNewMaterial] = useState('')
    const [newMaterialSize, setNewMaterialSize] = useState('')
    const [newMaterialColor, setNewMaterialColor] = useState('')
    const [ newMaterialError, setNewMaterialError] = useState('')

    function createNewMaterial() {
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
            closeModal()
            return;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setMaterialError('')
        const equipmentUpdates = {}

        //Materials updates
        function inStockIds(material) {
            if (material.inStock) {
                return material.id
            }
        }
        const prevInStockIds = equipment.materials.map(material => inStockIds(material)).sort().join(',')
        const curentInStockIds = materials.map(material => inStockIds(material)).sort().join(',')
        const materialsStockChanged = prevInStockIds !== curentInStockIds;

        if (materialsStockChanged) {
            equipmentUpdates.materials = materials.map(material => material)
        }

        console.log(equipmentUpdates);
        if(equipmentUpdates) {
            await updateEquipment(equipmentUpdates)
        }
        return;
    }

    async function updateEquipment(differences) {
        try {
            const response = await fetch(`/api/equipment?id=${equipment._id}`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(differences)
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                navigate('/admin-dashboard/equipment')

            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }


    return (
        <section>
            <form onSubmit={handleSubmit}>
                    
                    <div>
                        <p>Materials</p>
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
                                    <span onClick={() => handleDelete(material)}>🗑️</span>
                                </div>
                                {sizeColor[0].size && sizeColor.map(({size, colors}) => (
                                    <div style={{marginInlineStart: '20px', textAlign: 'start'}} key={size}>
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
                                            <span onClick={() => handleDelete(material, size)}>🗑️</span>
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
                                                    <span onClick={() => handleDelete(color.material, color.size, color.color)}>🗑️</span>
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
                                                {showAddButtons[colors[0].id] && <span onClick={() => handleAddNew(colors[0].id, colors, 'new-color')}>❇️</span>}
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
                                                {showAddButtons[material] && <span onClick={() => handleAddNew(material, sizeColor, 'new-size')}>❇️</span>}
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
                                        <dialog id='new-material-dialog' ref={dialogRef} onClick={(e) => handleDialogClick(e)}>
                                            <button onClick={() => closeModal()}>Cancel</button>
                                            <h4>Add new material</h4>
                                                <div className='input-group-wrapper'>
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
                                                <div className='input-group-wrapper'>
                                                    <label htmlFor='new-size'>New Size</label>
                                                    <input
                                                        type='text'
                                                        id='new-size'
                                                        name='new-size'
                                                        value={newMaterialSize}
                                                        onChange={e => setNewMaterialSize(e.target.value)}
                                                    />
                                                </div>
                                                <div className='input-group-wrapper'>
                                                    <label htmlFor='new-size'>New Color</label>
                                                    <input
                                                        type='text'
                                                        id='new-size'
                                                        name='new-size'
                                                        value={newMaterialColor}
                                                        onChange={e => setNewMaterialColor(e.target.value)}
                                                    />
                                                </div>
                                                <button type="button" onClick={createNewMaterial}>Submit</button>
                                        </dialog>
                    </div>
                    <div>
                        <textarea disabled>
                            {equipment.fileRequirements}
                        </textarea>
                    </div>
                    <button type='submit' onClick={handleSubmit}>Submit</button>
                    <button onClick={handleCancel}>Cancel</button>
                </form>
        </section>
    )
}