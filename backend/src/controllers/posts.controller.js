import Post from '../models/Posts.model';
import User from '../models/User.model';


export const createPost = async (req, res) => {
    const {title, category, imgURL, description, propietaryId, propietaryUsername, likes} = req.body;
    const newPost = new Post({title, category, imgURL, description, propietaryId, propietaryUsername, likes});
    const postSaved = await newPost.save();
    console.log("Post creado", postSaved);

    //Guardamos el post en el usuario que lo ha creado
    const user = await User.findByIdAndUpdate(postSaved.propietaryId, {$push: {"posts": postSaved}});
    console.log("CREADO POR", user);
    res.status(201).json({post:postSaved, user:user});
}

export const getPosts = async (req, res) => {
   const posts = await Post.find();
   res.json(posts);
}

export const getPostById = async (req, res) => {
    const post = await Post.findById(req.params.postId);
    res.json(post);
}

export const updatePostById = async (req, res) => {
    const updatedPost = await Post.findByIdAndUpdate(req.params.postId, req.body, {
        new: true
    });
    res.json(updatedPost);
}

export const deletePostById = async (req, res) => {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    res.json(deletedPost);
}