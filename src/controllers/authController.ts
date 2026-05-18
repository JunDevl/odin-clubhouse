import { config } from "dotenv"

config();

import type { RequestHandler } from "express";
import argon2 from "argon2";
import { insertUser } from "../model/db.ts";
import { handleError } from "../utils.ts";
import { PromiseError } from "../utils.ts";

export const createUser: RequestHandler = async (req, res, next) => {
  const {club_key, ...user} = req.body;

  const hashedPassword = await argon2.hash(user.password, {
    memoryCost: 65536,
    parallelism: 4,
    timeCost: 5
  })

  user.password = hashedPassword;
  user.status = club_key === process.env["SECRET_CLUBHOUSE_KEY"] ? "member" : "visitor";

  const createdUser = await handleError(insertUser(user));

  if (createdUser instanceof PromiseError) {
    res.statusCode = 400;
    return next(createdUser.error);
  }

  res.redirect("/posts");
};