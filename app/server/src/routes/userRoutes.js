const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Post a new user
router.post('/', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

//Read all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

//Reads a user by their ID
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
});

// Updates a user by their ID
router.put('/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});