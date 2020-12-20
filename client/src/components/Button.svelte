<script>
  import { createEventDispatcher } from 'svelte';

  export let type = 'button';

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('onClick');
  }
</script>

<style>
  button {
    border-radius: 5px;
    background: #fde931;
    font-weight: bold;
    padding: 7px 15px;
    cursor: pointer;
    /* border: 3px solid #648f00; */
    text-transform: uppercase;
    margin: 10px;
    box-shadow: 5px 5px 10px #000;
  }

  button[disabled] {
    cursor: not-allowed;
    box-shadow: none;
  }
</style>

<button {...$$props} {type} on:click={handleClick}><slot /></button>
