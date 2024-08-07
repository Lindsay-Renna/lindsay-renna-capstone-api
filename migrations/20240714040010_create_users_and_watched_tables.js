export const up = function (knex) {
	return knex.schema
		.createTable("users", (table) => {
			table.increments("id").primary();
			table.integer("github_id").defaultTo(null);
			table.string("google_id", 250).defaultTo(null);
			table.string("avatar_url").notNullable();
			table.string("username").notNullable();
			table.timestamp("updated_at").defaultTo(knex.fn.now());
		})
		.createTable("watched", (table) => {
			table.increments("id").primary();
			table.integer("user_id").unsigned().notNullable();
			table.integer("movie_id").notNullable();
			table.string("movie_name", 250).notNullable();
			table.integer("movie_year").notNullable();
			table.timestamp("updated_at").defaultTo(knex.fn.now());
			table
				.foreign("user_id")
				.references("id")
				.inTable("users")
				.onUpdate("CASCADE")
				.onDelete("CASCADE");
		})
		.createTable("family_members", (table) => {
			table.increments("id").primary();
			table.integer("user_id").unsigned().notNullable();
			table.string("name", 100).notNullable();
			table.integer("age").notNullable();
			table
				.foreign("user_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table.timestamp("updated_at").defaultTo(knex.fn.now());
		});
};

export const down = function (knex) {
	return knex.schema
		.dropTable("family_members")
		.dropTable("watched")
		.dropTable("users");
};
