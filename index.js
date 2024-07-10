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

// Knex instance
import { knexUser } from "./knexfile.js";

// Import .env files for environment variables (keys and secrets)

dotenv.config();

const app = express();
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);
app.use(express.json());

// Initialize HTTP Headers middleware
app.use(helmet());

// Include express-session middleware (with additional config options required for Passport session)
app.use(
	expressSession({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
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
			// For our implementation we don't need access or refresh tokens.
			// Profile parameter will be the profile object we get back from GitHub
			console.log("GitHub profile:", profile);

			// First let's check if we already have this user in our DB
			knexUser("users")
				.select("id")
				.where({ github_id: profile.id })
				.then((user) => {
					if (user.length) {
						// If user is found, pass the user object to serialize function
						done(null, user[0]);
					} else {
						// If user isn't found, we create a record
						knexUser("users")
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
			knexUser("users")
				.select("id")
				.where({ google_id: profile.id })
				.then((user) => {
					if (user.length) {
						done(null, user[0]);
					} else {
						knexUser("users")
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

	// Store only the user id in session
	done(null, user.id);
});

// `deserializeUser` receives a value sent from `serializeUser` `done` function
// We can then retrieve full user information from our database using the userId
passport.deserializeUser((userId, done) => {
	console.log("deserializeUser (user id):", userId);

	// Query user information from the database for currently authenticated user
	knexUser("users")
		.where({ id: userId })
		.then((user) => {
			// Remember that knex will return an array of records, so we need to get a single record from it
			console.log("req.user:", user[0]);

			// The full user object will be attached to request object as `req.user`
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

app.get("/healthcheck", (req, res) => {
	res.send("Server is healthy");
});

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
});
