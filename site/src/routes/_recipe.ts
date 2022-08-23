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
const sphereMeshIngredientUuid = 'sphere-mesh-ingredient';
const sphereIngredientUuid = 'sphere-ingredient';
const sphereMaterialIngredientUuid = 'material-ingredient';
const boxIngredientUuid = 'box-ingredient';

// preps

const platePrepUuid = 'plate-prep';

const platePrepFlavor: Flavor = {
	uuid: 'plate-prep-flavor',
	ingredientUuid: mainIngredientUuid,
	name: 'plate',
	type: FlavorType.Object,
	prepUuid: platePrepUuid,
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

const platePrep: Prep<PrepType.Plate> = {
	uuid: platePrepUuid,
	name: 'plate',
	ingredientUuid: mainIngredientUuid,
	type: PrepType.Plate,
	direction: Direction.Out,
	inFlavorUuidMap: { object: platePrepFlavor.uuid },
	outFlavorUuidMap: { plate: platePrepFlavor.uuid }
};

const sphereMeshPrepUuid = 'spehre-mesh-prep';

const sphereMeshRadiusInputFlavor: Flavor = {
	uuid: 'sphere-mesh-radius-input-flavor',
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'radius',
	type: FlavorType.Number,
	prepUuid: undefined,
	directions: [Direction.In],
	options: null
};

const sphereMeshColorInputFlavor: Flavor = {
	uuid: 'sphere-mesh-color-input-flavor',
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	prepUuid: undefined,
	directions: [Direction.In],
	options: null
};

const sphereMeshPrepFlavor = {
	uuid: 'sphere-mesh-prep-flavor',
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'mesh',
	type: FlavorType.Object,
	prepUuid: sphereMeshPrepUuid,
	directions: [Direction.Out],
	options: null
};

const geometryPrepFlavor = {
	uuid: 'sphere-geometry-prep-flavor',
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'geometry',
	type: FlavorType.Geometry,
	prepUuid: sphereMeshPrepUuid,
	directions: [Direction.In],
	options: null
};

const meshMaterialPrepFlavor = {
	uuid: 'sphere-mesh-material-prep-flavor',
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	prepUuid: sphereMeshPrepUuid,
	directions: [Direction.In],
	options: null
};

const meshPrep: Prep<PrepType.Mesh> = {
	uuid: sphereMeshPrepUuid,
	ingredientUuid: sphereMeshIngredientUuid,
	name: 'sphere',
	type: PrepType.Mesh,
	direction: Direction.Out,
	inFlavorUuidMap: {
		material: meshMaterialPrepFlavor.uuid,
		geometry: geometryPrepFlavor.uuid
	},
	outFlavorUuidMap: {
		mesh: sphereMeshPrepFlavor.uuid
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

const sphereMaterialPrepUuid = 'sphere-material-prep';

const sphereMaterialPrepFlavor = {
	uuid: 'sphere-material-prep-flavor',
	ingredientUuid: sphereMaterialIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	prepUuid: sphereMaterialPrepUuid,
	directions: [Direction.Out],
	options: null
};

const sphereMaterialColorPrepFlavor = {
	uuid: 'sphere-material-color-prep-flavor',
	ingredientUuid: sphereMaterialIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	prepUuid: sphereMaterialPrepUuid,
	directions: [Direction.In],
	options: null
};

const sphereColorMaterialFlavor = {
	uuid: 'color-material-flavor',
	ingredientUuid: sphereMaterialIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	directions: [Direction.In],
	options: null
};

const sphereMaterialPrep: Prep<PrepType.Material> = {
	uuid: sphereMaterialPrepUuid,
	ingredientUuid: sphereMaterialIngredientUuid,
	name: 'material',
	type: PrepType.Material,
	direction: Direction.Out,
	inFlavorUuidMap: { color: sphereMaterialColorPrepFlavor.uuid },
	outFlavorUuidMap: { material: sphereMaterialPrepFlavor.uuid }
};

//box

const boxGeometryPrepUuid = 'box-geometry-prep';

const boxGeometryFlavor = {
	uuid: 'box-geometry-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'box',
	type: FlavorType.Geometry,
	directions: [Direction.Out],
	prepUuid: boxGeometryPrepUuid,
	options: null
};

const boxXFlavor = {
	uuid: 'x-box-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'x',
	type: FlavorType.Number,

	directions: [Direction.In],
	prepUuid: boxGeometryPrepUuid,
	options: null
};

const boxYFlavor = {
	uuid: 'y-box-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'y',
	type: FlavorType.Number,

	directions: [Direction.In],
	prepUuid: boxGeometryPrepUuid,
	options: null
};

const boxZFlavor = {
	uuid: 'z-box-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'z',
	type: FlavorType.Number,
	directions: [Direction.In],
	prepUuid: boxGeometryPrepUuid,
	options: null
};

const boxGeometryPrep: Prep<PrepType.Box> = {
	uuid: boxGeometryPrepUuid,
	ingredientUuid: boxIngredientUuid,
	name: 'box',
	type: PrepType.Box,
	direction: Direction.In,
	inFlavorUuidMap: { x: boxXFlavor.uuid, y: boxYFlavor.uuid, z: boxZFlavor.uuid },
	outFlavorUuidMap: { box: boxGeometryFlavor.uuid }
};

const boxMaterialPrepUuid = 'box-material-prep';

const boxColorFlavor = {
	uuid: 'box-color-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'color',
	type: FlavorType.Color,
	prepUuid: boxMaterialPrepUuid,
	directions: [Direction.In],
	options: null
};

const boxMaterialFlavor = {
	uuid: 'box-material-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	directions: [Direction.Out],
	prepUuid: boxMaterialPrepUuid,
	options: null
};

const boxMaterialPrep: Prep<PrepType.Material> = {
	uuid: boxMaterialPrepUuid,
	ingredientUuid: boxIngredientUuid,
	name: 'box',
	type: PrepType.Material,
	direction: Direction.In,
	inFlavorUuidMap: { color: boxColorFlavor.uuid },
	outFlavorUuidMap: { material: boxMaterialFlavor.uuid }
};

const boxMeshPrepUuid = 'box-mesh-prep';

const boxMeshGeometryFlavor = {
	uuid: 'box-mesh-geometry-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'geometry',
	type: FlavorType.Geometry,
	directions: [Direction.In],
	prepUuid: boxMeshPrepUuid,
	options: null
};

const boxMeshMaterialFlavor = {
	uuid: 'box-mesh-material-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'material',
	type: FlavorType.Material,
	directions: [Direction.In],
	prepUuid: boxMeshPrepUuid,
	options: null
};

const boxMeshFlavor = {
	uuid: 'box-mesh-flavor',
	ingredientUuid: boxIngredientUuid,
	name: 'mesh',
	type: FlavorType.Object,
	directions: [Direction.Out],
	prepUuid: boxMeshPrepUuid,
	options: null
};

const boxMeshPrep: Prep<PrepType.Mesh> = {
	uuid: boxMeshPrepUuid,
	ingredientUuid: boxIngredientUuid,
	name: 'box',
	type: PrepType.Mesh,
	direction: Direction.Out,
	inFlavorUuidMap: { geometry: boxMeshGeometryFlavor.uuid, material: boxMeshMaterialFlavor.uuid },
	outFlavorUuidMap: { mesh: boxMeshFlavor.uuid }
};

// usages and ingredients
const mainUsage: Usage = {
	uuid: 'main-usage',
	ingredientUuid: mainIngredientUuid,
	parentUsageUuid: undefined
};

const sphereMeshUsage: Usage = {
	uuid: 'sphere-mesh-usage',
	ingredientUuid: sphereMeshIngredientUuid,
	parentUsageUuid: mainUsage.uuid
};

const sphereMaterialUsage: Usage = {
	uuid: 'sphere-material-usage',
	ingredientUuid: sphereMaterialIngredientUuid,
	parentUsageUuid: sphereMeshUsage.uuid
};

const sphereUsage: Usage = {
	uuid: 'sphere-usage',
	ingredientUuid: sphereIngredientUuid,
	parentUsageUuid: sphereMeshUsage.uuid
};

const boxUsage: Usage = {
	uuid: 'box-usage',
	ingredientUuid: boxIngredientUuid,
	parentUsageUuid: mainUsage.uuid
};

const mainIngredient: FullIngredient = {
	uuid: mainIngredientUuid,
	parentIngredientUuid: undefined,
	name: 'sort',
	flavors: [platePrepFlavor, radiusInputFlavor, colorInputFlavor],
	connections: [
		{
			uuid: 'main-mesh-plate-connection',
			flavorType: FlavorType.Object,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: platePrepFlavor.uuid,
			outFlavorUuid: sphereMeshPrepFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: sphereMeshUsage.uuid
		},
		{
			uuid: 'main-radius-connection',
			flavorType: FlavorType.Number,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: sphereMeshRadiusInputFlavor.uuid,
			outFlavorUuid: radiusInputFlavor.uuid,
			inUsageUuid: sphereMeshUsage.uuid,
			outUsageUuid: undefined
		},
		{
			uuid: 'main-sphere-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: sphereMeshColorInputFlavor.uuid,
			inUsageUuid: sphereMeshUsage.uuid,
			outFlavorUuid: colorInputFlavor.uuid,
			outUsageUuid: undefined
		},
		{
			uuid: 'main-box-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: mainIngredientUuid,
			inFlavorUuid: boxColorFlavor.uuid,
			inUsageUuid: boxUsage.uuid,
			outFlavorUuid: colorInputFlavor.uuid,
			outUsageUuid: undefined
		}
	],
	usages: [mainUsage],
	preps: [platePrep]
};

const meshIngredient: FullIngredient = {
	uuid: sphereMeshIngredientUuid,
	parentIngredientUuid: mainIngredient.uuid,
	name: 'mesh',
	flavors: [
		sphereMeshPrepFlavor,
		meshMaterialPrepFlavor,
		geometryPrepFlavor,
		sphereMeshRadiusInputFlavor,
		sphereMeshColorInputFlavor
	],
	connections: [
		{
			uuid: 'mesh-geometry-connection',
			flavorType: FlavorType.Geometry,
			parentIngredientUuid: sphereMeshIngredientUuid,
			outFlavorUuid: spherePrepFlavor.uuid,
			outUsageUuid: sphereUsage.uuid,
			inFlavorUuid: geometryPrepFlavor.uuid,
			inUsageUuid: undefined
		},
		{
			uuid: 'mesh-material-connection',
			flavorType: FlavorType.Material,
			parentIngredientUuid: sphereMeshIngredientUuid,
			outFlavorUuid: sphereMaterialPrepFlavor.uuid,
			outUsageUuid: sphereMaterialUsage.uuid,
			inFlavorUuid: meshMaterialPrepFlavor.uuid,
			inUsageUuid: undefined
		},
		{
			uuid: 'mesh-radius-connection',
			flavorType: FlavorType.Number,
			parentIngredientUuid: sphereMeshIngredientUuid,
			outFlavorUuid: sphereMeshRadiusInputFlavor.uuid,
			outUsageUuid: undefined,
			inFlavorUuid: radiusSphereFlavor.uuid,
			inUsageUuid: sphereUsage.uuid
		},
		{
			uuid: 'mesh-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: sphereMeshIngredientUuid,
			outFlavorUuid: sphereMeshColorInputFlavor.uuid,
			outUsageUuid: undefined,
			inFlavorUuid: sphereColorMaterialFlavor.uuid,
			inUsageUuid: sphereMaterialUsage.uuid
		}
	],
	usages: [sphereMeshUsage],
	preps: [meshPrep]
};

const materialIngredient: FullIngredient = {
	uuid: sphereMaterialIngredientUuid,
	parentIngredientUuid: meshIngredient.uuid,
	name: 'material',
	flavors: [sphereMaterialPrepFlavor, sphereMaterialColorPrepFlavor, sphereColorMaterialFlavor],
	connections: [
		{
			uuid: 'material-color-connection',
			flavorType: FlavorType.Color,
			parentIngredientUuid: sphereMaterialIngredientUuid,
			inFlavorUuid: sphereMaterialColorPrepFlavor.uuid,
			outFlavorUuid: sphereColorMaterialFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: undefined
		}
	],
	usages: [sphereMaterialUsage],
	preps: [sphereMaterialPrep]
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

const boxIngredient: FullIngredient = {
	uuid: boxIngredientUuid,
	parentIngredientUuid: mainIngredient.uuid,
	name: 'box',
	flavors: [
		boxXFlavor,
		boxYFlavor,
		boxZFlavor,
		boxGeometryFlavor,
		boxColorFlavor,
		boxMaterialFlavor,
		boxMeshGeometryFlavor,
		boxMeshMaterialFlavor,
		boxMeshFlavor
	],
	connections: [
		{
			uuid: 'box-geometry-connection',
			flavorType: FlavorType.Geometry,
			parentIngredientUuid: boxIngredientUuid,
			inFlavorUuid: boxMeshGeometryFlavor.uuid,
			outFlavorUuid: boxGeometryFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: undefined
		},
		{
			uuid: 'box-material-connection',
			flavorType: FlavorType.Material,
			parentIngredientUuid: boxIngredientUuid,
			inFlavorUuid: boxMeshMaterialFlavor.uuid,
			outFlavorUuid: boxMaterialFlavor.uuid,
			inUsageUuid: undefined,
			outUsageUuid: undefined
		}
	],
	usages: [boxUsage],
	preps: [boxGeometryPrep, boxMaterialPrep, boxMeshPrep]
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
	usageUuid: sphereMeshUsage.uuid,
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
	usageUuid: sphereMaterialUsage.uuid,
	location: {
		uuid: 'material-location',
		callForUuid: materialCallForUuid,
		x: 400,
		y: 200
	}
};

const boxCallForUuid = 'box-callFor';
const boxCallFor: FullCallFor = {
	uuid: boxCallForUuid,
	recipeUuid,
	usageUuid: boxUsage.uuid,
	location: {
		uuid: 'box-location',
		callForUuid: boxCallForUuid,
		x: 500,
		y: 600
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

const colorInputParameter: Parameter<FlavorType.Color> = {
	uuid: 'color-input-parameter',
	recipeUuid,
	flavorUuid: colorInputFlavor.uuid,
	usageUuid: mainUsage.uuid,
	payload: {
		type: FlavorType.Color,
		value: '#ffffff'
	}
};

const boxXParameter: Parameter<FlavorType.Number> = {
	uuid: 'box-x-parameter',
	recipeUuid,
	flavorUuid: boxXFlavor.uuid,
	usageUuid: boxUsage.uuid,
	payload: {
		type: FlavorType.Number,
		value: 1
	}
};

const boxYParameter: Parameter<FlavorType.Number> = {
	uuid: 'box-y-parameter',
	recipeUuid,
	flavorUuid: boxYFlavor.uuid,
	usageUuid: boxUsage.uuid,
	payload: {
		type: FlavorType.Number,
		value: 1
	}
};

const boxZParameter: Parameter<FlavorType.Number> = {
	uuid: 'box-z-parameter',
	recipeUuid,
	flavorUuid: boxZFlavor.uuid,
	usageUuid: boxUsage.uuid,
	payload: {
		type: FlavorType.Number,
		value: 1
	}
};

// const asd: FlavorMap<PrepType.addToScene> = {};
export const defaultRecipe: FullRecipe = {
	uuid: recipeUuid,
	mainCallForUuid: mainCallFor.uuid,
	ingredients: [
		mainIngredient,
		meshIngredient,
		sphereIngredient,
		materialIngredient,
		boxIngredient
	],
	callsFor: [mainCallFor, meshCallFor, sphereCallFor, materialCallFor, boxCallFor],
	parameters: [
		radiusInputParameter,
		colorInputParameter,
		boxXParameter,
		boxYParameter,
		boxZParameter
	],
	shaders: []
};
