import mongoose from 'mongoose';

export interface IAgent extends mongoose.Document {
    name: string;
    status: 'online' | 'offline' | 'error';
    lastHeartbeat: Date;
    systemInfo: {
        platform: string;
        memory: {
            total: number;
            used: number;
        };
        cpu: {
            model: string;
            usage: number;
        };
        network: {
            ip: string;
            interfaces: string[];
        };
    };
    metrics: {
        timestamp: Date;
        cpuUsage: number;
        memoryUsage: number;
        networkStats: {
            bytesIn: number;
            bytesOut: number;
        };
    }[];
    tags: string[];
    version: string;
    lastError?: {
        message: string;
        timestamp: Date;
        stack?: string;
    };
    updateHeartbeat(): Promise<IAgent>;
    cleanOldMetrics(): Promise<IAgent>;
}

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'error'],
        default: 'offline'
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    },
    systemInfo: {
        platform: String,
        memory: {
            total: Number,
            used: Number
        },
        cpu: {
            model: String,
            usage: Number
        },
        network: {
            ip: String,
            interfaces: [String]
        }
    },
    metrics: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        cpuUsage: Number,
        memoryUsage: Number,
        networkStats: {
            bytesIn: Number,
            bytesOut: Number
        }
    }],
    tags: [String],
    version: String,
    lastError: {
        message: String,
        timestamp: Date,
        stack: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
agentSchema.index({ status: 1, lastHeartbeat: -1 });
agentSchema.index({ tags: 1 });

// Automatically update status based on heartbeat
agentSchema.methods.updateHeartbeat = function(this: IAgent): Promise<IAgent> {
    this.lastHeartbeat = new Date();
    this.status = 'online';
    return this.save();
};

// Clean old metrics (keep last 24 hours)
agentSchema.methods.cleanOldMetrics = function(this: IAgent): Promise<IAgent> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneDayAgo);
    return this.save();
};

export default mongoose.model<IAgent>('Agent', agentSchema);
