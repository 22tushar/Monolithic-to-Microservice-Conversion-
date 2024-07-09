const postModel = require("../models/postModel");
const { kafka } = require("../client");


const Redis = require('ioredis');

const redisClient = new Redis();

redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const create_post = async (req, res) => {
  console.log("server 2");
  try {
    console.log(req.body);

    const post = new postModel({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      authorId: req.body.activeUserId,
    });

    const savePost = await post.save();

    if (savePost) {
      const producer = kafka.producer();

      await producer.connect();
      await producer.send({
        topic: 'post-topic',
        messages: [{ key: 'post', value: JSON.stringify({ savePost }) }],
      });

      await redisClient.del('allPosts');

      console.log("Topic created!");
      console.log("Post created successfully");

      res.status(200).json({ post: savePost, msg: "Post created successfully !!" });
    } else {
      res.status(400).json({ msg: "Something went wrong" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

// get post
const get_post = async (req, res) => {

  const id = req.params.id;

  try{
    const post = await postModel.findById(id);

    if(post){
      res.status(200).json({post : post});
    }
    else{
      res.json({msg : "Post not found"});
    }
  }catch(error){
    console.log(error.message);
    res.json({msg : error.message});
  }
};

// all posts
const all_posts = async (req, res) => {
  try {
    const cachedPosts = await redisClient.get('allPosts');
    if (cachedPosts) {
      return res.status(200).json({ msg: "Data fetched successfully", posts: JSON.parse(cachedPosts) });
    }

    const posts = await postModel.find();
    if (posts) {
      await redisClient.set('allPosts', JSON.stringify(posts), 'EX', 3600); // Cache for 1 hour
      res.status(200).json({ msg: "Data fetched successfully", posts: posts });
    } else {
      res.status(404).json({ msg: "No posts found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Data can't fetch" });
  }
};


// update post
const update_post = async (req, res) => {

  console.log(req.params.id);
  console.log(req.body)
  console.log(req.files)

  try{

    if(req.files){

      const file = req.files.blogImage;

    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
      console.log(result);
      try {
        if (result) {
          console.log(result.url);

          const post = await postModel.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            postImage: result.url,
          });

          const savePost = await post.save();

          if (savePost) {
            res
              .status(200)
              .json({ post: savePost, msg: "Post created successfully !!" });

              console.log("Post created successfully")
          } else {
            res.json({ msg: "Something wents wrong" });
          }
        } else {
          console.log(err);
          res.json({ msg: err });
        }
      } catch (error) {
        res.json({ msg: error.message });
      }
    });

    }
    else{ // image not updated

       const updatePost = await postModel.findByIdAndUpdate(req.params.id,{
        title : req.body.title,
        description : req.body.description,
        category : req.body.category
       });

       if(updatePost){
        res.status(200).json({msg : "Post updated successfully", post : updatePost});
       }
       else{
        res.json({msg : "Post not updated , Something wents wrong"});
       }

    }

  }catch(error){
    res.json({msg : error.message });
  }


};

// delete post
const delete_post = async (req, res) => {
  try {
    const deletePost = await postModel.findByIdAndDelete(req.params.id);

    if (deletePost) {
      await redisClient.del(`post:${req.params.id}`);
      await redisClient.del('allPosts');
      res.status(200).json({ msg: "Post deleted successfully", post: deletePost });
    } else {
      res.status(400).json({ msg: "Post not deleted" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Post not deleted" });
  }
};


// handle like dislike
const like_dislike = async (req, res) =>{
  try{
    const postId = req.params.id;
    const userId = req.body.userId;

    const post = await postModel.findById(postId);

    if(post){
      
      // like
      if(!post.likes.includes(userId)){
        await postModel.updateOne({_id : postId}, {$push : { likes : userId}});
        res.status(200).json({msg : "Post has been liked", liked : true})
        console.log("Post has been liked")
      }
      else{
        await postModel.updateOne({ _id : postId },{ $pull: { likes : userId }});
        res.status(200).json({msg : "Post has been disliked", liked : false});
        console.log("Post has been disliked");
      }
    }
    else{
      res.json({msg : "Something wents wrong", liked : false});
    }

  }
  catch(error){
    res.json({msg : error.message, liked : false});
  }
}

module.exports = {
  create_post,
  get_post,
  all_posts,
  update_post,
  delete_post,
  like_dislike
};
