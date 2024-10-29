import { expect } from 'chai';
import mongoose from 'mongoose';
import UserModel from '../../models/User';
import { setupTestDB } from '../test.config';
import bcrypt from 'bcryptjs';

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
        // Should have timestamps
        expect(savedUser.createdAt).to.exist;
        expect(savedUser.updatedAt).to.exist;
        // Should have default role
        expect(savedUser.role).to.equal('user');
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
                expect(error.errors.email).to.exist;
                expect(error.errors.password).to.exist;
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

    it('should not save duplicate email', async () => {
        const firstUser = new UserModel({
            username: 'user1',
            password: 'Password123!',
            email: 'test@example.com'
        });

        const duplicateUser = new UserModel({
            username: 'user2',
            password: 'Password456!',
            email: 'test@example.com'
        });

        await firstUser.save();

        try {
            await duplicateUser.save();
            expect.fail('Should have thrown duplicate key error');
        } catch (error: any) {
            expect(error).to.exist;
            expect(error.code).to.equal(11000);
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

    it('should only hash password if modified', async () => {
        const user = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        await user.save();
        const originalHash = user.password;

        // Update username only
        user.username = 'newusername';
        await user.save();

        expect(user.password).to.equal(originalHash);
    });

    it('should hash password on update', async () => {
        const user = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        await user.save();
        const originalHash = user.password;

        // Update password
        user.password = 'NewPassword123!';
        await user.save();

        expect(user.password).to.not.equal(originalHash);
        expect(user.password).to.not.equal('NewPassword123!');
        
        // Verify new password works
        const isMatch = await user.comparePassword('NewPassword123!');
        expect(isMatch).to.be.true;
    });

    it('should validate role field', async () => {
        const userWithInvalidRole = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com',
            role: 'invalid_role'
        });

        try {
            await userWithInvalidRole.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error.errors.role).to.exist;
            } else {
                throw error;
            }
        }
    });

    it('should allow setting admin role', async () => {
        const adminUser = new UserModel({
            username: 'admin',
            password: 'Password123!',
            email: 'admin@example.com',
            role: 'admin'
        });

        const savedUser = await adminUser.save();
        expect(savedUser.role).to.equal('admin');
    });

    it('should update timestamps on modification', async () => {
        const user = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        const savedUser = await user.save();
        const createdAt = savedUser.createdAt;
        const updatedAt = savedUser.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 1000));

        user.username = 'newusername';
        const updatedUser = await user.save();

        expect(updatedUser.createdAt.toISOString()).to.equal(createdAt.toISOString());
        expect(updatedUser.updatedAt.toISOString()).to.not.equal(updatedAt.toISOString());
    });

    it('should handle password hashing error gracefully', async () => {
        // Mock bcrypt to simulate error
        const originalGenSalt = bcrypt.genSalt;
        bcrypt.genSalt = async () => { throw new Error('Mocked bcrypt error'); };

        const user = new UserModel({
            username: 'testuser',
            password: 'Password123!',
            email: 'test@example.com'
        });

        try {
            await user.save();
            expect.fail('Should have thrown error');
        } catch (error: any) {
            expect(error.message).to.equal('Mocked bcrypt error');
        } finally {
            // Restore original bcrypt function
            bcrypt.genSalt = originalGenSalt;
        }
    });
});
