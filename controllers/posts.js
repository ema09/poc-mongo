const Post = require('../models/post');

exports.createPost = (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
    post.save().then(createdPost => {
        res.status(201).json({
            message: 'Post added',
            post:{
                ...createdPost,
                id: createdPost._id
            }
        });
    })
    .catch(error => {
        res.status(500).json({message: 'Creating a post failed!'});
    });  
}

exports.updatedPost = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + '://' + req.get('host');
        imagePath: url + '/images/' + req.file.filename;
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.connect,
        imagePath: imagePath
    });
    Post.updateOne({_id: req.params.id}, post).then(result => {
        console.log(result);
        res.status(200).json({ message: "Updated succesfully", imagePath: imagePath});
    })
    .catch(error => {
        res.status(500).json({message: 'Updating a post failed!'});
    });  
}

exports.getPosts = (req, res, next) => {
    Post.find().then(documents =>{
        res.status(200).json({
            message: 'Post fethced succesfully!!',
            posts: documents
        });
    })
    .catch(error => {
        res.status(500).json({message: 'Getting posts failed!'});
    });  
    // const posts = [
    //     {id: 'da2ead', title: 'First backend post', content: 'This is 1 content'},
    //     {id: 'dfdsfd', title: 'Secod backend post', content: 'This is 2 content'}
    // ];
}

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id).then(document =>{
        if(document){
            res.status(200).json({
                message: 'Post fethced succesfully!!',
                posts: document
            });
        }else
            res.status(404).json({ message: 'Post not found!'});
    })
    .catch(error => {
        res.status(500).json({message: 'Getting a post failed!'});
    });  
}

exports.deletePost = (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({ message: 'Post deleted'});
    })
    .catch(error => {
        res.status(500).json({message: 'Deleting a post failed!'});
    });  
}