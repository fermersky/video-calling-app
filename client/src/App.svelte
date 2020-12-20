<script>
  import CriticalToastContainer from './components/CriticalToastContainer.svelte';
  import { copy } from './services/copy.js';
  import Button from './components/Button.svelte';
  import { deviceSelectorPopupSubject, userInfoSubject, criticalErrorSubject } from './stores.js';
  import DeviceSettingsModal from './components/DeviceSettingsModal.svelte';
  import { on, emit } from './services/socket.service';
  import { fetchUserDetails, saveUserDetails } from './services/local-storage';
  import { onMount } from 'svelte';
  import Emoji from './components/Emoji.svelte';
  import Splitter from './components/Splitter.svelte';

  let showDeviceSettingsPopup;
  let username;
  let joined = false;
  let uid;
  let participantUid;
  let copyText = 'Click to copy';

  $: callButtonDisabled = !(participantUid && participantUid.length === 4);

  onMount(() => {
    const user = fetchUserDetails();
    userInfoSubject.update(() => user);
  });

  const handleWelcome = (data) => {
    joined = true;
    userInfoSubject.update((_) => data);
    uid = data.uid;
    saveUserDetails(data);
  };

  const handleIncomingCall = (data) => {
    console.warn('you have a call from ', data);
  };

  on('welcome', handleWelcome);
  on('incoming-call', handleIncomingCall);
  on('user-is-not-joined', () => {
    criticalErrorSubject.update((_) => 'User is not joined yet or identifier is not correct.');
  });

  userInfoSubject.subscribe((val) => (username = val?.name));

  deviceSelectorPopupSubject.subscribe((val) => {
    showDeviceSettingsPopup = val;
  });

  function toggleDevicesSettingsPopup() {
    deviceSelectorPopupSubject.update((value) => !value);
  }

  function handleJoin(e) {
    emit('join', username);
  }

  function handleStartCall() {
    emit('try-call', { username, participantUid });
  }

  function handleUidClick() {
    copyText = 'Copied';
    copy(uid);
  }
</script>

<style>
  main {
    margin: 0 auto;
    position: relative;
    height: 100vh;
    text-align: center;
    padding: 40px;
  }

  .open-settings-btn {
    position: absolute;
    top: 34px;
    right: 50px;
    color: #fff;
    width: 30px;
    height: 30px;
    color: #fde931;
    cursor: pointer;
    z-index: 2;
    font-size: 20px;
  }

  #name-input {
    background-color: #555;
    border: none;
    outline: none;
    box-shadow: 5px 5px 10px #000;
    padding: 10px 20px;
    border-radius: 10px;
    color: #eee;
    margin: 20px 0;
    font-size: 1.4rem;
    width: 300px;
  }

  .join-form {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  @media only screen and (max-width: 600px) {
    .join-form {
      flex-direction: column;
    }

    .open-settings-btn {
      left: 50%;
      transform: translateX(-50%);
    }

    h1 {
      margin-top: 100px;
    }
  }

  .uid-label {
    background: rgb(27, 27, 27);
    display: inline-block;
    padding: 20px;
    border-radius: 10px;
    font-size: 3rem;
    margin: 40px;
    box-shadow: 0 0 10px #000;
    position: relative;
  }

  .uid-label span {
    position: absolute;
    font-size: 0.9rem;
    color: #ccc;
    font-weight: bold;
    cursor: pointer;
    padding: 5px 7px;
    background-color: rgb(24, 24, 24);
    border-radius: 5px;
    top: 35px;
    width: 110px;
    right: -140px;
    box-shadow: 0 0 10px #000;
    transition: 0.1s cubic-bezier(0.55, 0.055, 0.675, 0.19);
  }

  .uid-label span:active {
    transform: scale(0.9);
  }

  .uid-label span::before {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 15px 15px 15px 0;
    border-color: transparent rgb(24, 24, 24) transparent transparent;
    content: '';
    display: block;
    top: 50%;
    transform: translateY(-50%);
    left: -12px;
  }
</style>

<main>
  <h1>
    So
    <Emoji>🤙</Emoji>
    me maybe!
  </h1>

  <Splitter />

  {#if !joined}
    <div class="join-form">
      <h2 style="margin: 20px;">Who are you?</h2>
      <form on:submit|preventDefault={handleJoin}>
        <input bind:value={username} type="text" id="name-input" placeholder="What is your name, hero?" />
        <Button type="submit" disabled={!username}>Join</Button>
      </form>
    </div>
  {:else}
    <div style="margin: 20px;">
      <h2>Your identifier is</h2>
      <h3 class="uid-label">{uid} <span on:click={handleUidClick}>{copyText}</span></h3>
      <h3>Send it to the one who wanna call you and you will get in touch</h3>
      <Splitter />

      <h3>or enter identifier shared with you below</h3>

      <form on:submit|preventDefault={handleStartCall}>
        <input bind:value={participantUid} type="text" id="name-input" placeholder="XYZZ" />
        <Button type="submit" disabled={callButtonDisabled}>Call</Button>
      </form>
    </div>
  {/if}

  <span on:click={toggleDevicesSettingsPopup} class="open-settings-btn">
    {#if showDeviceSettingsPopup}<i class="fas fa-times" />{:else}<i class="fas fa-cog" />{/if}
  </span>
</main>

{#if showDeviceSettingsPopup}
  <DeviceSettingsModal />
{/if}

<CriticalToastContainer />
