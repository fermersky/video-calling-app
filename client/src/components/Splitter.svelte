<script>
</script>

<style>
  .split {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    color: #b3ff00;
    font-size: 3rem;
    position: relative;
    padding: 30px;

    width: 150px;
    margin: 0 auto;
  }

  .split:hover span {
    transform: rotate3d(0, 1, 0, 180deg);
  }

  span {
    transition: 0.8s cubic-bezier(0.075, 0.82, 0.165, 1);
    position: absolute;
  }
</style>

<div class="split"><span>☞☚</span></div>
