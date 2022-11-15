const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

startButton.addEventListener("click", start);
callButton.addEventListener("click", call);
hangupButton.addEventListener("click", hangup);

callButton.disabled = true;
hangupButton.disabled = true;
let startTime;

let localStream;
let pc1;
let pc2;
const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

function getName(pc) {
  return pc === pc1 ? "pc1" : "pc2";
}

function getOtherPc(pc) {
  return pc === pc1 ? pc2 : pc1;
}

async function start() {
  startButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always",
        height: 700,
        width: 1200,
      },
      audio: false,
    });
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e.name}`);
  }
}

async function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  startTime = window.performance.now();
 
  const configuration = {};
  pc1 = new RTCPeerConnection(configuration);
  pc1.addEventListener("icecandidate", (e) => onIceCandidate(pc1, e));
  pc2 = new RTCPeerConnection(configuration);
  pc2.addEventListener("icecandidate", (e) => onIceCandidate(pc2, e));

  pc2.addEventListener("track", gotRemoteStream);

  localStream.getTracks().forEach((track) => pc1.addTrack(track, localStream));

  try {
    const offer = await pc1.createOffer(offerOptions);
    await onCreateOfferSuccess(offer);
  } catch (e) {
    console.log(e);
  }
}

async function onCreateOfferSuccess(desc) {
  try {
    await pc1.setLocalDescription(desc);
  } catch (e) {
    console.log(e);
  }

  try {
    await pc2.setRemoteDescription(desc);
  } catch (e) {
    console.log(e);
  }

  try {
    const answer = await pc2.createAnswer();
    await onCreateAnswerSuccess(answer);
  } catch (e) {
    console.log(e);
  }
}

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
  }
}

async function onCreateAnswerSuccess(desc) {
  try {
    await pc2.setLocalDescription(desc);
  } catch (e) {
    console.log(e);
  }
  try {
    await pc1.setRemoteDescription(desc);
  } catch (e) {
    console.log(e);
  }
}

async function onIceCandidate(pc, event) {
  try {
    await getOtherPc(pc).addIceCandidate(event.candidate);
  } catch (e) {
    // onAddIceCandidateError(pc, e);
  }
}

function hangup() {
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  remoteVideo.srcObject = null
  hangupButton.disabled = true;
  callButton.disabled = false;
}
