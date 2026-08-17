import Joi from 'joi';

// Validation middleware factory
const validation = (schema) => {
    return (req, res, next) => {
        const data = { 
            ...req.body, 
            ...req.query, 
            ...req.params 
        };
        
        console.log('Incoming data:', data);
        
  
        const result = schema.validate(data, { abortEarly: false });
     
        if (result.error) {
          
            const messageList = result.error.details.map((obj) => obj.message);
            return next({ status: 400, message: messageList.join(', ') });
        }
        
        return next();
    };
};


export const validateUserRegistration = (req, res, next) => {
    const { username, email, password, confpass, DOB, gender } = req.body;
    
    // Ensure all required fields are present
    if (!username || !email || !password || !confpass || !DOB || !gender) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    next();
};


export default validation;