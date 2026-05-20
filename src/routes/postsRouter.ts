import { Router } from "express";
import { createPost, deleteUserPost, getAllPosts } from "../controllers/postsController.ts";

const postsRouter = Router({mergeParams: true});

postsRouter.route("/")
  .get(getAllPosts)
  .post(createPost as any)
  .delete(deleteUserPost as any);

export default postsRouter;