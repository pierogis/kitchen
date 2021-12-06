<script lang=ts>
    import TerminalRack from "./terminal-rack.svelte";
    import type { TerminalModel } from "./models/terminal";
    import { TerminalDirection } from "../terminal";

    export let direction: TerminalDirection;
    export let expanded: boolean;
    export let selected: boolean;

    import { Readable, readable } from 'svelte/store';

    export let terminalRacks: Readable<TerminalRackModel[]> = readable([]);
</script>

<div class="terminal-rack" class:expanded class:selected>
    <TerminalRack
        direction={TerminalDirection.in}
        expanded={false}
        selected={false}
    />
    <TerminalRack
        direction={TerminalDirection.out}
        expanded={false}
        selected={false}
    />
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
