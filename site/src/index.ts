let onscroll = () => {
  window.scrollTo(0, 0);
};

window.onscroll = onscroll;

import Restaurant from "./restaurant.svelte";

const restaurant = new Restaurant({
  target: document.body,
});
