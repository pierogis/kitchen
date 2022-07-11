import {
	Direction,
	type FullRecipe,
	FlavorType,
	PrepType,
	type Prep,
	type FullIngredient,
	type Usage,
	type FullCallFor,
	type Parameter,
	type Flavor
} from '@types';

const recipeUuid = '0-recipe';

// main ingredient
const mainIngredientUuid = 'main-ingredient';

const mainUsage: Usage = {
	uuid: 'main-usage',
	ingredientUuid: mainIngredientUuid,
	parentUsageUuid: undefined
};

const scenePrepUuid = 'scene-prep';

const scenePrepFlavor: Flavor = {
	uuid: 'scene-prep-flavor',
	ingredientUuid: mainIngredientUuid,
	name: 'scene',
	type: FlavorType.Geometry,
	prepUuid: scenePrepUuid,
	directions: [Direction.In, Direction.Out],
	options: null
};

const radiusInputFlavor: Flavor = {
	uuid: 'radius-input-flavor',
	ingredientUuid: mainIngredientUuid,
	name: 'radius',
	type: FlavorType.Number,
	directions: [Direction.In],
	options: {
		min: 0,
		max: 360
	}
};

const scenePrep: Prep<PrepType.Scene> = {
	uuid: scenePrepUuid,
	name: 'scene',
	ingredientUuid: mainIngredientUuid,
	type: PrepType.Scene,
	flavorUuidMap: {
		scene: scenePrepFlavor.uuid
	}
};

const mainIngredient: FullIngredient = {
	uuid: mainIngredientUuid,
	parentIngredientUuid: undefined,
	name: 'sort',
	flavors: [scenePrepFlavor, radiusInputFlavor],
	connections: [],
	usages: [mainUsage],
	preps: [scenePrep]
};

const sphereIngredientUuid = 'sphere-ingredient';
const sphereUsage: Usage = {
	uuid: 'sphere-usage',
	ingredientUuid: sphereIngredientUuid,
	parentUsageUuid: mainUsage.uuid
};

const spherePrepUuid = 'sphere-prep';

const spherePrepFlavor = {
	uuid: 'sphere-prep-flavor',
	ingredientUuid: sphereIngredientUuid,
	name: 'sphere',
	type: FlavorType.Geometry,
	prepUuid: spherePrepUuid,
	directions: [Direction.Out],
	options: null
};

const radiusPrepFlavor = {
	uuid: 'radius-prep-flavor',
	ingredientUuid: sphereIngredientUuid,
	name: 'radius',
	type: FlavorType.Number,
	prepUuid: spherePrepUuid,
	directions: [Direction.In],
	options: null
};

const radiusSphereFlavor = {
	uuid: 'radius-sphere-flavor',
	ingredientUuid: sphereIngredientUuid,
	name: 'radius',
	type: FlavorType.Number,
	directions: [Direction.In],
	options: {
		min: 0,
		max: 360
	}
};

const spherePrep: Prep<PrepType.Sphere> = {
	uuid: spherePrepUuid,
	ingredientUuid: 'sphere-ingredient',
	name: 'sphere',
	type: PrepType.Sphere,
	flavorUuidMap: { sphere: spherePrepFlavor.uuid, radius: radiusPrepFlavor.uuid }
};
const sphereIngredient: FullIngredient = {
	uuid: sphereIngredientUuid,
	parentIngredientUuid: mainIngredient.uuid,
	name: 'sphere',
	flavors: [spherePrepFlavor, radiusPrepFlavor, radiusSphereFlavor],
	connections: [],
	usages: [sphereUsage],
	preps: [spherePrep]
};

const mainCallForUuid = 'main-callFor';
const mainCallFor: FullCallFor = {
	uuid: mainCallForUuid,
	recipeUuid,
	usageUuid: mainUsage.uuid,
	location: {
		uuid: 'main-location',
		callForUuid: mainCallForUuid,
		x: 100,
		y: 200
	}
};

const sphereCallForUuid = 'sphere-callFor';
const sphereCallFor: FullCallFor = {
	uuid: sphereCallForUuid,
	recipeUuid,
	usageUuid: sphereUsage.uuid,
	location: {
		uuid: 'sphere-location',
		callForUuid: sphereCallForUuid,
		x: 500,
		y: 200
	}
};

const radiusInputParameter: Parameter<FlavorType.Number> = {
	uuid: 'radius-input-parameter',
	recipeUuid,
	flavorUuid: radiusInputFlavor.uuid,
	usageUuid: sphereUsage.uuid,
	payload: {
		type: FlavorType.Number,
		value: 1
	}
};

// const asd: FlavorMap<PrepType.Scene> = {};
export const defaultRecipe: FullRecipe = {
	uuid: recipeUuid,
	mainCallForUuid: mainCallFor.uuid,
	ingredients: [mainIngredient, sphereIngredient],
	callsFor: [mainCallFor, sphereCallFor],
	parameters: [radiusInputParameter],
	shaders: []
};
