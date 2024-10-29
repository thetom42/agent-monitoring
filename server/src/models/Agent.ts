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
    createdAt: Date;
    updatedAt: Date;
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
        type: {
            platform: {
                type: String,
                required: true
            },
            memory: {
                type: {
                    total: {
                        type: Number,
                        required: true
                    },
                    used: {
                        type: Number,
                        required: true
                    }
                },
                required: true
            },
            cpu: {
                type: {
                    model: {
                        type: String,
                        required: true
                    },
                    usage: {
                        type: Number,
                        required: true
                    }
                },
                required: true
            },
            network: {
                type: {
                    ip: {
                        type: String,
                        required: true
                    },
                    interfaces: {
                        type: [String],
                        required: true
                    }
                },
                required: true
            }
        },
        required: true
    },
    metrics: [{
        timestamp: {
            type: Date,
            default: Date.now,
            required: true
        },
        cpuUsage: {
            type: Number,
            required: true
        },
        memoryUsage: {
            type: Number,
            required: true
        },
        networkStats: {
            type: {
                bytesIn: {
                    type: Number,
                    required: true
                },
                bytesOut: {
                    type: Number,
                    required: true
                }
            },
            required: true
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
