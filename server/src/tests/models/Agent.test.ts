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
                expect(error).to.exist;
                expect(error).to.be.instanceOf(mongoose.Error.ValidationError);
            } else {
                throw error;
            }
        }
    });

    it('should update agent status', async () => {
        const agent = new AgentModel({
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
                    interfaces: ['eth0']
                }
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

    it('should update heartbeat and clean old metrics', async () => {
        const agent = new AgentModel({
            name: 'TestAgent',
            status: 'offline',
            lastHeartbeat: new Date(Date.now() - 1000), // 1 second ago
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
                    interfaces: ['eth0']
                }
            },
            version: '1.0.0'
        });

        await agent.save();
        
        // Test updateHeartbeat method
        const updatedAgent = await agent.updateHeartbeat();
        expect(updatedAgent.status).to.equal('online');
        expect(updatedAgent.lastHeartbeat.getTime()).to.be.closeTo(Date.now(), 1000);

        // Test cleanOldMetrics method
        const oldMetric = {
            timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
            cpuUsage: 45.5,
            memoryUsage: 75.5,
            networkStats: {
                bytesIn: 1000,
                bytesOut: 500
            }
        };

        const newMetric = {
            timestamp: new Date(), // now
            cpuUsage: 55.5,
            memoryUsage: 85.5,
            networkStats: {
                bytesIn: 2000,
                bytesOut: 1000
            }
        };

        updatedAgent.metrics = [oldMetric, newMetric];
        await updatedAgent.save();

        const cleanedAgent = await updatedAgent.cleanOldMetrics();
        expect(cleanedAgent.metrics.length).to.equal(1);
        expect(cleanedAgent.metrics[0].cpuUsage).to.equal(55.5);
    });
});
