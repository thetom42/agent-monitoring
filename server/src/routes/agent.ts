import express from 'express';
import { protect, adminOnly } from '../middleware/auth';
import Agent from '../models/Agent';

const router = express.Router();

// Get all agents
router.get('/', protect, async (_req, res) => {
    try {
        const agents = await Agent.find({}).sort('-lastHeartbeat');
        return res.json(agents);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching agents' });
    }
});

// Create new agent
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const agent = new Agent(req.body);
        await agent.save();
        return res.status(201).json(agent);
    } catch (error) {
        return res.status(400).json({ message: 'Error creating agent' });
    }
});

// Get single agent
router.get('/:id', protect, async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        return res.json(agent);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching agent' });
    }
});

// Update agent
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const agent = await Agent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        return res.json(agent);
    } catch (error) {
        return res.status(400).json({ message: 'Error updating agent' });
    }
});

// Delete agent
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        return res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting agent' });
    }
});

export default router;
