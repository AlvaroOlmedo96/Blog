import jwt from 'jsonwebtoken';
import config from '../config';
import Role from '../models/Role.model';
import User from '../models/User.model';


export const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers["x-access-token"];
        if(!token) return res.status(403).json({message:"No token provided."});

        const decoded = await jwt.verify(token, config.SECRET);
        req.userId = decoded.id;
        const user = await User.findById(decoded.id);
        if(!user) return res.status(404).json({message: 'User not found.'});

        next();
    } catch (error) {
        return res.status(500).json({message:'Unauthorized.'});
    }
}

export const isModerador = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({_id: {$in: user.roles }});

    for(let r of roles){
        if(r.name === 'moderador'){ 
            next();
            return; 
        }
    }

    return res.status(403).json({message:'Unauthorized access.'});
};

export const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.userId);
    const roles = await Role.find({_id: {$in: user.roles }});

    for(let r of roles){
        if(r.name === 'admin'){ 
            next();
            return; 
        }
    }

    return res.status(403).json({message:'Unauthorized access.'});
};