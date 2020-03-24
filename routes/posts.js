const express = require('express');

const PostController = require('../controllers/posts');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');

const router = express.Router();



router.post('', checkAuth, 
    extractFile, PostController.createPost);


router.put("/:id", extractFile, PostController.updatedPost);

router.get('', PostController.getPosts);

router.get('/:id', checkAuth, PostController.getPost);

router.delete('/:id', PostController.deletePost);

module.exports = router;