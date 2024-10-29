import { expect } from 'chai';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import sinon from 'sinon';
import { protect, generateToken, adminOnly } from '../../middleware/auth';
import User, { IUser } from '../../models/User';
import { setupTestDB } from '../test.config';
import jwt from 'jsonwebtoken';

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

        it('should fail with malformed authorization header', async () => {
            mockReq.headers = {
                authorization: 'InvalidBearer token'
            };

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, no token' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should fail with malformed token format', async () => {
            mockReq.headers = {
                authorization: 'Bearer token.without.threeparts'
            };

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, token failed' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should fail with expired token', async () => {
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            };

            const expiredToken = jwt.sign(
                { id: mockUser._id, role: mockUser.role },
                process.env.JWT_SECRET as string,
                { expiresIn: '0s' }
            );

            mockReq.headers = {
                authorization: `Bearer ${expiredToken}`
            };

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, token failed' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;
        });

        it('should fail if JWT_SECRET is not set', async () => {
            const originalSecret = process.env.JWT_SECRET;
            delete process.env.JWT_SECRET;

            mockReq.headers = {
                authorization: 'Bearer sometoken'
            };

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect((mockRes.status as sinon.SinonStub).calledWith(401)).to.be.true;
            expect((mockRes.json as sinon.SinonStub).calledWith({ 
                message: 'Not authorized, token failed' 
            })).to.be.true;
            expect(nextFunction.called).to.be.false;

            process.env.JWT_SECRET = originalSecret;
        });

        it('should pass if token is valid', async () => {
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

            const queryStub = {
                select: sinon.stub().returns(mockUser)
            };

            const findByIdStub = sinon.stub(User, 'findById').returns(queryStub as any);

            await protect(mockReq as Request, mockRes as Response, nextFunction);

            expect(findByIdStub.calledOnce).to.be.true;
            expect(queryStub.select.calledWith('-password')).to.be.true;
            expect(nextFunction.calledOnce).to.be.true;
            expect((mockReq as any).user).to.deep.equal(mockUser);
        });

        it('should fail if user is not found', async () => {
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

            const queryStub = {
                select: sinon.stub().returns(null)
            };

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

    describe('generateToken', () => {
        it('should generate a valid JWT token', () => {
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            } as IUser;

            const token = generateToken(mockUser);
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            expect(decoded).to.have.property('id');
            expect(decoded).to.have.property('role');
            expect(decoded.id.toString()).to.equal(mockUser._id.toString());
            expect(decoded.role).to.equal(mockUser.role);
        });

        it('should set token expiration to 24 hours', () => {
            const mockUser = {
                _id: new mongoose.Types.ObjectId(),
                username: 'testuser',
                email: 'test@example.com',
                role: 'user'
            } as IUser;

            const token = generateToken(mockUser);
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

            const expectedExp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
            expect(Math.abs(decoded.exp - expectedExp)).to.be.lessThan(5);
        });
    });
});
