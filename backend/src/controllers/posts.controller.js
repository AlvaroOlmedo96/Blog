import Post from '../models/Posts.model';
import User from '../models/User.model';


export const createPost = async (req, res) => {
    try {
        const {title, category, imgURL, description, propietaryId, propietaryUsername, likes} = req.body;
        const newPost = new Post({title, category, imgURL, description, propietaryId, propietaryUsername, likes});
        const postSaved = await newPost.save();
        console.log("Post creado", postSaved);

        //Guardamos el post en el usuario que lo ha creado
        const user = await User.findByIdAndUpdate(postSaved.propietaryId, {$push: {"posts": postSaved._id}});
        console.log("CREADO POR", user);
        res.status(201).json({post:postSaved, user:user});
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

export const getPosts = async (req, res) => {
   try {
        const posts = await Post.find();
        res.json(posts);
   } catch (error) {
        res.status(500).json({msg: 'Server error'});
   }
}

export const getPostsById = async (req, res) => {
    const { idList } = req.query;
    let postsList = [];
    try {
        if([idList] != undefined && [idList].length > 0){
            for(let id of [idList]){
                const post = await Post.findById(id);
                if(post != null){
                    postsList.push(post);
                }
            }
        }
        res.json(postsList);
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
    
 }

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        res.json(post);
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

export const updatePostById = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.postId, req.body, {
            new: true
        });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}

export const deletePostById = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        res.json(deletedPost);
    } catch (error) {
        res.status(500).json({msg: 'Server error'});
    }
}