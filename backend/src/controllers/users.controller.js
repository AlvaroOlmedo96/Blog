import User from '../models/User.model';
import Notifications from '../models/Notifications.model';
import Chats from '../models/Chats.model';
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
        const users = await User.findById(req.query.userId);
        let userToSend = {
            createdAt: users.createdAt,
            email: users.email,
            profileCoverImg: users.profileCoverImg,
            profileImg: users.profileImg,
            username: users.username,
            notifications: users.notifications,
            _id: users._id
        }
        res.json(userToSend);
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
    const {notification} = req.body;
    const newNotification = new Notifications(notification);
    const notificationSaved = await newNotification.save();
    const emiterUser = await User.findByIdAndUpdate(notification.emiterUserId, {$push: {"notifications": {"send": notificationSaved._id.toString()} }});
    const receiverUser = await User.findByIdAndUpdate(notification.receiveUserId, {$push: {"notifications": {"receive": notificationSaved._id.toString(), "isReaded": false} }});
    
    //SOCKET.IO PARA NOTIFICAR AL RECEPTOR DE LA NOTIFICACION
    let socketId = socketIO.getUserById(notification.receiveUserId);
    if(socketId != undefined && socketId != null && socketId != ''){//Si el usuario destinatario esta conectado se enviara la notificacion socket
        socketIO.getIo().to(socketId).emit('newNotification', notificationSaved);
    }

    res.json({msg:"NOTIFICACION CREADA"});
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const {emiterUserId, receiverUserId, notificationId} = req.body;
        //Comprobar primero si ya son contactos
        const alreadyEmiterContact = await User.find({_id:emiterUserId, "contacts": receiverUserId});
        const alreadyReceiverContact = await User.find({_id:receiverUserId, "contacts": emiterUserId});
        if(alreadyEmiterContact.length <= 0 && alreadyReceiverContact.length <= 0){
            //Añadir contacto en ambos usuarios
            await User.findByIdAndUpdate( emiterUserId, {$push: {"contacts": receiverUserId.toString() }} );
            await User.findByIdAndUpdate( receiverUserId, {$push: {"contacts": emiterUserId.toString() } } );
            //Eliminar notificacion
            await Notifications.findByIdAndDelete( notificationId );
            //Eliminar notificacion de los usuarios
            await User.findByIdAndUpdate( emiterUserId, {$pull: {"notifications": {"send": notificationId}} } );
            await User.findByIdAndUpdate( receiverUserId, {$pull: {"notifications": {"receive": notificationId}} } );

            res.json({msg:'acceptFriendRequest'});
        }else{
            //Eliminar notificacion
            await Notifications.findByIdAndDelete( notificationId );
            //Eliminar notificacion de los usuarios
            await User.findByIdAndUpdate( emiterUserId, {$pull: {"notifications": {"send": notificationId}} } );
            await User.findByIdAndUpdate( receiverUserId, {$pull: {"notifications": {"receive": notificationId}} } );
            res.json({msg:'Ya sois contactos'});
        }
    }catch (error) {
        res.status(500).json({msg:'Server Error acceptFriendRequest', error: error});
    }
    
}

export const declineFriendRequest = async (req, res) => {
    try {
        const {emiterUserId, receiverUserId, notificationId} = req.body;
        //Eliminar notificacion
        await Notifications.findByIdAndDelete( notificationId );
        //Eliminar notificacion de los usuarios
        await User.findByIdAndUpdate( emiterUserId, {$pull: {"notifications": {"send": notificationId}} } );
        await User.findByIdAndUpdate( receiverUserId, {$pull: {"notifications": {"receive": notificationId}} } );

        res.json({msg:'declineFriendRequest'});
    } catch (error) {
        res.status(500).json({msg:'Server Error declineFriendRequest', error: error});
    }
}

export const getNotificationsById = async (req, res) => {
    const { idList } = req.body;
    let notificationsList = [];
    try {
        if(idList != undefined && idList.length > 0){
            if(Array.isArray(idList)){ 
                const notification = await Notifications.find({_id: {$in: idList}}).sort({$natural:-1}).limit(100);
                if(notification != null){
                    notificationsList = notification;
                }
            }else{
                const notification = await Notifications.findById(idList).sort({$natural:-1}).limit(100);
                if(notification != null){
                    notificationsList = notification;
                }
            }
        }
        //notificationsList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); //Ordenamos por los mas recientes
        res.json(notificationsList);
    } catch (error) {
        res.status(500).json({msg: 'Server error for getNotificationsById', error: error});
    }
}

export const updateReadedNotification = async (userId, notification) => {
    console.log("updateReadedNotification", userId, notification);
    const aux = await User.findByIdAndUpdate( 
        userId, 
        {$set: {"notifications.$[elem].isReaded": true} },
        {arrayFilters: [{"elem._id": notification._id} ], returnOriginal: false}, 
    );
}

export const getChat = async (req, res) => {
    console.log("getChat", req.query);
    const {chatId} = req.query;
    let chat = await Chats.findById(chatId);
    res.json({chat: chat});
}

export const sendMessage = async (req, res) => {
    console.log(req.body);
    const { chatRoomId, msg, emiterUserId, emiterUserName, receiverUserId, receiverUserName } = req.body;
    let socketMessage = {};
    //Comprobamos si el chat ya existe
    if(chatRoomId != ''){
        //Actualizamos mensajes en el Chat
        const savedChat = await Chats.findByIdAndUpdate(chatRoomId, {$push:{messages: msg}}, {returnOriginal: false});
        socketMessage = msg;
        res.json({msg:"CHAT YA EXISTENTE", chat: savedChat});
    }else{
        //Creamos el chat
        let chat = {
            members: [emiterUserId, receiverUserId],
            messages: [msg],
            typeChat: 'private'
        }
        const newChat = new Chats(chat);
        const savedChat = await newChat.save();
        console.log("savedChat", savedChat);
        let userChat = {
            _id: savedChat._id,
            members: savedChat.members,
            typeChat: savedChat.typeChat
        }
        //Guardamos chat en los chats del emisor
        await User.findByIdAndUpdate(emiterUserId, {$push:{chats: userChat}});
        //Guardamos chat en los chats del receptor
        await User.findByIdAndUpdate(receiverUserId, {$push:{chats: userChat}});

        socketMessage = chat.messages[0];
        res.json({msg:"CHAT NUEVO", chat: savedChat});
    }
    

    //Enviamos mensaje por socket.io para tiempo real
    let socketIdReceiver = socketIO.getUserById(receiverUserId);
    //let socketIdEmiter = socketIO.getUserById(emiterUserId);
    if(socketId != undefined && socketId != null && socketId != ''){//Si el usuario destinatario esta conectado se enviara la notificacion socket
        socketIO.getIo().to(socketIdReceiver).emit('newMessage', socketMessage);
        //socketIO.getIo().to(socketIdEmiter).emit('newMessage', socketMessage);
    }
}


