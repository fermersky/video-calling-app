<script>
  export let show = false;
</script>

<style>
  .critical-toast {
    padding: 5px 10px;
    background-color: tomato;
    color: #fff;
    border-radius: 10px;
    margin: 10px;
    transition: 0.3s opacity;
    opacity: 0;
  }

  .show {
    opacity: 1;
  }
</style>

<div class:show class="critical-toast">
  <span><slot /></span>
</div>
