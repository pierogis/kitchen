DO $$ BEGIN
 CREATE TYPE "direction" AS ENUM('In', 'Out');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "flavor_type" AS ENUM('Number', 'Color', 'Text', 'Image');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calls_for" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"recipe_uuid" uuid NOT NULL,
	"usage_uuid" uuid NOT NULL,
	CONSTRAINT "calls_for_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"parent_ingredient_uuid" uuid,
	"in_flavor_uuid" uuid,
	"out_flavor_uuid" uuid,
	"in_usage_uuid" uuid,
	"out_usage_uuid" uuid,
	"flavor_type" "flavor_type",
	CONSTRAINT "connections_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "connections_in_flavor_uuid_unique" UNIQUE("in_flavor_uuid"),
	CONSTRAINT "connections_in_usage_uuid_unique" UNIQUE("in_usage_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flavors" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"type" "flavor_type" NOT NULL,
	"name" varchar NOT NULL,
	"options" json,
	"ingredient_uuid" uuid,
	"prep_uuid" uuid,
	"directions" direction[] NOT NULL,
	CONSTRAINT "flavors_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "flavors_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"parent_ingredient_uuid" uuid,
	CONSTRAINT "ingredients_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_for_uuid" uuid NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL,
	CONSTRAINT "locations_call_for_uuid_unique" UNIQUE("call_for_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"number" double precision,
	"text" varchar(512),
	"color" varchar(6),
	"image" varchar(512),
	"recipe_uuid" uuid NOT NULL,
	"flavor_uuid" uuid NOT NULL,
	"usage_uuid" uuid NOT NULL,
	CONSTRAINT "parameters_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "parameters_recipe_uuid_unique" UNIQUE("recipe_uuid"),
	CONSTRAINT "parameters_flavor_uuid_unique" UNIQUE("flavor_uuid"),
	CONSTRAINT "parameters_usage_uuid_unique" UNIQUE("usage_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "preps" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"ingredient_uuid" uuid,
	CONSTRAINT "preps_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"main_call_for_uuid" uuid NOT NULL,
	CONSTRAINT "recipes_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "recipes_main_call_for_uuid_unique" UNIQUE("main_call_for_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shaders" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"recipe_uuid" uuid NOT NULL,
	"ingredient_uuid" uuid NOT NULL,
	"image_flavor_uuid" uuid NOT NULL,
	"vertex_source" varchar(16384) NOT NULL,
	"fragment_source" varchar(16384) NOT NULL,
	CONSTRAINT "shaders_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "shaders_recipe_uuid_unique" UNIQUE("recipe_uuid"),
	CONSTRAINT "shaders_ingredient_uuid_unique" UNIQUE("ingredient_uuid"),
	CONSTRAINT "shaders_image_flavor_uuid_unique" UNIQUE("image_flavor_uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usages" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid NOT NULL,
	"name" varchar NOT NULL,
	"ingredient_uuid" uuid,
	"parent_unsage_uuid" uuid,
	CONSTRAINT "usages_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "calls_for_recipe_uuid_usage_uuid_unique" ON "calls_for" ("recipe_uuid","usage_uuid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "connections_parent_ingredient_uuid_in_flavor_uuid_out_flavor_uuid_in_usage_uuid_out_usage_uuid_unique" ON "connections" ("parent_ingredient_uuid","in_flavor_uuid","out_flavor_uuid","in_usage_uuid","out_usage_uuid");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parameters_recipe_uuid_flavor_uuid_unique" ON "parameters" ("recipe_uuid","flavor_uuid");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls_for" ADD CONSTRAINT "calls_for_recipe_uuid_recipes_uuid_fk" FOREIGN KEY ("recipe_uuid") REFERENCES "recipes"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls_for" ADD CONSTRAINT "calls_for_usage_uuid_usages_uuid_fk" FOREIGN KEY ("usage_uuid") REFERENCES "usages"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_parent_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("parent_ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_in_flavor_uuid_flavors_uuid_fk" FOREIGN KEY ("in_flavor_uuid") REFERENCES "flavors"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_out_flavor_uuid_flavors_uuid_fk" FOREIGN KEY ("out_flavor_uuid") REFERENCES "flavors"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_in_usage_uuid_usages_uuid_fk" FOREIGN KEY ("in_usage_uuid") REFERENCES "usages"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connections" ADD CONSTRAINT "connections_out_usage_uuid_usages_uuid_fk" FOREIGN KEY ("out_usage_uuid") REFERENCES "usages"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flavors" ADD CONSTRAINT "flavors_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flavors" ADD CONSTRAINT "flavors_prep_uuid_preps_uuid_fk" FOREIGN KEY ("prep_uuid") REFERENCES "preps"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_parent_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("parent_ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "locations" ADD CONSTRAINT "locations_call_for_uuid_calls_for_uuid_fk" FOREIGN KEY ("call_for_uuid") REFERENCES "calls_for"("uuid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parameters" ADD CONSTRAINT "parameters_recipe_uuid_recipes_uuid_fk" FOREIGN KEY ("recipe_uuid") REFERENCES "recipes"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parameters" ADD CONSTRAINT "parameters_flavor_uuid_flavors_uuid_fk" FOREIGN KEY ("flavor_uuid") REFERENCES "flavors"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parameters" ADD CONSTRAINT "parameters_usage_uuid_usages_uuid_fk" FOREIGN KEY ("usage_uuid") REFERENCES "usages"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "preps" ADD CONSTRAINT "preps_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipes" ADD CONSTRAINT "recipes_main_call_for_uuid_calls_for_uuid_fk" FOREIGN KEY ("main_call_for_uuid") REFERENCES "calls_for"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shaders" ADD CONSTRAINT "shaders_recipe_uuid_recipes_uuid_fk" FOREIGN KEY ("recipe_uuid") REFERENCES "recipes"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shaders" ADD CONSTRAINT "shaders_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shaders" ADD CONSTRAINT "shaders_image_flavor_uuid_flavors_uuid_fk" FOREIGN KEY ("image_flavor_uuid") REFERENCES "flavors"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usages" ADD CONSTRAINT "usages_ingredient_uuid_ingredients_uuid_fk" FOREIGN KEY ("ingredient_uuid") REFERENCES "ingredients"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usages" ADD CONSTRAINT "usages_parent_unsage_uuid_usages_uuid_fk" FOREIGN KEY ("parent_unsage_uuid") REFERENCES "usages"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
