import { expect } from 'chai';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { protect, generateToken, adminOnly } from '../../middleware/auth';
import User, { IUser } from '../../models/User';
import { setupTestDB } from '../test.config';

describe('Auth Middleware', () => {
    setupTestDB();

    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let nextFunction: sinon.SinonSpy;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        nextFunction = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('protect middleware', () => {
        it('should fail if no token is provided', async () => {
            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, no token' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should fail if token is invalid', async () => {
            mockReq.headers = {
                authorization: 'Bearer invalid_token'
            };

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, token failed' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should pass if token is valid', async () => {
            // Create a mock user
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            };

            // Generate a valid token
            const token = generateToken(mockUser as IUser);
            mockReq.headers = {
                authorization: `Bearer ${token}`
            };

            // Create a chainable query stub
            const queryStub = {
                select: sinon.stub().returns(mockUser)
            };

            // Setup the User.findById stub to return the chainable query
            const findByIdStub = sinon.stub(User, 'findById').returns(queryStub as any);

            // Call the middleware
            await protect(mockReq as Request, mockRes as Response, nextFunction);

            // Verify the stubs were called correctly
            expect(findByIdStub.calledOnce).to.be.true;
            expect(queryStub.select.calledWith('-password')).to.be.true;
            
            // Verify next was called and user was attached
            expect(nextFunction.calledOnce).to.be.true;
            expect((mockReq as any).user).to.deep.equal(mockUser);
        });

        it('should fail if user is not found', async () => {
            // Create a mock user for token generation
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            };

            const token = generateToken(mockUser as IUser);
            mockReq.headers = {
                authorization: `Bearer ${token}`
            };

            // Create a chainable query stub that returns null
            const queryStub = {
                select: sinon.stub().returns(null)
            };

            // Setup the User.findById stub to return the chainable query
            sinon.stub(User, 'findById').returns(queryStub as any);

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'User not found' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });
    });

    describe('adminOnly middleware', () => {
        it('should pass if user is admin', () => {
            mockReq.user = {
                _id: new mongoose.Types.ObjectId(),
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                password: 'hashedpassword'
            } as IUser;

            adminOnly(mockReq as Request, mockRes as Response, nextFunction);

            expect(nextFunction.calledOnce).to.be.true;
            expect((mockRes.status as sinon.SinonStub).called).to.be.false;
        });

        it('should fail if user is not admin', () => {
            mockReq.user = {
                _id: new mongoose.Types.ObjectId(),
                username: 'user',
                email: 'user@example.com',
                role: 'user',
                password: 'hashedpassword'
            } as IUser;

            adminOnly(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(403)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({
                message: 'Not authorized as admin'
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should fail if no user is attached to request', () => {
            adminOnly(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(403)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({
                message: 'Not authorized as admin'
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });
    });
});
