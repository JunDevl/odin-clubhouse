import type { RequestHandler } from "express";
import { insertPost, retrievePosts } from "../model/db.ts";
import { handleError, PromiseError } from "../utils.ts";

export const getAllPosts: RequestHandler = async (req, res) => {
  if (req.isAuthenticated()) {
    const posts = await retrievePosts();

    res.render("index", { posts });
  };
  
  res.redirect("/log-in");
}

export const createPost: RequestHandler = async (req, res, next) => {
  if ((req.user as any).status! === "visitor") return;

  const post = req.body;

  const createdPost = await handleError(insertPost(post));

  if (createdPost instanceof PromiseError) {
    res.statusCode = 400;
    return next(createdPost.error);
  }

  res.redirect("/posts");
}