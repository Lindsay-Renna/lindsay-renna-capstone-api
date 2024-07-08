import { knexBG } from "../knexfile.js";
import express from "express";
const router = express.Router();

// GET first 10 boardgames

router.get("/", async (req, res) => {
	try {
		const boardgames = await knexBG("bgg").select("*").limit(10);
		boardgames.forEach((game) => {
			const image = JSON.parse(unescape(game.image_urls));
			const video = JSON.parse(unescape(game.video_urls));
			const mechanics = JSON.parse(unescape(game.mechanics));
			const category = JSON.parse(unescape(game.category));
			game.image_urls = image;
			game.video_urls = video;
			game.mechanics = mechanics;
			game.category = category;
		});

		res.status(200).json(boardgames);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error_code: 500, error_msg: "Failed to GET boardgame list." });
	}
});

// GET boardgame by query

router.get("/results", async (req, res) => {
	try {
		const { num_players, min_age, max_time, category } = req.body;

		const boardgames = await knexBG("bgg")
			.where("min_players", "<=", num_players)
			.andWhere("max_players", ">=", num_players)
			.andWhere("min_time", "<=", max_time)
			.andWhere("min_age", "<=", min_age)
			.modify((qb) => {
				category.forEach((cat) => {
					qb.andWhere("category", "like", `%${cat}%`);
				});
			});

		boardgames.forEach((game) => {
			const image = JSON.parse(unescape(game.image_urls));
			const video = JSON.parse(unescape(game.video_urls));
			const mechanics = JSON.parse(unescape(game.mechanics));
			const category = JSON.parse(unescape(game.category));
			game.image_urls = image;
			game.video_urls = video;
			game.mechanics = mechanics;
			game.category = category;
		});

		res.status(200).json(boardgames);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error_code: 500, error_msg: "Failed to GET boardgame list." });
	}
});

// GET boardgame details by id

router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const boardgame = await knexBG("bgg").where({ bgg_id: id }).first();

		if (!boardgame) {
			return res
				.status(404)
				.json({ error_code: 404, error_msg: "Boardgame not found." });
		}

		const image = JSON.parse(unescape(boardgame.image_urls));
		const video = JSON.parse(unescape(boardgame.video_urls));
		const mechanics = JSON.parse(unescape(boardgame.mechanics));
		const category = JSON.parse(unescape(boardgame.category));
		boardgame.image_urls = image;
		boardgame.video_urls = video;
		boardgame.mechanics = mechanics;
		boardgame.category = category;

		res.status(200).json(boardgame);
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ error_code: 500, error_msg: "Failed to GET boardgame list." });
	}
});
export default router;
