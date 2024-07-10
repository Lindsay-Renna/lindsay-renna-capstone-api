import { knexUser } from "../knexfile.js";
import express from "express";
const router = express.Router();

router.use(express.json());

router.get("/:userId/watched-list", async (req, res) => {
	try {
		const { userId } = req.params;
		const watchedList = await knexUser("watched")
			.select("*")
			.where({ user_id: userId });
		res.status(200).json(watchedList);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error_code: 500,
			error_msg: "Failed to GET watched movies list.",
		});
	}
});

router.post("/watched-list/add", async (req, res) => {
	const { user_id, movie_id, movie_name } = req.body;

	if (!user_id || !movie_id || !movie_name) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const [id] = await knexUser("watched").insert({
			user_id,
			movie_id,
			movie_name,
			updated_at: new Date(),
		});

		res.status(201).json({ id, message: "Movie added to watched list" });
	} catch (error) {
		console.error("Error adding movie to watched list:", error);
		res.status(500).json({ error: "Failed to add movie to watched list" });
	}
});

router.delete("/:movieId", async (req, res) => {
	const { movieId } = req.params;

	if (!movieId) {
		return res.status(400).json({ error: "No movie with that ID located" });
	}

	try {
		await knexUser("watched").delete().where({ id: movieId });

		res.status(204).json("Movie removed from watched list");
	} catch (error) {
		console.error("Error deleting movie from watched list:", error);
		res.status(500).json({ error: "Failed to remove movie from watched list" });
	}
});

export default router;
