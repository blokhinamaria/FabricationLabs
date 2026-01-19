import { ObjectId } from "bson";
import { getDB } from "../config/database.js";
import { parseJSONBody } from "../utils/parseJSONBody.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { sendResponse } from "../utils/sendResponse.js";
import { sendEmail } from "../utils/services/emailService.js";

export async function updateUser(req, res, id) {
    try {
        let parsedData = await parseJSONBody(req)

        if (!parsedData) {
            return sendResponse(res, 400, { error: 'Failed to receive new data' })
        }

        const sanitizedData = sanitizeInput(parsedData)

        const db = getDB();
        let collection = db.collection('users');

        const result = await collection.updateOne(
            {_id: new ObjectId(id)},
            { $set: {...sanitizedData, updatedAt: new Date()}} 
        )

        return sendResponse(res, 200, { modified: result.modifiedCount, message: `User updated` })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Failed to update the user. Please try again later' })
    }
}

export async function adminContactUser(req, res, id) {
    let parsedData = await parseJSONBody(req)
    
    if (!parsedData) {
        return sendResponse(res, 400, { error: 'Failed to receive new data' })
    }
    
    const sanitizedData = sanitizeInput(parsedData)

    const { subject, message } = sanitizedData;

    if (!subject || subject.length === 0 || !message || message.length === 0) {
        return sendResponse(res, 400, { error: "Subject and Body are required" });
    }

    const db = getDB();
    const users = db.collection("users");

    const recipient = await users.findOne({ _id: new ObjectId(id) });
    if (!recipient) {
        return sendResponse(res, 404, { error: "User not found" })
    }

    try {
        await sendEmail({
            to: recipient.email,
            subject: subject,
            html: message,
        });
        return sendResponse(res, 200, { message: "Email sent" })
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, { error: 'Error sending the email' })
    }
}