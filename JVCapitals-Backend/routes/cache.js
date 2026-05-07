import express from 'express';
import { cacheService } from '../services/cacheService.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get cache statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stats = cacheService.getStats();
    const keys = cacheService.keys();
    const size = cacheService.size();
    
    res.json({
      stats,
      size,
      sampleKeys: keys.slice(0, 10), // Show first 10 keys for debugging
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache statistics' });
  }
});

// Clear cache (admin only)
router.delete('/clear', authenticateToken, requireAdmin, (req, res) => {
  try {
    const flushed = cacheService.flush();
    res.json({
      message: 'Cache cleared successfully',
      flushed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Invalidate cache by pattern (admin only)
router.delete('/invalidate', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({ error: 'Pattern is required' });
    }
    
    const invalidatedCount = cacheService.invalidatePattern(pattern);
    
    res.json({
      message: `Invalidated ${invalidatedCount} cache entries`,
      pattern,
      invalidatedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Invalidate cache error:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

// Get cache keys (admin only)
router.get('/keys', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    
    const allKeys = cacheService.keys();
    const filteredKeys = pattern === '*' 
      ? allKeys 
      : allKeys.filter(key => key.includes(pattern));
    
    const limitedKeys = filteredKeys.slice(0, parseInt(limit));
    
    res.json({
      keys: limitedKeys,
      total: filteredKeys.length,
      pattern,
      limit: parseInt(limit),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get cache keys error:', error);
    res.status(500).json({ error: 'Failed to get cache keys' });
  }
});

export default router;
