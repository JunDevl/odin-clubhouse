import { Router } from "express";
import { createUser } from "../controllers/authController.ts";
import passport from "passport";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/posts");
    return;
  }

  res.redirect("/log-in");
});

authRouter.get("/log-in", (_, res) => res.render("login-form"));

authRouter.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/log-in");
  });
});

authRouter.get("/sign-up", (_, res) => res.render("signup-form"));

authRouter.post("/sign-up", createUser);

authRouter.post("/log-in", passport.authenticate("local", {
  successRedirect: "/posts",
  failureRedirect: "/log-in",
  failureMessage: "Failed to log-in."
}));

export default authRouter;