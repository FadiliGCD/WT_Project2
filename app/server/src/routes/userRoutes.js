const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Post a new user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

