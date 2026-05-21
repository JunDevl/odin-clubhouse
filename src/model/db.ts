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

export const upgradeUserToMember = async (userID: UUID) => {
  const upgraded = await handleError(sql`
    UPDATE users 
    SET status = 'member' 
    WHERE id = ${userID}
  `)

  if (upgraded instanceof PromiseError) throw new Error(upgraded.error);

  return true;
}

export const retrievePosts = async (
  {query, userStatus}: {query: string | undefined, userStatus: "visitor" | "member" | "admin"}
) => {
  const data = await handleError(sql`
    SELECT posts.*, row_to_json(u.*) author_data FROM posts 
    LEFT JOIN users u ON u.id = posts.author
    ${query ? 
      sql`
        WHERE 
          LOWER(posts.title) LIKE LOWER(${'%'+query+'%'})
          OR LOWER(posts.content) LIKE LOWER(${'%'+query+'%'})
          ${userStatus !== "visitor" ?
            sql`
              OR LOWER(u.username) LIKE LOWER(${'%'+query+'%'})
              OR LOWER(u.full_name) LIKE LOWER(${'%'+query+'%'})
              OR LOWER(u.status::text) LIKE LOWER(${'%'+query+'%'})
            ` :
            sql``
          }
      ` :
      sql``
    }
    ORDER BY created_at DESC
  `);

  if (data instanceof PromiseError) throw new Error(data.error);

  return data;
};

export const insertPost = async (newPost: Record<string, any>) => {
  const data = await handleError(sql`INSERT INTO posts ${sql(newPost)} RETURNING row_to_json(posts.*)`);

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

export const deletePost = async (postID: number) => {
  const data = await handleError(sql`DELETE FROM posts WHERE id = ${postID}`);

  if (data instanceof PromiseError) throw new Error(data.error);

  return true;
}