import express from "express";
import expressSession from "express-session";
import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import boardgameRoutes from "./routes/boardgames.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import helmet from "helmet";

// Passport library and Github
import passport from "passport";
import passportGitHub from "passport-github2";
import passportGoogle from "passport-google-oauth20";
const GitHubStrategy = passportGitHub.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

import knex from "./knexfile.js";

dotenv.config();

const app = express();
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);
app.use(express.json());
app.use(helmet());

app.use(
	expressSession({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		},
	})
);

// =========== Passport Config ============

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initialize GitHub strategy middleware
passport.use(
	new GitHubStrategy(
		{
			clientID: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			callbackURL: process.env.GITHUB_CALLBACK_URL,
		},
		(_accessToken, _refreshToken, profile, done) => {
			console.log("GitHub profile:", profile);

			// Check for user in DB
			knex("users")
				.select("id")
				.where({ github_id: profile.id })
				.then((user) => {
					if (user.length) {
						// If user is found, pass user object to serialize function
						done(null, user[0]);
					} else {
						// If user isn't found, create a record
						knex("users")
							.insert({
								github_id: profile.id,
								google_id: null,
								avatar_url: profile._json.avatar_url,
								username: profile.username,
							})
							.then((userId) => {
								// Pass the user object to serialize function
								done(null, { id: userId[0] });
							})
							.catch((err) => {
								console.log("Error creating a user", err);
							});
					}
				})
				.catch((err) => {
					console.log("Error fetching a user", err);
				});
		}
	)
);

// Initialize Google strategy middleware
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		(_accessToken, _refreshToken, profile, done) => {
			knex("users")
				.select("id")
				.where({ google_id: profile.id })
				.then((user) => {
					if (user.length) {
						done(null, user[0]);
					} else {
						knex("users")
							.insert({
								google_id: profile.id,
								github_id: null,
								avatar_url: profile.photos[0].value,
								username: profile.displayName,
							})
							.then((userId) => {
								done(null, { id: userId[0] });
							})
							.catch((err) => {
								console.log("Error creating a user", err);
							});
					}
				})
				.catch((err) => {
					console.log("Error fetching a user", err);
				});
		}
	)
);

passport.serializeUser((user, done) => {
	console.log("serializeUser (user object):", user);

	done(null, user.id);
});

passport.deserializeUser((userId, done) => {
	console.log("deserializeUser (user id):", userId);

	// Query user information from the database for currently authenticated user
	knex("users")
		.where({ id: userId })
		.then((user) => {
			console.log("req.user:", user[0]);
			done(null, user[0]);
		})
		.catch((err) => {
			console.log("Error finding user", err);
		});
});

//   Routes
app.use("/boardgames", boardgameRoutes);
app.use("/user", userRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
	res.send("Welcome to the FamTivity API");
});

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
