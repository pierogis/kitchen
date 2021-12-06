<script lang=ts>
    import Terminal from "./terminal.svelte";
    import { TerminalDirection } from "../terminal";

    export let direction: TerminalDirection;
    let expanded: boolean;
    export let container: HTMLElement;
    let expandedLocked: boolean = false;

    // import { Writable, writable } from "svelte/store";

    // let terminals: Writable<TerminalModel[]> = writable([
    //     {
    //         expanded: false,
    //         selected: false,
    //     },
    // ]);

    let terminals = 1;

    const nearTerminalRackDistance = 8;
    let terminalGap = 4;
    let terminalWidth = 10;

    function checkNear(event) {
        if (!expandedLocked) {
            let rackRect = this.element.getBoundingClientRect();
            var left = rackRect.left - nearTerminalRackDistance;
            var top = rackRect.top - nearTerminalRackDistance;
            var right = rackRect.right + nearTerminalRackDistance;
            var bottom = rackRect.bottom + nearTerminalRackDistance;
            var x = event.pageX;
            var y = event.pageY;
            this.element.style.gap = terminalGap + "px";
            if (x > left && x < right && y > top && y < bottom) {
                expanded = true;
                let width =
                    terminalGap * (terminals + 1) + terminalWidth * terminals;
                switch (direction) {
                    case TerminalDirection.in: {
                        this.element.style.width = width + "px";
                        this.element.style.marginRight = -width + "px";
                        this.element.style.right =
                            width + terminalWidth - terminalGap + "px";
                        break;
                    }
                    case TerminalDirection.out: {
                        this.element.style.width = width + "px";
                        this.element.style.marginLeft = -width + "px";
                        this.element.style.left =
                            width + terminalWidth - terminalGap + "px";
                        break;
                    }
                }
            } else {
                expanded = false;
            }
        }
    }
</script>

<svelte:window on:mousemove={checkNear} />

<div bind:this={container} class="terminal-rack {direction}">
    {#each Array(terminals) as terminal}
        <Terminal {direction} {expanded} />
    {/each}
</div>

<style>
    .terminal-rack {
        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 6px 6px 6px 6px;
        background-color: var(--tp-base-background-color);
        box-shadow: 0 2px 4px var(--tp-base-shadow-color);

        position: relative;
        width: 4px;
        height: 20px;
        z-index: -3;
        transition: all 300ms;
    }

    .in {
        right: 10px;
        margin-right: -4px;
    }

    .out {
        left: 10px;
        margin-left: -4px;
    }
</style>
