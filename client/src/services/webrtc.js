import { iceServers } from '../ice-servers';

export const streamTypeToSocketEvents = (mode) => {
  switch (mode) {
    case 'video-call':
      return {
        offer: 'video-offer',
        answer: 'video-answer',
        iceCandidate: 'ice-candidate',
      };

    case 'screenshare':
      return {
        offer: 'video-screen-sharing-offer',
        answer: 'video-screen-sharing-answer',
        iceCandidate: 'ice-screen-sharing-candidate',
      };
  }
};

export const stopTracks = (stream) => {
  if (!stream) return;

  stream.getTracks().map((track) => track.stop());
  stream = null;
};

export const attachStreamToVideoElement = (id, stream) => {
  const video = document.getElementById(id);

  if (video && stream) {
    video.srcObject = stream;
    return;
  }

  console.warn('html id or stream is undefined');
};

export const createPeer = () => new RTCPeerConnection({ iceServers: iceServers });

export const detachStreamFromVideoElement = (id) => {
  const video = document.getElementById(id);

  video.srcObject = null;
  video.removeAttribute('srcObject');
};

export const addTracksToPeer = (peer, stream) => {
  stream.getTracks().map((track) => {
    peer.addTrack(track, stream);
  });
};

export const replaceTrackForPeer = (peer, stream, kind) => {
  const track = stream.getTracks().find((t) => t.kind === kind);
  const sender = peer.getSenders().find((s) => s.track.kind === kind);

  sender.replaceTrack(track);

  return track;
};

export const closePeerConnection = (peer) => {
  if (!peer) {
    return;
  }

  peer.ontrack = null;
  peer.onremovetrack = null;
  peer.onremovestream = null;
  peer.onicecandidate = null;
  peer.oniceconnectionstatechange = null;
  peer.onsignalingstatechange = null;
  peer.onicegatheringstatechange = null;
  peer.onnegotiationneeded = null;

  peer.close();
  peer = null;
};
