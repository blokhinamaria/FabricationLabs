import { MongoClient } from 'mongodb';

import dotenv from 'dotenv';

dotenv.config();


export async function connectDB() {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            tls: true,
            maxPoolSize: 10,
            minPoolSize: 5,
        });
        console.log("✅ Successfully connected to MongoDB!");
        const db = client.db('fabrication-labs');
        return { client, db };
    } catch (error) {
        console.error("❌ connectDB failed:", error);
    }
}