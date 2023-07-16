<script lang="ts">
	import { onMount, setContext } from 'svelte';

	import type { PageData } from './$types';

	import { storeRecipe } from '$state';
	import { recipeStateContextKey } from '$recipe';
	import { readableViewState, viewStateContextKey } from '$view';

	import Pan from '$components/Pan.svelte';
	import Recipe from '$components/Recipe.svelte';
	import { Menu } from '$components/menu';
	import { HelpModal } from '$components/modals';

	export let data: PageData;
	const { recipe } = data;

	let innerWidth: number, innerHeight: number;

	const recipeState = storeRecipe(recipe);
	const viewState = readableViewState(recipeState);

	setContext(recipeStateContextKey, recipeState);
	setContext(viewStateContextKey, viewState);

	const showHelp = viewState.showHelp;

	const handleMouseMove = (ev: MouseEvent) => {
		viewState.cursor.coordinates.set({ x: ev.clientX, y: ev.clientY });
	};

	function handleResize() {
		viewState.windowSize.set({ width: innerWidth, height: innerHeight });
	}

	onMount(() => {
		window.addEventListener('resize', handleResize);
		handleResize();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:window
	bind:innerWidth
	bind:innerHeight
	on:scroll|preventDefault={() => {}}
	on:mousemove={handleMouseMove}
/>

<svelte:head>
	<title>kitchen</title>
</svelte:head>

<Menu />

<Recipe width={innerWidth} height={innerHeight} {recipeState} {viewState} />

<Pan width={innerWidth} height={innerHeight} {recipeState} {viewState} />

{#if $showHelp}
	<HelpModal />
{/if}
