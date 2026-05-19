import type { RequestHandler } from "express";
import { insertPost, retrievePosts } from "../model/db.ts";
import { handleError, PromiseError } from "../utils.ts";

export const getAllPosts: RequestHandler = async (req, res) => {
  if (req.isAuthenticated()) {
    const query: string | undefined = req.query.query as string | undefined;

    const posts = await retrievePosts(
      {query: query, userStatus: ((req.user as any).status as "visitor" | "member" | "admin")}
    );

    return res.render("index", { posts, query });
  };
  
  res.redirect("/log-in");
}

export const createPost: RequestHandler = async (req, res, next) => {
  const user: Record<string, any> = req.user!;

  if (user.status! === "visitor") return;

  const post = req.body;

  post["author"] = user.id;

  const createdPost = await handleError(insertPost(post));

  if (createdPost instanceof PromiseError) {
    res.statusCode = 400;
    return next(createdPost.error);
  }

  res.redirect("/posts");
}