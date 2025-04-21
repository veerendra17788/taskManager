exports.getCurrentUser = async (req, res) => {
    try {
      // Assuming `req.user` is populated by the authMiddleware
      const user = req.user; 
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  