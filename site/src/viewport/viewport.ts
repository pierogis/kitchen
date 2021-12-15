import { Writable, writable } from "svelte/store";

export interface ViewportState {
  width: number;
  height: number;
}

const initialState = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export const viewportStore: Writable<ViewportState> = writable(initialState);

export function changeViewport(state: ViewportState) {
  viewportStore.update(() => {
    return state;
  });
}
