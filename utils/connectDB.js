import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        console.log("✅ Successfully connected to MongoDB!");
        
        // Test inserting data
        // const db = client.db('appointmentDB');
        // const collection = db.collection('bookings');
        
        // const result = await collection.insertOne({
        //     test: 'Hello from Node.js!',
        //     timestamp: new Date()
        // });
        
        // console.log("✅ Test document inserted:", result.insertedId);
        
        // await client.close();
        // console.log("✅ Connection closed");
        const db = client.db('fabrication-labs');
        return { client, db };
    } catch (error) {
        console.error("❌ connectDB failed:", error);
    }
}