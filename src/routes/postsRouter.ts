import { Router } from "express";
import { createPost, getAllPosts } from "../controllers/postsController.ts";

const postsRouter = Router({mergeParams: true});

postsRouter.get("/", getAllPosts);

postsRouter.post("/posts", createPost);

export default postsRouter;