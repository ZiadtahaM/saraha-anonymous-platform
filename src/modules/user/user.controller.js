import { User } from '../../db/models/usermodel.js';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'
import { hashSync ,compareSync } from 'bcrypt';
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Fetch all users excluding the password field
    res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, confpass, phone, gender, DOB } = req.body;

    // Password confirmation check
    if (password !== confpass) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirmation do not match'
      });
    }

    // Create user without password hashing (handled by pre-save hook)
    const newUser = await User.create({
      username,
      email,
      password, // Will be hashed automatically
      phone,
      gender,
      DOB: new Date(DOB)
    });

    res.status(201).json({
      success: true,
      data: newUser
    });

  } catch (error) {
    console.error('Registration Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password.' });
  
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ msg: 'Invalid email or password.' });
    }
    const token =jwt.sign({email},process.env.JWT_SECRET,{expiresIn:"1h"})
    res.status(200).json({ msg: 'Login successful.', user ,token});
  } catch (error) {
    console.error('Error in signIn:', error);
    res.status(500).json({ msg: 'An error occurred during sign-in.', error: error.message });
  }
};