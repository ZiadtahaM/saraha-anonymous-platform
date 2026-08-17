import { User } from '../db/models/usermodel.js'; 
import cloudinary from '../config/clodinary.config.js';
import fs from 'fs/promises';

export const uploadProfilePicture = async (req, res) => {
    const { _id } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
    
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "user-profiles",
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        });

   
        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { profilePicture: result.secure_url },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            await fs.unlink(file.path);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await fs.unlink(file.path);

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            user: updatedUser
        });

    } catch (error) {
     
        if (file) {
            await fs.unlink(file.path).catch(console.error);
        }

        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture',
            error: error.message
        });
    }
};