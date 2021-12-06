<script lang=ts>
    import { createEventDispatcher, onMount } from "svelte";
    import TerminalRack from "./terminal-rack.svelte";
    import type { TerminalModel } from "./models/terminal";
    import { TerminalDirection } from "../terminal";
    import { Pane } from "tweakpane";

    export let height: number;
    export let width: number;

    const dispatch = createEventDispatcher();

    let container: HTMLElement;

    let widthIn: HTMLElement;
    let widthOut: HTMLElement;
    let heightIn: HTMLElement;
    let heightOut: HTMLElement;

    function change() {
        dispatch("change", { height, width });
    }

    onMount(() => {
        let pane = new Pane({ container: container });

        const params = {
            width: width,
            height: height,
        };

        let widthInput = pane
            .addInput(params, "width", {
                step: 1,
            })
            .on("change", (ev) => {
                width = ev.value;
                change();
            });

        widthInput.controller_.view.element.appendChild(widthIn);
        widthInput.controller_.view.element.appendChild(widthOut);

        let heightInput = pane
            .addInput(params, "height", {
                step: 1,
            })
            .on("change", (ev) => {
                height = ev.value;
                change();
            });

        heightInput.controller_.view.element.appendChild(heightIn);
        heightInput.controller_.view.element.appendChild(heightOut);
    });
</script>

<div bind:this={container} />

<TerminalRack bind:container={widthIn} direction={TerminalDirection.in} />
<TerminalRack bind:container={widthOut} direction={TerminalDirection.out} />
<TerminalRack bind:container={heightIn} direction={TerminalDirection.in} />
<TerminalRack bind:container={heightOut} direction={TerminalDirection.out} />
