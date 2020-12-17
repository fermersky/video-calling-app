<script>
    import { createEventDispatcher } from "svelte";

    export let type = "button";

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("onClick");
    }
</script>

<style>
    button {
        border-radius: 5px;
        background: #b3ff00;
        font-weight: bold;
        padding: 5px 10px;
        cursor: pointer;
        border: 3px solid #648f00;
        text-transform: uppercase;
        margin: 10px;
    }
</style>

<button {type} on:click={handleClick}><slot /></button>
