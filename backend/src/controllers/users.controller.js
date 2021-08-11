import User from '../models/User.model';
import Notifications from '../models/Notifications.model';
import * as myJs from '../libs/myFunctions';
import * as multer from '../middlewares/multer';
import fs from 'fs';
import path from 'path';
import * as socketIO from '../middlewares/socketWeb';

//Obtiene todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({msg: 'Server error of getUsers'});
    }
}

//Obtiene varios usuarios por ID
export const getUsersById = async (req, res) => {
    try {
        const { idList } = req.query;
        let usersList = [];
        if(Array.isArray(idList)){
            for(let id of idList){
                const user = await User.findById(id);
                if(user != null){
                    let finalUser = {username: user.username, email:user.email, _id: id, profileImg: user.profileImg };
                    usersList.push(finalUser);
                }
            }
        }else{
            const user = await User.findById(idList);
            if(user != null){
                let finalUser = {username: user.username, email:user.email, _id: idList, profileImg: user.profileImg };
                usersList.push(finalUser);
            }
        }
        res.json(usersList);


    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

//Obtiene un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const users = await User.findById(req.params.postId);
        res.json(users);
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

//Obtiene un usuario por username
export const getUserByName = async (req, res) => {
    //try {
        var string = req.query.username.trim();

        if(string != '' && string != null && string != undefined){
            let normalizedString = myJs.removeAccents(string);
            const users = await User.find({ username: {$regex: normalizedString, $options: 'i'} }).collation({locale: "en", strength: 1});
            let finalUser = [];
            for(let r of users){
                console.log("USER BUSCADO", r);
                finalUser.push({
                    username: r.username, 
                    id: r.id,
                    imgProfile: r.profileImg
                });
            }
            res.json(finalUser);
        }else{
            res.status(400).json({msg: 'Search not valid '});
        }
    //} catch (error) {
    //    res.status(500).json({msg: 'Server error'});
    //}
}

//======UPDATE PROFILE===========
export const updateProfileImg = async (req, res) => {
    multer.updateProfileImages(req, res);
}

export const updateProfile = async (req, res) => {
    try {
        //Guardamos los cambios en el usuario
        await User.findByIdAndUpdate(req.body.userId, {"biography": req.body.biography});
        await User.findByIdAndUpdate(req.body.userId, {"profileImg": req.body.profileImgURL});
        await User.findByIdAndUpdate(req.body.userId, {"profileCoverImg": req.body.profileCoverImgURL});
        res.json({msg: 'Profile updated.'});
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

//GET images
export const getProfileImages = async (req, res) => {
    try {
        let extensionFile = req.query.path.split('.').pop();
        const imagePath = path.join('src','public', req.query.path);
        await fs.stat( imagePath, (error, stat) => {
            if(error == null){
                fs.readFile(imagePath, (error, file) => {
                    res.writeHead(200, {'Content-Type': `image/${extensionFile}` });
                    res.end(file);
                });
            }else{
                res.status(301).json({msg: 'File not found'});
            }
        });
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}


//PEDIR Solicitud de amistad
export const friendRequest = async (req, res) => {
    const {emiterUserId, receiverUserId, notification} = req.query;
    const newNotification = new Notifications(notification);
    const notificationSaved = await newPost.save();
    const emiterUser = await User.findByIdAndUpdate(emiterUserId, {$push: {"notifications": {"send": notificationSaved._id.toString()} }});
    const receiverUser = await User.findByIdAndUpdate(receiverUserId, {$push: {"notifications": {"receive": notificationSaved._id.toString()} }});
    res.json({msg:"NOTIFICACION CREADA"});
}


