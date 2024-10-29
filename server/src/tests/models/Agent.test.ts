import { expect } from 'chai';
import mongoose from 'mongoose';
import AgentModel from '../../models/Agent';
import { setupTestDB } from '../test.config';

describe('Agent Model Test', () => {
    setupTestDB();

    it('should create a new agent successfully', async () => {
        const validAgent = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            lastHeartbeat: new Date(),
            systemInfo: {
                platform: 'linux',
                memory: {
                    total: 16000000000,
                    used: 8000000000
                },
                cpu: {
                    model: 'Intel i7',
                    usage: 45.5
                },
                network: {
                    ip: '192.168.1.1',
                    interfaces: ['eth0', 'wlan0']
                }
            },
            metrics: [{
                timestamp: new Date(),
                cpuUsage: 45.5,
                memoryUsage: 75.5,
                networkStats: {
                    bytesIn: 1000,
                    bytesOut: 500
                }
            }],
            tags: ['production', 'web-server'],
            version: '1.0.0'
        });

        const savedAgent = await validAgent.save();
        expect(savedAgent._id).to.exist;
        expect(savedAgent.name).to.equal('TestAgent');
        expect(savedAgent.status).to.equal('online');
        expect(savedAgent.systemInfo.platform).to.equal('linux');
        expect(savedAgent.createdAt).to.exist;
        expect(savedAgent.updatedAt).to.exist;
    });

    it('should fail to create an agent without required fields', async () => {
        const agentWithoutName = new AgentModel({
            status: 'online',
            lastHeartbeat: new Date()
        });

        try {
            await agentWithoutName.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error.errors.name).to.exist;
            } else {
                throw error;
            }
        }
    });

    it('should not save duplicate agent names', async () => {
        const agent1 = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        const agent2 = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'windows',
                memory: { total: 8000000000, used: 4000000000 },
                cpu: { model: 'Intel i5', usage: 30.5 },
                network: { ip: '192.168.1.2', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        await agent1.save();

        try {
            await agent2.save();
            expect.fail('Should have thrown duplicate key error');
        } catch (error: any) {
            expect(error.code).to.equal(11000);
        }
    });

    it('should validate status enum values', async () => {
        const agentWithInvalidStatus = new AgentModel({
            name: 'TestAgent',
            status: 'invalid-status',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        try {
            await agentWithInvalidStatus.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error.errors.status).to.exist;
            } else {
                throw error;
            }
        }
    });

    it('should update agent status', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        await agent.save();
        
        const updatedAgent = await AgentModel.findOneAndUpdate(
            { _id: agent._id },
            { status: 'offline' },
            { new: true }
        );

        expect(updatedAgent?.status).to.equal('offline');
    });

    it('should handle lastError updates', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        await agent.save();

        const error = new Error('Test error');
        const updatedAgent = await AgentModel.findOneAndUpdate(
            { _id: agent._id },
            {
                status: 'error',
                lastError: {
                    message: error.message,
                    timestamp: new Date(),
                    stack: error.stack
                }
            },
            { new: true }
        );

        expect(updatedAgent?.status).to.equal('error');
        expect(updatedAgent?.lastError?.message).to.equal('Test error');
        expect(updatedAgent?.lastError?.timestamp).to.exist;
        expect(updatedAgent?.lastError?.stack).to.exist;
    });

    it('should update heartbeat and clean old metrics', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'offline',
            lastHeartbeat: new Date(Date.now() - 1000),
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        await agent.save();
        
        const updatedAgent = await agent.updateHeartbeat();
        expect(updatedAgent.status).to.equal('online');
        expect(updatedAgent.lastHeartbeat.getTime()).to.be.closeTo(Date.now(), 1000);

        // Test cleanOldMetrics method
        const oldMetric = {
            timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000),
            cpuUsage: 45.5,
            memoryUsage: 75.5,
            networkStats: { bytesIn: 1000, bytesOut: 500 }
        };

        const newMetric = {
            timestamp: new Date(),
            cpuUsage: 55.5,
            memoryUsage: 85.5,
            networkStats: { bytesIn: 2000, bytesOut: 1000 }
        };

        updatedAgent.metrics = [oldMetric, newMetric];
        await updatedAgent.save();

        const cleanedAgent = await updatedAgent.cleanOldMetrics();
        expect(cleanedAgent.metrics.length).to.equal(1);
        expect(cleanedAgent.metrics[0].cpuUsage).to.equal(55.5);
    });

    it('should handle tag operations', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            tags: ['production'],
            version: '1.0.0'
        });

        await agent.save();

        // Add tag
        agent.tags.push('high-priority');
        await agent.save();
        expect(agent.tags).to.include('high-priority');

        // Remove tag
        agent.tags = agent.tags.filter(tag => tag !== 'production');
        await agent.save();
        expect(agent.tags).to.not.include('production');
    });

    it('should validate system info structure', async () => {
        const agentWithInvalidSystemInfo = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                // Missing required memory and cpu fields
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        try {
            await agentWithInvalidSystemInfo.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error).to.exist;
            } else {
                throw error;
            }
        }
    });

    it('should validate metrics structure', async () => {
        const agentWithInvalidMetrics = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            metrics: [{
                // Missing required fields
                timestamp: new Date()
            }],
            version: '1.0.0'
        });

        try {
            await agentWithInvalidMetrics.save();
            expect.fail('Should have thrown validation error');
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error).to.exist;
            } else {
                throw error;
            }
        }
    });

    it('should update timestamps on modification', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'online',
            systemInfo: {
                platform: 'linux',
                memory: { total: 16000000000, used: 8000000000 },
                cpu: { model: 'Intel i7', usage: 45.5 },
                network: { ip: '192.168.1.1', interfaces: ['eth0'] }
            },
            version: '1.0.0'
        });

        const savedAgent = await agent.save();
        const createdAt = savedAgent.createdAt;
        const updatedAt = savedAgent.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 1000));

        savedAgent.status = 'offline';
        const updatedAgent = await savedAgent.save();

        expect(updatedAgent.createdAt.toISOString()).to.equal(createdAt.toISOString());
        expect(updatedAgent.updatedAt.toISOString()).to.not.equal(updatedAt.toISOString());
    });

    it('should verify index existence', async () => {
        const indexes = await AgentModel.collection.getIndexes();
        
        // Check status and lastHeartbeat compound index
        expect(indexes['status_1_lastHeartbeat_-1']).to.exist;
        
        // Check tags index
        expect(indexes['tags_1']).to.exist;
    });
});
