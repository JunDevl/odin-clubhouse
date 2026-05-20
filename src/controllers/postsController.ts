import type { RequestHandler } from "express";
import { deletePost, insertPost, retrievePosts } from "../model/db.ts";
import { handleError, PromiseError } from "../utils.ts";

export const getAllPosts: RequestHandler = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/log-in");
  
  const query = req.query.query as string | undefined;

  if (query === "") return res.redirect("/posts");

  const posts = await retrievePosts(
    {query: query, userStatus: ((req.user as any).status as "visitor" | "member" | "admin")}
  );

  return res.render("index", { posts, query });
}

export const createPost: RequestHandler = async (req, res, next) => {
  const user: Record<string, any> = req.user!;

  if (user.status! === "visitor") return next();

  const post = req.body;

  post["author"] = user.id;

  const createdPost = await handleError(insertPost(post));

  if (createdPost instanceof PromiseError) {
    res.statusCode = 400;
    return next(createdPost.error);
  }

  res.redirect("/posts");
}

export const deleteUserPost: RequestHandler = async (req, res, next) => {
  const user: Record<string, any> = req.user!;

  if (user.status! !== "admin") return next();

  const {id} = req.query!;

  const postId = Number(id);

  if (isNaN(postId)) {
    res.statusCode = 400;
    res.send("A post id should be a number.");
    return;
  };

  const post = await deletePost(postId);

  res.send("Ok");
}