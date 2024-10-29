import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// MongoDB connection setup for testing
export const setupTestDB = () => {
    before(async () => {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agent_monitoring_test';
        await mongoose.connect(mongoURI);
    });

    after(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    });
};
