import { Router } from "express";
import { createPost, deleteUserPost, getAllPosts } from "../controllers/postsController.ts";

const postsRouter = Router({mergeParams: true});

postsRouter.route("/")
  .get(getAllPosts)
  .post(createPost)
  .delete(deleteUserPost);

export default postsRouter;