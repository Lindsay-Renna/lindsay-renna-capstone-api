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
		res.redirect(process.env.CLIENT_URL + "/profile");
	}
);

// Google authentication routes
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));
router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `${process.env.CLIENT_URL}/auth-fail`,
	}),
	(req, res) => {
		// Successful authentication
		res.redirect(process.env.CLIENT_URL + "/profile");
	}
);

// User profile endpoint that requires authentication
router.get("/profile", (req, res) => {
	// If `req.user` isn't found send back a 401 Unauthorized response
	if (req.user === undefined)
		return res.status(401).json({ message: "Unauthorized 😒" });

	// If user is currently authenticated, send back user info
	res.status(200).json(req.user);
});

// Logout endpoint
router.get("/logout", (req, res) => {
	req.logout((error) => {
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
