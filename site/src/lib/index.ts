let onscroll = () => {
	window.scrollTo(0, 0);
};

window.onscroll = onscroll;

import Dish from './Dish.svelte';

const dish = new Dish({
	target: document.body
});
