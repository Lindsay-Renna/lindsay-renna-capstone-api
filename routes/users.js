import knex from "../knexfile.js";
import express from "express";
const router = express.Router();

router.use(express.json());

router.get("/:userId/watched-list", async (req, res) => {
	try {
		const { userId } = req.params;
		const watchedList = await knex("watched")
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
	const { user_id, movie_id, movie_name, movie_year } = req.body;

	if (!user_id || !movie_id || !movie_name || !movie_year) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const [id] = await knex("watched").insert({
			user_id,
			movie_id,
			movie_name,
			movie_year,
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
		await knex("watched").delete().where({ id: movieId });

		res.status(204).json("Movie removed from watched list");
	} catch (error) {
		console.error("Error deleting movie from watched list:", error);
		res.status(500).json({ error: "Failed to remove movie from watched list" });
	}
});

// Get all family members for a user
router.get("/:userId/family", async (req, res) => {
	try {
		const { userId } = req.params;
		const familyList = await knex("family_member")
			.select("*")
			.where({ user_id: userId });
		res.status(200).json(familyList);
	} catch (error) {
		console.error(error);
		res.status(500).json({
			error_code: 500,
			error_msg: "Failed to GET family members information.",
		});
	}
});

// Add a new family member
router.post("/family/add", async (req, res) => {
	const { user_id, name, age, avatar } = req.body;

	if (!user_id || !name || !age || !avatar) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	try {
		const [id] = await knex("family_member").insert({
			user_id,
			name,
			age,
			avatar,
			updated_at: new Date(),
		});

		res.status(201).json({ id, message: "Family member added" });
	} catch (error) {
		console.error("Error adding family member:", error);
		res.status(500).json({ error: "Failed to add family member" });
	}
});

// Edit a family member
router.put("/family/:familyId", async (req, res) => {
	const { familyId } = req.params;
	const { name, age, avatar } = req.body;

	if (!familyId) {
		return res.status(400).json({ error: "No such family member found" });
	}

	if (!name && !age && !avatar) {
		return res.status(400).json({ error: "No fields to update" });
	}

	try {
		const updatedFields = {};
		if (name) updatedFields.name = name;
		if (age) updatedFields.age = age;
		if (avatar) updatedFields.avatar = avatar;
		updatedFields.updated_at = new Date();

		const result = await knex("family_member")
			.update(updatedFields)
			.where({ id: familyId });

		if (result) {
			res.status(200).json({ message: "Family member updated successfully" });
		} else {
			res.status(404).json({ error: "Family member not found" });
		}
	} catch (error) {
		console.error("Error updating family member:", error);
		res.status(500).json({ error: "Failed to update family member" });
	}
});

// Delete a family member
router.delete("/family/:familyId", async (req, res) => {
	const { familyId } = req.params;

	if (!familyId) {
		return res.status(400).json({ error: "No family member found" });
	}

	try {
		await knex("family_member").delete().where({ id: familyId });

		res.status(204).json("Family member removed");
	} catch (error) {
		console.error("Error deleting family member:", error);
		res.status(500).json({ error: "Failed to remove family member" });
	}
});

export default router;
