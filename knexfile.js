// Import dotenv to process environment variables from `.env` file.
import "dotenv/config";
import Knex from "knex";

export const boardgameDB = {
	client: "mysql2",
	connection: {
		host: process.env.DB_HOST,
		database: process.env.DB1_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		charset: "utf8",
	},
	migrations: {
		directory: "./migrations/boardgames",
	},
};

export const userDB = {
	client: "mysql2",
	connection: {
		host: process.env.DB_HOST,
		database: process.env.DB2_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		charset: "utf8",
	},

	migrations: {
		directory: "./migrations/users",
	},
};

export const knexBG = Knex(boardgameDB);
export const knexUser = Knex(userDB);
