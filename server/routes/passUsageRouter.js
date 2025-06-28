
import express from 'express';
import mongoose from 'mongoose';
import PassUsage from '../models/PassUsage.js';
import Pass from '../models/Pass.js';

const router = express.Router();

// Get usage history by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const usageHistory = await PassUsage.find({ userId })
      .populate('passId')
      .sort({ scannedAt: -1 });
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching pass usage history:', error);
    res.status(500).json({ error: 'Failed to fetch pass usage history' });
  }
});

// Get all pass usages for admin verification
router.get('/admin', async (req, res) => {
  try {
    const usageHistory = await PassUsage.find({})
      .populate({
        path: 'passId',
        populate: {
          path: 'routeId',
          select: 'start end'
        }
      })
      .sort({ scannedAt: -1 })
      .limit(100); // Limit to recent 100 records
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching admin pass usage:', error);
    res.status(500).json({ error: 'Failed to fetch pass usage for admin' });
  }
});

// Verify pass usage by admin
router.post('/:usageId/verify', async (req, res) => {
  try {
    const { usageId } = req.params;
    const { isVerified, verifiedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(usageId)) {
      return res.status(400).json({ error: 'Invalid usage ID format' });
    }

    const usage = await PassUsage.findByIdAndUpdate(
      usageId,
      {
        isVerified,
        verifiedBy,
        verificationDate: new Date()
      },
      { new: true }
    ).populate('passId');

    if (!usage) {
      return res.status(404).json({ error: 'Pass usage not found' });
    }

    res.json({
      success: true,
      message: `Pass usage ${isVerified ? 'approved' : 'rejected'} successfully`,
      usage
    });
  } catch (error) {
    console.error('Error verifying pass usage:', error);
    res.status(500).json({ error: 'Failed to verify pass usage' });
  }
});

// Record pass usage when QR is scanned
router.post('/', async (req, res) => {
  try {
    const { userId, passId, location, busId, stationName } = req.body;
    
    if (!userId || !passId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate passId
    if (!mongoose.Types.ObjectId.isValid(passId)) {
      return res.status(400).json({ error: 'Invalid pass ID format' });
    }

    // Check if pass exists and is valid
    const existingPass = await Pass.findById(passId);
    if (!existingPass) {
      return res.status(400).json({ error: 'Pass not found' });
    }

    // Check if pass belongs to the user
    if (existingPass.userId !== userId) {
        return res.status(403).json({ error: 'Pass does not belong to this user' });
    }

    // Check if pass is expired
    if (new Date(existingPass.expiryDate) < new Date()) {
        return res.status(400).json({ error: 'Pass has expired' });
    }

    // Check if user already used pass today (prevent multiple scans same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUsage = await PassUsage.findOne({
      userId,
      passId,
      scannedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (todayUsage) {
      return res.status(400).json({ 
        error: 'Pass already used today',
        existingUsage: todayUsage
      });
    }
    
    const newUsage = new PassUsage({
      userId,
      passId,
      location: location || 'Unknown Location',
      busId,
      stationName,
      scannedAt: new Date(),
      isVerified: false
    });
    
    const savedUsage = await newUsage.save();
    const populatedUsage = await PassUsage.findById(savedUsage._id)
      .populate({
        path: 'passId',
        populate: {
          path: 'routeId',
          select: 'start end'
        }
      });
    
    res.status(201).json({
      message: 'Pass usage recorded successfully',
      usage: populatedUsage
    });
  } catch (error) {
    console.error('Error recording pass usage:', error);
    res.status(500).json({ error: 'Failed to record pass usage' });
  }
});

export default router;
