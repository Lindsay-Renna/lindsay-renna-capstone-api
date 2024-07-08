import { knexUser } from "../knexfile.js";
import express from "express";
const router = express.Router();

import passport from "passport";

import dotenv from "dotenv";
dotenv.config();

// Github authentication routes
router.get("/github", passport.authenticate("github"));
router.get(
	"/github/callback",
	passport.authenticate("github", {
		failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
	}),
	(_req, res) => {
		res.redirect(process.env.CLIENT_URL);
	}
);

// Google authentication routes
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${process.env.CLIENT_URL}/login`,
	}),
	(req, res) => {
		// Successful authentication
		res.redirect(process.env.CLIENT_URL);
	}
);

// User profile endpoint that requires authentication
router.get("/profile", (req, res) => {
	// Passport stores authenticated user information on `req.user` object.
	// Comes from done function of `deserializeUser`

	// If `req.user` isn't found send back a 401 Unauthorized response
	if (req.user === undefined)
		return res.status(401).json({ message: "Unauthorized" });

	// If user is currently authenticated, send back user info
	res.status(200).json(req.user);
});

// Create a logout endpoint
router.get("/logout", (req, res) => {
	// Passport adds the logout method to request, it will end user session
	req.logout((error) => {
		// This callback function runs after the logout function
		if (error) {
			return res.status(500).json({
				message: "Server error, please try again later",
				error: error,
			});
		}
		// Redirect the user back to client-side application
		res.redirect(process.env.CLIENT_URL);
	});
});

export default router;
