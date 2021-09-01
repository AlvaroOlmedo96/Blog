import Post from '../models/Posts.model';
import User from '../models/User.model';
import Notifications from '../models/Notifications.model';
import path from 'path';
import fs from 'fs';
import * as multer from '../middlewares/multer';
import * as socketIO from '../middlewares/socketWeb';



export const createPost = async (req, res) => {
    try {
        const {title, category, imgURL, description, propietaryId, propietaryUsername, likes} = req.body;
        const newPost = new Post({title, category, imgURL, description, propietaryId, propietaryUsername, likes});
        const postSaved = await newPost.save();
        //Guardamos el post en el usuario que lo ha creado
        const user = await User.findByIdAndUpdate(postSaved.propietaryId, {$push: {"posts": postSaved._id.toString()}});

        //Notificamos con socket.io
        socketIO.getSocket().on('newPost', res => {
            
        });
        socketIO.getIo().emit('newPost', postSaved);

        res.status(201).json({post:postSaved, user:user});
    } catch (error) {
        res.status(500).json({msg: 'Server error for create Post'});
    }
}

export const uploadPostImage = async (req, res) => {
    multer.uploadPostImage(req, res);
}
//GET images
export const getImagesOfPosts = async (req, res) => {
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
                res.status(301).json({msg: 'File not found for ImageOfPost'});
            }
        });
    } catch (error) {
        res.status(500).json({msg: 'Server error for ImageOfPost'});
    }
}

export const getPosts = async (req, res) => {
    try {
            const {idList} = req.query;
            let postsList = [];
            if(idList != undefined && idList.length > 0){
                if(Array.isArray(idList)){
                    for(let id of idList){
                        const post = await Post.find({propietaryId: id});
                        if(post != null && post.length > 0){
                            postsList.push(post);
                        }
                    }
                }else{
                    const post = await Post.find({propietaryId: idList});
                    if(post != null && post.length > 0){
                        postsList.push(post);
                    }
                }
            }

            //const posts = await Post.find();
            postsList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); //Ordenamos por los mas recientes
            res.json(postsList);
    } catch (error) {
            res.status(500).json({msg: 'Server error for getPost'});
    }
}

export const getPostsById = async (req, res) => {
    const { idList } = req.query;
    let postsList = [];
    try {
        if(idList != undefined && idList.length > 0){
            if(Array.isArray(idList)){
                for(let id of idList){
                    const post = await Post.findById(id);
                    if(post != null){
                        postsList.push(post);
                    }
                }
            }else{
                const post = await Post.findById(idList);
                if(post != null){
                    postsList.push(post);
                }
            }
        }
        postsList.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); //Ordenamos por los mas recientes
        res.json(postsList);
    } catch (error) {
        res.status(500).json({msg: 'Server error for PostsById'});
    }
}

export const deletePostById = async (req, res) => {
    const { postId, userId, imagePath } = req.query; 
    const deletedPost= await Post.findByIdAndDelete(postId);//Eliminamos el Post
    const deletedUserPost= await User.findByIdAndUpdate(userId, {$pull: {"posts": postId} });//Eliminamos el Post del Usuario
    //Eliminamos la imagen del post
    if(imagePath != '' && imagePath != null && imagePath != undefined){
        const directory = path.join('src','public', imagePath);
        await fs.stat( directory, (error, stat) => {
            if(error == null){
                fs.unlink(directory , (err) => {
                    if(err){
                        return;
                    }
                    res.json({msg: "Con imagen. Eliminado correctamente"});
                });
            }else{
                res.status(301).json({msg: 'File not found for deletePostById'});
            }
        });
    }else{
        res.json({msg: "Sin imagen. Eliminado correctamente"});
    }
}

//LIKES POST
export const likePost = async (req, res) => {
    try{
        const {currentId, postId, propietaryOfPostId, notification} = req.body;

        //Comprobamos si ya se habia dado like
        const existLikedPost = await User.find({$and: [{"_id": currentId}, {"likedPosts": {"$in": [postId]} }] });
        console.log("existLikedPost", existLikedPost);
        if(existLikedPost != null && existLikedPost.length != 0){
            //Eliminamos like de los likedPosts del usuario que dio like/dislike
            await User.findByIdAndUpdate(currentId, {$pull: {"likedPosts": postId} });
            //Eliminamos like de los likes del propietario del post
            await User.findByIdAndUpdate(propietaryOfPostId, {$pull: {"likes": {$and: [{usersLikedPost: currentId}, {postId: postId}] } } });
            //Eliminamos like del post
            const likedPost = await Post.findByIdAndUpdate(postId, {$pull: {"likes": currentId} },  {returnOriginal: false});
    
            //Refrescar Likes en tiempo real con socket.io
            socketIO.getSocket().on('newLike', res => {
            
            });
            socketIO.getIo().emit('newLike', likedPost);

            res.json({msg:"dislike"});
        }else{
            //Guardar postId en los likedPosts del usuario que dio like
            await User.findByIdAndUpdate(currentId, {$push: {"likedPosts": postId} });
            //Guardar postId en los likes del propietario del post
            await User.findByIdAndUpdate(propietaryOfPostId, {$push: 
                {
                    "likes": {
                        postId: postId,
                        usersLikedPost: currentId
                    }
                }
            });
            //Guardar like y userId(el que dio like) en el post
            const likedPost = await Post.findByIdAndUpdate(postId, {$push: {"likes": currentId} }, {returnOriginal: false});
            
            //Refrescar Likes en tiempo real con socket.io
            socketIO.getSocket().on('newLike', res => {
            
            });
            socketIO.getIo().emit('newLike', likedPost);

            //Creamos una notificacion de Like
            console.log("NOTIFICACION DE LIKE", notification);
            const newNotification = new Notifications(notification);
            const notificationSaved = await newNotification.save();
            const emiterUser = await User.findByIdAndUpdate(notification.emiterUserId, {$push: {"notifications": {"send": notificationSaved._id.toString()} }});
            const receiverUser = await User.findByIdAndUpdate(notification.receiveUserId, {$push: {"notifications": {"receive": notificationSaved._id.toString(), "isReaded": false} }});
            
            //SOCKET.IO PARA NOTIFICAR AL RECEPTOR DE LA NOTIFICACION
            let socketId = socketIO.getUserById(notification.receiveUserId);
            if(socketId != undefined && socketId != null && socketId != ''){//Si el usuario destinatario esta conectado se enviara la notificacion socket
                socketIO.getIo().to(socketId).emit('newNotification', notificationSaved);
            }

            res.json({msg:"like"});
        }
    }catch{
        res.status(500).json({msg: 'Server error for likePost'});
    }
}

//POST COMMENT
export const postComment = async (req, res) => {
    const {currentId, postId, propietaryOfPostId, comment, notification} = req.body;

    
    //Guardar comentario y userId(el que hizo el comentario) en el post
    const commentedPost = await Post.findByIdAndUpdate(postId, {$push: 
        {
            "comments": {
                comment: comment,
                writer: currentId,
                createdAt: new Date()
            }
        }
    }, {returnOriginal: false});
    
    //Refrescar Comentarios en tiempo real con socket.io
    socketIO.getSocket().on('newComment', res => {});
    socketIO.getIo().emit('newComment', commentedPost);

    //Creamos una notificacion de Comentario
    console.log("NOTIFICACION DE Comentario", notification);
    const newNotification = new Notifications(notification);
    const notificationSaved = await newNotification.save();
    const emiterUser = await User.findByIdAndUpdate(notification.emiterUserId, {$push: {"notifications": {"send": notificationSaved._id.toString()} }});
    const receiverUser = await User.findByIdAndUpdate(notification.receiveUserId, {$push: {"notifications": {"receive": notificationSaved._id.toString(), "isReaded": false} }});
    
    //SOCKET.IO PARA NOTIFICAR AL RECEPTOR DE LA NOTIFICACION
    let socketId = socketIO.getUserById(notification.receiveUserId);
    if(socketId != undefined && socketId != null && socketId != ''){//Si el usuario destinatario esta conectado se enviara la notificacion socket
        socketIO.getIo().to(socketId).emit('newNotification', notificationSaved);
    }

    res.json({msg:"Comentario publicado."});
}



