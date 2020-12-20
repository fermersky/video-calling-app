<script>
  import { criticalErrorSubject } from './../stores.js';
  import CriticalToast from './CriticalToast.svelte';

  let errors = [];

  const _onErrorOccured = (er) => {
    if (!er) {
      return;
    }

    errors = [...errors, { text: er, status: 'visible' }];

    setTimeout(() => {
      errors = errors.map((e) => {
        if (e.text === er) {
          return { text: er, status: 'hidden' };
        }

        return e;
      });
    }, 3500);

    setTimeout(() => {
      _unshiftError();
      criticalErrorSubject.set('');
    }, 4000);
  };

  const _unshiftError = () => {
    errors.shift();
    errors = errors;
  };

  criticalErrorSubject.subscribe(_onErrorOccured);
</script>

<style>
  .critical-container {
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: flex-end;
    padding: 40px;
  }
</style>

<div class="critical-container">
  {#each errors as error}
    <CriticalToast show={error.status === 'visible'}>{error.text}</CriticalToast>
  {/each}
</div>
