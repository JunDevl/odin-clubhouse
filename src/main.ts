import { config } from "dotenv";

config();

import path from "path";
import express from "express";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import argon2 from "argon2";
import { sql } from "./model/db.ts";
import authRouter from "./routes/authRouter.ts";
import postsRouter from "./routes/postsRouter.ts";

const __dirname = path.resolve();

const PORT = 3000;

const app = express();
app.use(express.static(__dirname + '/public'));
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

app.use(session({ 
  secret: process.env["SESSION_SECRET"]!,
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(new LocalStrategy.Strategy(
  {
    usernameField: "email",
    passwordField: "password"
  },
  async (email, password, done) => {
  try {
    const rows = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = rows[0];

    if (!user) return done(null, false, { message: "Incorrect email" });

    const validated = await argon2.verify(user.password, password);
    
    if (!validated) return done(null, false, { message: "Incorrect password" });

    return done(null, user);
  } catch(err) {
    return done(err);
  }
}))

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const rows = await sql`SELECT * FROM users WHERE id = ${id as any}`;
    const [user] = rows;

    app.locals.user = user;
    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.use("/", authRouter);
app.use("/posts", postsRouter);

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App listening on port ${PORT}!\n`);
});
