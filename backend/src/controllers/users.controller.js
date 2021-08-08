import User from '../models/User.model';
import * as myJs from '../libs/myFunctions';
import * as multer from '../middlewares/multer';
import fs from 'fs';
import path from 'path';

export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
}

export const getUsersById = async (req, res) => {
    const { idList } = req.query;
    let usersList = [];
    console.log("LIST OF ID´S", idList);
    for(let id of idList){
        const user = await User.findById(id);
        if(user != null){
            let finalUser = {username: user.username, email:user.email, _id: user._id, profileImg: user.profileImg };
            usersList.push(finalUser);
        }
    }
    console.log("LIST OF USERS");
    res.json(usersList);
}

export const getUserById = async (req, res) => {
    const users = await User.findById(req.params.postId);
    res.json(users);
}

export const getUserByName = async (req, res) => {
    
    var string = req.query.username.trim();

    if(string != '' && string != null && string != undefined){
        let normalizedString = myJs.removeAccents(string);
        const users = await User.find({ username: {$regex: normalizedString, $options: 'i'} }).collation({locale: "en", strength: 1});
        let finalUser = [];
        for(let r of users){
            finalUser.push({
                username: r.username, 
                id: r.id
            });
        }
        res.json(finalUser);
    }else{
        res.status(400).json({msg: 'Search not valid '});
    }
}

//======UPDATE PROFILE===========
export const updateProfileImg = async (req, res) => {
    multer.updateProfileImages(req, res);
}

export const updateProfileCoverImg = async (req, res) => {
    res.json({profileCoverImgURL: 'url OK'});
}

export const updateProfile = async (req, res) => {
    //Guardamos los cambios en el usuario
    await User.findByIdAndUpdate(req.body.userId, {"biography": req.body.biography});
    await User.findByIdAndUpdate(req.body.userId, {"profileImg": req.body.profileImgURL});
    await User.findByIdAndUpdate(req.body.userId, {"profileCoverImg": req.body.profileCoverImgURL});
    res.json({msg: 'Profile updated.'});
}

//GET images
export const getProfileImages = async (req, res) => {
    const extensionFile = req.query.path.slice(-3);
    const imagePath = path.join('src','public', req.query.path);
    await fs.stat( imagePath, (error, stat) => {
        if(error == null){
            fs.readFile(imagePath, (error, file) => {
                res.writeHead(200, {'Content-Type': `image/${extensionFile}` });
                res.end(file);
            });
        }else{
            res.status(401).json({msg: 'File not found'});
        }
    });
}


