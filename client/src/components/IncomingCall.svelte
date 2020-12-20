<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let username;

  function handleAcceptCall() {
    dispatch('onAccept');
  }

  function handleDropCall() {
    dispatch('onDrop');
  }
</script>

<style>
  @keyframes blinking {
    0% {
      box-shadow: none;
    }
    50% {
      box-shadow: 0 0 44px -11px #4caf4fa1;
    }
    100% {
      box-shadow: none;
    }
  }

  @keyframes shaking {
    0% {
      transform: none;
    }
    30% {
      transform: rotate(-10deg);
    }

    40% {
      transform: rotate(10deg);
    }
    50% {
      transform: rotate(-10deg);
    }
    60% {
      transform: rotate(10deg);
    }
    70% {
      transform: rotate(-10deg);
    }

    100% {
      transform: none;
    }
  }

  .incoming-wrap {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    backdrop-filter: blur(10px);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .username-label {
    padding: 20px;
  }

  .incoming {
    border-radius: 20px;
    padding: 40px;
    background-color: #202020;
    color: #eee;

    display: flex;
    flex-direction: column;
    animation: blinking 2s ease-in-out infinite;
    border: 3px solid rgb(22, 22, 22);
  }

  .accept-call-container {
    height: 35px;
    border-radius: 20px;
    background: linear-gradient(to left, #202020, #4caf50);
    box-shadow: 0 0 10px #0e0e0e;

    margin: 10px 0;
  }

  .drop-call-container {
    height: 35px;
    border-radius: 20px;
    background: linear-gradient(to left, #f44336, #202020);
    box-shadow: 0 0 10px #0e0e0e;

    margin: 10px 0;
  }

  .accept-call-container button {
    outline: none;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    background-color: #4caf50;
    color: #fff;
    box-shadow: 0 0 5px #202020;
    animation: shaking 1.3s ease infinite;
  }

  .drop-call-container button {
    outline: none;
    border: none;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    background-color: #f44336;
    color: #fff;
    box-shadow: 0 0 5px #202020;
    transform: rotate(-135deg);
    float: right;
  }

  h3 {
    color: #eee;
  }
</style>

<div class="incoming-wrap">
  <div class="incoming">
    <h3 class="username-label"><b>{username}</b> is calling you</h3>
    <div class="accept-call-container">
      <button on:click={handleAcceptCall}> <i class="fas fa-phone-volume" /> </button>
    </div>
    <div class="drop-call-container"><button on:click={handleDropCall}><i class="fas fa-phone" /></button></div>
  </div>
</div>
