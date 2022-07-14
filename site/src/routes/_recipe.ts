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

// ingredientUuids
const mainIngredientUuid = 'main-ingredient';
const meshIngredientUuid = 'mesh-ingredient';
const sphereIngredientUuid = 'sphere-ingredient';
const materialIngredientUuid = 'material-ingredient';

// preps

const addToScenePrepUuid = 'addToScene-prep';

const addToScenePrepFlavor: Flavor = {
	uuid: 'addToScene-prep-flavor',
	ingredientUuid: mainIngredientUuid,
	name: 'addToScene',
	type: FlavorType.Object,
	prepUuid: addToScenePrepUuid,
	directions: [Direction.In],
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
		max: 1
	}
};

const colorInputFlavor: Flavor = {
	uuid: 'color-input-flavor',
	ingredientUuid: mainIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	directions: [Direction.In],
	options: null
};

const addToScenePrep: Prep<PrepType.AddToScene> = {
	uuid: addToScenePrepUuid,
	name: 'add to Scene',
	ingredientUuid: mainIngredientUuid,
	type: PrepType.AddToScene,
	direction: Direction.Out,
	inFlavorUuidMap: { object: addToScenePrepFlavor.uuid },
	outFlavorUuidMap: {}
};

const meshPrepUuid = 'mesh-prep';

const meshRadiusInputFlavor: Flavor = {
	uuid: 'mesh-radius-input-flavor',
	ingredientUuid: meshIngredientUuid,
	name: 'radius',
	type: FlavorType.Number,
	prepUuid: undefined,
	directions: [Direction.In],
	options: null
};

const meshColorInputFlavor: Flavor = {
	uuid: 'mesh-color-input-flavor',
	ingredientUuid: meshIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	prepUuid: undefined,
	directions: [Direction.In],
	options: null
};

const meshPrepFlavor = {
	uuid: 'mesh-prep-flavor',
	ingredientUuid: meshIngredientUuid,
	name: 'mesh',
	type: FlavorType.Object,
	prepUuid: meshPrepUuid,
	directions: [Direction.Out],
	options: null
};

const geometryPrepFlavor = {
	uuid: 'geometry-prep-flavor',
	ingredientUuid: meshIngredientUuid,
	name: 'geometry',
	type: FlavorType.Geometry,
	prepUuid: meshPrepUuid,
	directions: [Direction.In],
	options: null
};

const meshMaterialPrepFlavor = {
	uuid: 'mesh-material-prep-flavor',
	ingredientUuid: meshIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	prepUuid: meshPrepUuid,
	directions: [Direction.In],
	options: null
};

const meshPrep: Prep<PrepType.Mesh> = {
	uuid: meshPrepUuid,
	ingredientUuid: meshIngredientUuid,
	name: 'sphere',
	type: PrepType.Mesh,
	direction: Direction.Out,
	inFlavorUuidMap: {
		material: meshMaterialPrepFlavor.uuid,
		geometry: geometryPrepFlavor.uuid
	},
	outFlavorUuidMap: {
		mesh: meshPrepFlavor.uuid
	}
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
	options: null
};

const spherePrep: Prep<PrepType.Sphere> = {
	uuid: spherePrepUuid,
	ingredientUuid: sphereIngredientUuid,
	name: 'sphere',
	type: PrepType.Sphere,
	direction: Direction.Out,
	inFlavorUuidMap: { radius: radiusPrepFlavor.uuid },
	outFlavorUuidMap: { sphere: spherePrepFlavor.uuid }
};

const materialPrepUuid = 'material-prep';

const materialPrepFlavor = {
	uuid: 'material-prep-flavor',
	ingredientUuid: materialIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	prepUuid: materialPrepUuid,
	directions: [Direction.Out],
	options: null
};

const colorPrepFlavor = {
	uuid: 'color-prep-flavor',
	ingredientUuid: materialIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	prepUuid: materialPrepUuid,
	directions: [Direction.In],
	options: null
};

const colorMaterialFlavor = {
	uuid: 'color-material-flavor',
	ingredientUuid: materialIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	directions: [Direction.In],
	options: null
};

const materialPrep: Prep<PrepType.Material> = {
	uuid: materialPrepUuid,
	ingredientUuid: materialIngredientUuid,
	name: 'material',
	type: PrepType.Material,
	direction: Direction.Out,
	inFlavorUuidMap: { color: colorPrepFlavor.uuid },
	outFlavorUuidMap: { material: materialPrepFlavor.uuid }
};

// usages and ingredients
const mainUsage: Usage = {
	uuid: 'main-usage',
	ingredientUuid: mainIngredientUuid,
	parentUsageUuid: undefined
};

const meshUsage: Usage = {
	uuid: 'mesh-usage',
	ingredientUuid: meshIngredientUuid,
	parentUsageUuid: mainUsage.uuid
};

const materialUsage: Usage = {
	uuid: 'material-usage',
	ingredientUuid: materialIngredientUuid,
	parentUsageUuid: meshUsage.uuid
};

const sphereUsage: Usage = {
	uuid: 'sphere-usage',
	ingredientUuid: sphereIngredientUuid,
	parentUsageUuid: meshUsage.uuid
};

const mainIngredient: FullIngredient = {
	uuid: mainIngredientUuid,
	parentIngredientUuid: undefined,
	name: 'sort',
	flavors: [addToScenePrepFlavor, radiusInputFlavor, colorInputFlavor],
	connections: [
		{
			uuid: 'main-mesh-addToScene-connection',
			flavorType: FlavorType.Object,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: addToScenePrepFlavor.uuid,
			outFlavorUuid: meshPrepFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: meshUsage.uuid
		},
		{
			uuid: 'main-radius-connection',
			flavorType: FlavorType.Number,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: meshRadiusInputFlavor.uuid,
			outFlavorUuid: radiusInputFlavor.uuid,
			inUsageUuid: meshUsage.uuid,
			outUsageUuid: undefined
		},
		{
			uuid: 'main-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: meshColorInputFlavor.uuid,
			inUsageUuid: meshUsage.uuid,
			outFlavorUuid: colorInputFlavor.uuid,
			outUsageUuid: undefined
		}
	],
	usages: [mainUsage],
	preps: [addToScenePrep]
};

const meshIngredient: FullIngredient = {
	uuid: meshIngredientUuid,
	parentIngredientUuid: mainIngredient.uuid,
	name: 'mesh',
	flavors: [
		meshPrepFlavor,
		meshMaterialPrepFlavor,
		geometryPrepFlavor,
		meshRadiusInputFlavor,
		meshColorInputFlavor
	],
	connections: [
		{
			uuid: 'mesh-geometry-connection',
			flavorType: FlavorType.Geometry,
			parentIngredientUuid: meshIngredientUuid,
			outFlavorUuid: spherePrepFlavor.uuid,
			outUsageUuid: sphereUsage.uuid,
			inFlavorUuid: geometryPrepFlavor.uuid,
			inUsageUuid: undefined
		},
		{
			uuid: 'mesh-material-connection',
			flavorType: FlavorType.Material,
			parentIngredientUuid: meshIngredientUuid,
			outFlavorUuid: materialPrepFlavor.uuid,
			outUsageUuid: materialUsage.uuid,
			inFlavorUuid: meshMaterialPrepFlavor.uuid,
			inUsageUuid: undefined
		},
		{
			uuid: 'mesh-radius-connection',
			flavorType: FlavorType.Number,
			parentIngredientUuid: meshIngredientUuid,
			outFlavorUuid: meshRadiusInputFlavor.uuid,
			outUsageUuid: undefined,
			inFlavorUuid: radiusSphereFlavor.uuid,
			inUsageUuid: sphereUsage.uuid
		},
		{
			uuid: 'mesh-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: meshIngredientUuid,
			outFlavorUuid: meshColorInputFlavor.uuid,
			outUsageUuid: undefined,
			inFlavorUuid: colorMaterialFlavor.uuid,
			inUsageUuid: materialUsage.uuid
		}
	],
	usages: [meshUsage],
	preps: [meshPrep]
};

const materialIngredient: FullIngredient = {
	uuid: materialIngredientUuid,
	parentIngredientUuid: meshIngredient.uuid,
	name: 'material',
	flavors: [materialPrepFlavor, colorPrepFlavor, colorMaterialFlavor],
	connections: [
		{
			uuid: 'material-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: materialIngredientUuid,
			inFlavorUuid: colorPrepFlavor.uuid,
			outFlavorUuid: colorMaterialFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: undefined
		}
	],
	usages: [materialUsage],
	preps: [materialPrep]
};

const sphereIngredient: FullIngredient = {
	uuid: sphereIngredientUuid,
	parentIngredientUuid: meshIngredient.uuid,
	name: 'sphere',
	flavors: [spherePrepFlavor, radiusPrepFlavor, radiusSphereFlavor],
	connections: [
		{
			uuid: 'sphere-radius-connection',
			flavorType: FlavorType.Number,
			parentIngredientUuid: sphereIngredientUuid,
			inFlavorUuid: radiusPrepFlavor.uuid,
			outFlavorUuid: radiusSphereFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: undefined
		}
	],
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

const meshCallForUuid = 'mesh-callFor';
const meshCallFor: FullCallFor = {
	uuid: meshCallForUuid,
	recipeUuid,
	usageUuid: meshUsage.uuid,
	location: {
		uuid: 'mesh-location',
		callForUuid: meshCallForUuid,
		x: 500,
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
		x: 400,
		y: 400
	}
};

const materialCallForUuid = 'material-callFor';
const materialCallFor: FullCallFor = {
	uuid: materialCallForUuid,
	recipeUuid,
	usageUuid: materialUsage.uuid,
	location: {
		uuid: 'material-location',
		callForUuid: materialCallForUuid,
		x: 400,
		y: 200
	}
};

const radiusInputParameter: Parameter<FlavorType.Number> = {
	uuid: 'radius-input-parameter',
	recipeUuid,
	flavorUuid: radiusInputFlavor.uuid,
	usageUuid: mainUsage.uuid,
	payload: {
		type: FlavorType.Number,
		value: 1
	}
};

// const asd: FlavorMap<PrepType.addToScene> = {};
export const defaultRecipe: FullRecipe = {
	uuid: recipeUuid,
	mainCallForUuid: mainCallFor.uuid,
	ingredients: [mainIngredient, meshIngredient, sphereIngredient, materialIngredient],
	callsFor: [mainCallFor, meshCallFor, sphereCallFor, materialCallFor],
	parameters: [radiusInputParameter],
	shaders: []
};
