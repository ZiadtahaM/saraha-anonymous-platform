import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { genderEnum, ProvidersEnum, systemRoles } from '../../constants/constants.js';
import joi from 'joi';
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilePicture: String,
  coverPictures: [String],
  confirmOTP: String,
  forgetOTP: String,
  role: {
    type: String,
    enum: Object.values(systemRoles),
    default: systemRoles.USER
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  DOB: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: Object.values(genderEnum),
    required: [true, 'Gender is required']
  },
  provider: {
    type: String,
    enum: Object.values(ProvidersEnum),
    default: ProvidersEnum.LOCAL
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Proper password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const joiuserSchemaa =joi.Object({
  name:joi.String().min(3).required(),
  email:joi.String().email().required(),
  password:joi.String().min(8).required(),
  confpass:joi.String().valid(joi.ref('password')).required(),
  DOB:joi.Date().required(),
  gender:joi.String().valid('male', 'female').required()
})

export const User = mongoose.model('User', userSchema,joiuserSchemaa);