export const mediaStreamErrorMsg = (exception) => {
  switch (exception) {
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Cannot capture video from your camera. Check your camera is plugged in and reload the page.';

    case 'NotReadableError':
    case 'TrackStartError':
      return 'Your camera may be used by another app.';

    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Your browser denies capturing video from your camera.';

    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'Something went wrong with constraints.';

    default:
      return 'Something went wrong.';
  }
};
