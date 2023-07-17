import {
	pgTable,
	serial,
	varchar,
	uuid,
	integer,
	uniqueIndex,
	pgEnum,
	json,
	doublePrecision
} from 'drizzle-orm/pg-core';

import { type InferModel, relations } from 'drizzle-orm';

export const flavorTypeEnum = pgEnum('flavor_type', ['Number', 'Color', 'Text', 'Image']);
export const directionEnum = pgEnum('direction', ['In', 'Out']);

export const flavors = pgTable('flavors', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	type: flavorTypeEnum('type').unique().notNull(),
	name: varchar('name').notNull(),
	options: json('options'),
	ingredientUuid: uuid('ingredient_uuid').references(() => ingredients.uuid),
	prepUuid: uuid('prep_uuid').references(() => preps.uuid),
	directions: directionEnum('directions').array().notNull()
});

export type Flavor = InferModel<typeof flavors>;

export const ingredients = pgTable('ingredients', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	name: varchar('name').notNull(),
	parentIngredientUuid: uuid('parent_ingredient_uuid').references(() => ingredients.uuid)
});

export type Ingredient = InferModel<typeof ingredients>;

export const preps = pgTable('preps', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	name: varchar('name').notNull(),
	ingredientUuid: uuid('ingredient_uuid').references(() => ingredients.uuid)
});

export type Prep = InferModel<typeof preps>;

export const usages = pgTable('usages', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	name: varchar('name').notNull(),
	ingredientUuid: uuid('ingredient_uuid').references(() => ingredients.uuid),
	parentUsageUuid: uuid('parent_unsage_uuid').references(() => usages.uuid)
});

export type Usage = InferModel<typeof usages>;

export const connections = pgTable(
	'connections',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').unique().notNull(),
		name: varchar('name').notNull(),
		parentIngredientUuid: uuid('parent_ingredient_uuid').references(() => ingredients.uuid),
		inFlavorUuid: uuid('in_flavor_uuid')
			.unique()
			.references(() => flavors.uuid),
		outFlavorUuid: uuid('out_flavor_uuid').references(() => flavors.uuid),
		inUsageUuid: uuid('in_usage_uuid')
			.unique()
			.references(() => usages.uuid),
		outUsageUuid: uuid('out_usage_uuid').references(() => usages.uuid),
		flavorType: flavorTypeEnum('flavor_type')
	},
	(table) => {
		return {
			parentIngredientUuidd_inFlavorUuid_outFlavorUuid_inUsageUuid_outUsageUuid_unique: uniqueIndex(
				'connections_parent_ingredient_uuid_in_flavor_uuid_out_flavor_uuid_in_usage_uuid_out_usage_uuid_unique'
			).on(
				table.parentIngredientUuid,
				table.inFlavorUuid,
				table.outFlavorUuid,
				table.inUsageUuid,
				table.outUsageUuid
			)
		};
	}
);

export type Connection = InferModel<typeof connections>;

export const recipes = pgTable('recipes', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	mainCallForUuid: uuid('main_call_for_uuid')
		.unique()
		.notNull()
		.references(() => callsFor.uuid)
});

export type Recipe = InferModel<typeof recipes>;

export const parameters = pgTable(
	'parameters',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').unique().notNull(),
		number: doublePrecision('number'),
		text: varchar('text', { length: 512 }),
		color: varchar('color', { length: 6 }),
		image: varchar('image', { length: 512 }),
		recipeUuid: uuid('recipe_uuid')
			.unique()
			.notNull()
			.references(() => recipes.uuid),
		flavorUuid: uuid('flavor_uuid')
			.unique()
			.notNull()
			.references(() => flavors.uuid),
		usageUuid: uuid('usage_uuid')
			.unique()
			.notNull()
			.references(() => usages.uuid)
	},
	(table) => {
		return {
			recipeUuidFlavorUuidUnique: uniqueIndex('parameters_recipe_uuid_flavor_uuid_unique').on(
				table.recipeUuid,
				table.flavorUuid
			)
		};
	}
);

export type Parameter = InferModel<typeof parameters>;

export const shaders = pgTable('shaders', {
	id: serial('id').primaryKey(),
	uuid: uuid('uuid').unique().notNull(),
	recipeUuid: uuid('recipe_uuid')
		.unique()
		.notNull()
		.references(() => recipes.uuid),
	ingredientUuid: uuid('ingredient_uuid')
		.unique()
		.notNull()
		.references(() => ingredients.uuid),
	imageFlavorUuid: uuid('image_flavor_uuid')
		.unique()
		.notNull()
		.references(() => flavors.uuid),
	vertexSource: varchar('vertex_source', { length: 16384 }).notNull(),
	fragmentSource: varchar('fragment_source', { length: 16384 }).notNull()
});

export type Shader = InferModel<typeof shaders>;

export const callsFor = pgTable(
	'calls_for',
	{
		id: serial('id').primaryKey(),
		uuid: uuid('uuid').unique().notNull(),
		recipeUuid: uuid('recipe_uuid')
			.notNull()
			.references(() => recipes.uuid, { onDelete: 'cascade' }),
		usageUuid: uuid('usage_uuid')
			.notNull()
			.references(() => usages.uuid)
	},
	(table) => {
		return {
			recipeUuidUsageUuidUnique: uniqueIndex('calls_for_recipe_uuid_usage_uuid_unique').on(
				table.recipeUuid,
				table.usageUuid
			)
		};
	}
);

export type CallFor = InferModel<typeof shaders>;

export const locations = pgTable('locations', {
	id: serial('id').primaryKey(),
	callForUuid: uuid('call_for_uuid')
		.unique()
		.notNull()
		.references(() => callsFor.uuid, { onDelete: 'cascade' }),
	x: integer('x').notNull(),
	y: integer('y').notNull()
});

export type Location = InferModel<typeof locations>;

export const flavorsRelations = relations(flavors, ({ one, many }) => ({
	ingredient: one(ingredients, {
		fields: [flavors.ingredientUuid],
		references: [ingredients.uuid]
	}),
	prep: one(preps, {
		fields: [flavors.prepUuid],
		references: [preps.uuid]
	}),
	inConnection: one(connections),
	outConnections: many(connections),
	shader: one(shaders),
	parameter: one(parameters)
}));

export const ingredientsRelations = relations(ingredients, ({ one, many }) => ({
	parentIngredient: one(ingredients, {
		fields: [ingredients.parentIngredientUuid],
		references: [ingredients.uuid]
	}),
	flavors: many(flavors),
	connections: many(connections),
	preps: many(preps),
	shader: one(shaders),
	subIngredients: many(ingredients),
	usages: many(usages)
}));

export const prepsRelations = relations(preps, ({ one, many }) => ({
	ingredient: one(ingredients, {
		fields: [preps.ingredientUuid],
		references: [ingredients.uuid]
	}),
	flavors: many(flavors)
}));

export const usagesRelations = relations(usages, ({ one, many }) => ({
	ingredient: one(ingredients, {
		fields: [usages.ingredientUuid],
		references: [ingredients.uuid]
	}),
	inConnections: many(connections),
	outConnections: many(connections),
	parentUsage: one(usages, {
		fields: [usages.parentUsageUuid],
		references: [usages.uuid]
	}),
	subUsages: many(usages),
	callsFor: many(callsFor),
	parameters: many(parameters)
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
	parentIngredient: one(ingredients, {
		fields: [connections.parentIngredientUuid],
		references: [ingredients.uuid]
	}),
	inFlavor: one(flavors, {
		fields: [connections.inFlavorUuid],
		references: [flavors.uuid]
	}),
	outFlavor: one(flavors, {
		fields: [connections.outFlavorUuid],
		references: [flavors.uuid]
	}),
	inUsage: one(usages, {
		fields: [connections.inUsageUuid],
		references: [usages.uuid]
	}),
	outUsage: one(usages, {
		fields: [connections.outUsageUuid],
		references: [usages.uuid]
	})
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
	mainCallFor: one(callsFor, {
		fields: [recipes.mainCallForUuid],
		references: [callsFor.uuid]
	}),
	parameters: many(parameters),
	shaders: many(shaders),
	callsFor: many(callsFor)
}));

export const parametersRelations = relations(parameters, ({ one }) => ({
	recipe: one(recipes, {
		fields: [parameters.recipeUuid],
		references: [recipes.uuid]
	}),
	flavor: one(flavors, {
		fields: [parameters.flavorUuid],
		references: [flavors.uuid]
	}),
	usage: one(usages, {
		fields: [parameters.usageUuid],
		references: [usages.uuid]
	})
}));

export const shadersRelations = relations(shaders, ({ one }) => ({
	recipe: one(recipes, {
		fields: [shaders.recipeUuid],
		references: [recipes.uuid]
	}),
	ingredient: one(ingredients, {
		fields: [shaders.ingredientUuid],
		references: [flavors.uuid]
	}),
	imageFlavor: one(flavors, {
		fields: [shaders.imageFlavorUuid],
		references: [flavors.uuid]
	})
}));

export const callsForRelations = relations(callsFor, ({ one }) => ({
	mainRecipe: one(recipes),
	recipe: one(recipes, {
		fields: [callsFor.recipeUuid],
		references: [recipes.uuid]
	}),
	usage: one(usages, {
		fields: [callsFor.usageUuid],
		references: [usages.uuid]
	}),
	location: one(locations)
}));

export const locationsRelations = relations(locations, ({ one }) => ({
	callFor: one(recipes, {
		fields: [locations.callForUuid],
		references: [callsFor.uuid]
	})
}));
