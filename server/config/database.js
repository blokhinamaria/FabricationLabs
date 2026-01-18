import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let client = null;

export async function connectDB() {
    if (db) {
        return db
    }

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            tls: true,
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        await client.connect();
        db = client.db('fabrication-labs');
        console.log("Successfully connected to MongoDB");
        return db;
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit if can't connect
    }
}

export function getDB() {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
}

export async function closeDB() {
    if (client) {
        await client.close();
        console.log("MongoDB connection closed");
    }
}