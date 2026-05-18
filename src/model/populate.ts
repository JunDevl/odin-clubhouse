import { config } from "dotenv";

config();

import postgres from "postgres";
import { readFileSync } from "node:fs";

(async () => {

  try {
    const sqlSchema = readFileSync("src/model/init.sql", {encoding: "utf-8"});

    if (!sqlSchema) throw new Error ("Schema SQL files not found.");

    const sql = postgres(`
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

    await sql.unsafe(sqlSchema);

    return;
  } catch (e) {
    console.error(e);
  }
})()