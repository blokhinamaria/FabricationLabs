import { getDB } from "../../config/database.js";

export async function createOrGetUser(email) {
    let role = 'student';
        if (email.endsWith('@spartan.ut.edu')) {
            role = 'student'
        } else if (email.endsWith('@ut.edu')) {
            role = 'faculty'
        } else {
            throw new Error ('Error: invalid email. UTampa email required')
        }

    const db = getDB()
    const collection = db.collection('users');
    
    let user = await collection.findOneAndUpdate( 
        { email },
        {
            $setOnInsert: {
                email: email,
                role: role,
                fullName: null,
                classes: [],
                createdAt: new Date(),
                isActive: true,
            },
        },
        {
            upsert: true,
            ReturnDocument: 'after'
        }
    );

    return user;
}