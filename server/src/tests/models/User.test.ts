import { expect } from 'chai';
import mongoose from 'mongoose';
import UserModel from '../../models/User';
import { setupTestDB } from '../test.config';

describe('User Model Test', () => {
    setupTestDB();

    it('should create a new user successfully', async () => {
        const validUser = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        const savedUser = await validUser.save();
        expect(savedUser._id).to.exist;
        expect(savedUser.username).to.equal('testuser');
        expect(savedUser.email).to.equal('test@example.com');
        // Password should be hashed
        expect(savedUser.password).to.not.equal('Password123!');
    });

    it('should fail to create a user without required fields', async () => {
        const userWithoutRequiredField = new UserModel({
            username: 'testuser'
        });

        try {
            await userWithoutRequiredField.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error).to.exist;
                expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
            } else {
                throw error;
            }
        }
    });

    it('should not save duplicate username', async () => {
        const firstUser = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test1@example.com'
        });

        const duplicateUser = new UserModel({
            username: 'testuser',
            password: 'Password456!',
            email: 'test2@example.com'
        });

        await firstUser.save();

        try {
            await duplicateUser.save();
            expect.fail('Should have thrown duplicate key error');
        } catch (error: any) {
            expect(error).to.exist;
            expect(error.code).to.equal(11000); // MongoDB duplicate key error code
        }
    });

    it('should compare password correctly', async () => {
        const user = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        await user.save();

        const isMatch = await user.comparePassword('Password123!');
        expect(isMatch).to.be.true;

        const isNotMatch = await user.comparePassword('wrongpassword');
        expect(isNotMatch).to.be.false;
    });
});
