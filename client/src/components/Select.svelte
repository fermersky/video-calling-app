<script>
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher();

	export let items = [];
	export let title = "<label of select>";
	export let key;
	export let value;
	export let defaultValue;

	function handleChange(e) {
		dispatch("onSelect", e.target.value);
	}
</script>

<style>
	div {
		padding: 10px;
		width: 100%;
	}

	select {
		background: #555;
		color: #eee;
		padding: 5px;
		border: none;
		outline: none;
		width: 100%;
	}
</style>

{#if items.length > 0}
	<div>
		<h4>{title}</h4>
		<!-- svelte-ignore a11y-no-onchange -->
		<select on:change={handleChange}>
			{#each items as item}
				<option selected={item[key] === defaultValue} value={item[key]}>{item[value]}</option>
			{/each}
		</select>
	</div>
{/if}
