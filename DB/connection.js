import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables from config.env
dotenv.config({ path: 'config.env' });

const mongodbURI = process.env.DB_URI
const dbName = process.env.DB_Name

// Create a new MongoClient
const client = new MongoClient(mongodbURI);

// Connect to the MongoDB server
export const connectDb = async () => {
    try {
        await client.connect();
        return true;
    } catch (err) {
        console.error('Failed to connect to MongoDB server:', err);
        return false;
    }
};

export const db = client.db(dbName);
