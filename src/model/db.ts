import type { UUID } from "node:crypto";
import { config } from "dotenv";
import { handleError, PromiseError } from "../utils.ts";

config();

import postgres from "postgres";

export const sql = postgres(`
    postgresql://${
      process.env["PGUSER"]
    }:${
      process.env["PGPASSWORD"]
    }@${
      process.env["PGHOST"]
    }/${
      process.env["PGDATABASE"]
    }
  `,
  { ssl: true }
);

export const insertUser = async (user: Record<string, any>) => {
  const data = await handleError(sql`INSERT INTO users ${sql(user)} RETURNING row_to_json(users.*)`);

  if (data instanceof PromiseError) throw new Error(data.error);

  const [rowToJson] = data;

  const {row_to_json: created} = rowToJson!;

  return created;
};

export const deleteUser = async (userUUID: UUID) => {

};

export const retrievePosts = async () => {
  const data = await handleError(sql`SELECT * FROM posts ORDER BY created_at DESC`);

  if (data instanceof PromiseError) throw new Error(data.error);

  return data;
};

export const insertPost = async (newPost: Record<string, any>) => {
  const data = await handleError(sql`INSERT INTO posts ${sql(newPost)} RETURNING row_to_json(users.*)`);

  if (data instanceof PromiseError) throw new Error(data.error);

  const [rowToJson] = data;

  const {row_to_json: created} = rowToJson!;

  return created;
};

export const updatePost = async (authorID: UUID, postID: number, newData: {newTitle?: string, newContent: string} | {newTitle: string, newContent?: string}) => {
  const {newTitle, newContent} = newData;

  const data = await handleError(sql`
    UPDATE posts 
    SET 
      ${newTitle ? sql`title = ${newTitle}` : sql``}
      ${newContent ? sql`content = ${newContent}` : sql``}
    WHERE id = ${postID} AND author = ${authorID}
    RETURNING row_to_json(users.*)
  `);

  if (data instanceof PromiseError) throw new Error(data.error);

  const [rowToJson] = data;

  const {row_to_json: created} = rowToJson!;

  return created;
}

export const deletePost = async (authorID: UUID, postID: number) => {
  const data = await handleError(sql`DELETE FROM posts WHERE id = ${postID} AND author = ${authorID}`);

  if (data instanceof PromiseError) throw new Error(data.error);

  return false;
}