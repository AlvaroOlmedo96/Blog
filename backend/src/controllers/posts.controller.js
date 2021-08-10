import Post from '../models/Posts.model';
import User from '../models/User.model';
import path from 'path';
import fs from 'fs';
import * as multer from '../middlewares/multer';


export const createPost = async (req, res) => {
    try {
        const {title, category, imgURL, description, propietaryId, propietaryUsername, likes} = req.body;
        const newPost = new Post({title, category, imgURL, description, propietaryId, propietaryUsername, likes});
        const postSaved = await newPost.save();
        //Guardamos el post en el usuario que lo ha creado
        const user = await User.findByIdAndUpdate(postSaved.propietaryId, {$push: {"posts": postSaved._id}});
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
    console.log("IMAGE OF POST REQ", req.query);
    try {
        let extensionFile = req.query.path.split('.').pop();
        const imagePath = path.join('src','public', req.query.path);
        await fs.stat( imagePath, (error, stat) => {
            console.log(error);
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
        const posts = await Post.find();
        res.json(posts);
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
        res.json(postsList);
    } catch (error) {
        res.status(500).json({msg: 'Server error for PostsById'});
    }
    
 }
