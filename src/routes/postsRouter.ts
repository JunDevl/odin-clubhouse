import { Router } from "express";
import { createPost, getAllPosts } from "../controllers/postsController.ts";

const postsRouter = Router({mergeParams: true});

postsRouter.route("/")
  .get(getAllPosts)
  .post(createPost);

export default postsRouter;