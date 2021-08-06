import Post from '../models/Posts.model';


export const createPost = async (req, res) => {
    const {title, category, imgURL, description, propietaryId, propietaryUsername} = req.body;
    const newPost = new Post({title, category, imgURL, description, propietaryId, propietaryUsername});
    const postSaved = await newPost.save();
    console.log("Post creado", postSaved);

    res.status(201).json(postSaved);
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