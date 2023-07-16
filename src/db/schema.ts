import {
	pgTable,
	serial,
	varchar,
	boolean,
	integer,
	uniqueIndex,
	primaryKey,
	check,
	pgEnum
} from 'drizzle-orm/pg-core';

import { type InferModel, sql, relations } from 'drizzle-orm';
