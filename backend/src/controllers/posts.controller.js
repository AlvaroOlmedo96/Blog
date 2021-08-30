import Post from '../models/Posts.model';
import User from '../models/User.model';
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
        console.log("POSTLIST", postsList);
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
                    res.json({deletedPost:deletedPost, deletedUserPost:deletedUserPost, msg: "Con imagen. Eliminado correctamente"});
                });
            }else{
                res.status(301).json({msg: 'File not found for deletePostById'});
            }
        });
    }else{
        res.json({deletedPost:deletedPost, deletedUserPost:deletedUserPost, msg: "Sin imagen. Eliminado correctamente"});
    }

 }
