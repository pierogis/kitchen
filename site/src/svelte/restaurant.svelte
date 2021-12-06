<script lang=ts>
    import { writable } from "svelte/store";
    import PlateControl from "./plate-control.svelte";
    let connections = writable();

    let viewportHeight = window.innerHeight;
    let viewportWidth = window.innerWidth;

    function changeViewport() {
        
    }
</script>

<canvas height={window.innerHeight} width={window.innerWidth} />
<PlateControl height="{window.innerHeight}" width="{window.innerWidth}" on:change={changeViewport}></PlateControl>
