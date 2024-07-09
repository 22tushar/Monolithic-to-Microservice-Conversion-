const commentModel = require("../models/commentModel");
const { kafka } = require("../client");

const Redis = require('ioredis');

const redisClient = new Redis();

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// post comment
const post_comment = async (req, res) => {
    try {
      console.log(req.params.id, req.body.postId, req.body.comment);
  
      const comment = await commentModel.create({
        postId: req.body.postId,
        authorId: req.params.id,
        comment: req.body.comment,
        username:req.body.username
      });
  
      if (comment) {
        const producer = kafka.producer();
  
        await producer.connect();
        await producer.send({
          topic: 'comment-topic',
          messages: [{ key: 'comment', value: JSON.stringify({ comment }) }],
        });
        console.log("Topic created!");
      }

      if (comment) {
        // Invalidate the cache for all comments and specific post comments
        await redisClient.del('all_comments');
        await redisClient.del(`comments_post_${req.body.postId}`);
  
        res.status(200).json({ msg: "Comment Posted Successfully !!", comment: comment });
      } else {
        res.json({ msg: "Comment not posted" });
      }
    } catch (error) {
      console.log(error.message);
      res.json({ msg: error.message });
    }
  };
  
  // delete comment
  const delete_comment = async (req, res) => {
    try {
      console.log(req.params.id);
      const comment = await commentModel.findByIdAndDelete(req.params.id);
  
      if (comment) {
        // Invalidate the cache for all comments and specific post comments
        await redisClient.del('all_comments');
        await redisClient.del(`comments_post_${comment.postId}`);
  
        res.status(200).json({ msg: "Comment deleted successfully", comment: comment });
        console.log("Comment deleted successfully");
      } else {
        res.json({ msg: "Comment not deleted" });
      }
    } catch (error) {
      console.log(error.message);
      res.json({ msg: "Comment not deleted" });
    }
  };
  
  // all comments
  const all_comments = async (req, res) => {
    try {
      const cachedComments = await redisClient.get('all_comments');
  
      if (cachedComments) {
        return res.status(200).json({ comments: JSON.parse(cachedComments) });
      }
  
      const comments = await commentModel.find();
  
      if (comments) {
        await redisClient.set('all_comments', JSON.stringify(comments), 'EX', 3600); // Cache for 1 hour
        res.status(200).json({ comments: comments });
      } else {
        res.json({ msg: "Comments not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.json({ msg: "Comments not found" });
    }
  };
  
  module.exports = {
    post_comment,
    delete_comment,
    all_comments
  };
  