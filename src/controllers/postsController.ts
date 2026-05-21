import type { RequestHandler } from "express";
import { deletePost, insertPost, retrievePosts } from "../model/db.ts";
import { handleError, PromiseError } from "../utils.ts";
import { body, query, validationResult, type ValidationChain } from "express-validator";

const createPostValidator: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty(),
  body("content")
    .trim()
    .notEmpty(),
]

const deletePostValidator: ValidationChain = query("id").isInt().notEmpty()

export const getAllPosts: RequestHandler = async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/log-in");
  
  const query = req.query.query as string | undefined;

  if (query === "") return res.redirect("/posts");

  const posts = await retrievePosts(
    {query: query, userStatus: ((req.user as any).status as "visitor" | "member" | "admin")}
  );

  return res.render("index", { posts, query });
}

export const createPost: (RequestHandler | ValidationChain[])[] = [
  createPostValidator,
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) return res.status(400).send(error.array());

    const user: Record<string, any> = req.user!;

    if (user.status! === "visitor") return next();

    const post = req.body;

    post["author"] = user.id;

    const createdPost = await handleError(insertPost(post));

    if (createdPost instanceof PromiseError) return res.status(400).send(createdPost.error);

    res.redirect("/posts");
  }
]

export const removeUserPost: (RequestHandler | ValidationChain[])[] = [
  deletePostValidator,
  async (req, res, next) => {
    const error = validationResult(req);

    if (!error.isEmpty()) return res.status(400).send(error.array());

    const user: Record<string, any> = req.user!;

    if (user.status! !== "admin") return next();

    const {id} = req.query;

    const postId = Number(id);

    if (isNaN(postId)) return res.status(400).send("A post id should be a number.");

    const post = await deletePost(postId);

    res.send(`Deleted post ${id}`);
  }
]