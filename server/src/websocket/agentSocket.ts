import { Server, Socket } from 'socket.io';
import Agent from '../models/Agent';

interface AgentHeartbeat {
    name: string;
    metrics: {
        cpuUsage: number;
        memoryUsage: number;
        networkStats: {
            bytesIn: number;
            bytesOut: number;
        };
    };
    systemInfo: {
        platform: string;
        memory: { total: number; used: number };
        cpu: { model: string; usage: number };
        network: { ip: string; interfaces: string[] };
    };
}

export const setupAgentSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log('Client connected:', socket.id);

        socket.on('agent:heartbeat', async (data: AgentHeartbeat) => {
            try {
                const agent = await Agent.findOne({ name: data.name });
                if (agent) {
                    await agent.updateHeartbeat();
                    await agent.cleanOldMetrics();
                    
                    // Add new metrics
                    agent.metrics.push({
                        timestamp: new Date(),
                        cpuUsage: data.metrics.cpuUsage,
                        memoryUsage: data.metrics.memoryUsage,
                        networkStats: data.metrics.networkStats
                    });

                    // Update system info
                    agent.systemInfo = data.systemInfo;
                    await agent.save();

                    // Broadcast update to all connected clients
                    io.emit('agent:updated', agent);
                }
            } catch (error) {
                console.error('Error processing heartbeat:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
