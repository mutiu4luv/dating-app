import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import api from "../components/api/Api";

const VoiceCallContext = createContext({
  startVoiceCall: () => {},
  callState: "idle",
});

const socketUrl =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:7000";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const showIncomingCallNotification = async (data = {}) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const title = "Incoming voice call";
  const options = {
    body: `${data.callerName || "Someone"} is calling you`,
    icon: data.callerPhoto || "/vite.svg",
    badge: "/vite.svg",
    tag: `call-${data.callId}`,
    requireInteraction: true,
    vibrate: [500, 250, 500, 250, 500],
    data: {
      ...data,
      senderId: data.fromUserId,
      receiverId: data.toUserId,
    },
  };

  if ("serviceWorker" in navigator) {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 1200)),
    ]).catch(() => null);

    if (registration?.showNotification) {
      await registration.showNotification(title, options);
      return;
    }
  }

  new Notification(title, options);
};

export const useVoiceCall = () => useContext(VoiceCallContext);

export const VoiceCallProvider = ({ children }) => {
  const location = useLocation();
  const [callState, setCallState] = useState("idle");
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [speakerMessage, setSpeakerMessage] = useState("");
  const [callNotice, setCallNotice] = useState("");
  const [authUser, setAuthUser] = useState({
    id: localStorage.getItem("userId") || "",
    username:
      localStorage.getItem("username") || localStorage.getItem("name") || "User",
  });
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const currentPeerIdRef = useRef(null);
  const currentCallIdRef = useRef(null);
  const callStateRef = useRef("idle");
  const pendingIceCandidatesRef = useRef([]);
  const pendingIceByCallIdRef = useRef({});
  const ringtoneAudioContextRef = useRef(null);
  const ringtoneOscillatorRef = useRef(null);
  const ringtoneGainRef = useRef(null);
  const ringtoneTimerRef = useRef(null);
  const vibrationTimerRef = useRef(null);

  const currentUserId = authUser.id;
  const currentUsername = authUser.username;

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    const syncAuthUser = () => {
      setAuthUser({
        id: localStorage.getItem("userId") || "",
        username:
          localStorage.getItem("username") ||
          localStorage.getItem("name") ||
          "User",
      });
    };

    syncAuthUser();
    window.addEventListener("authChanged", syncAuthUser);
    window.addEventListener("storage", syncAuthUser);

    return () => {
      window.removeEventListener("authChanged", syncAuthUser);
      window.removeEventListener("storage", syncAuthUser);
    };
  }, []);

  const unlockRingtoneAudio = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!ringtoneAudioContextRef.current) {
        ringtoneAudioContextRef.current = new AudioContextClass();
      }

      ringtoneAudioContextRef.current.resume?.();
    } catch {
      // Some mobile browsers will only allow audio after a direct user gesture.
    }
  }, []);

  useEffect(() => {
    window.addEventListener("click", unlockRingtoneAudio, { once: true });
    window.addEventListener("touchstart", unlockRingtoneAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockRingtoneAudio);
      window.removeEventListener("touchstart", unlockRingtoneAudio);
    };
  }, [unlockRingtoneAudio]);

  useEffect(() => {
    setAuthUser({
      id: localStorage.getItem("userId") || "",
      username:
        localStorage.getItem("username") || localStorage.getItem("name") || "User",
    });
  }, [location.pathname]);

  const stopRingtone = useCallback(() => {
    window.clearInterval(ringtoneTimerRef.current);
    ringtoneTimerRef.current = null;

    try {
      ringtoneOscillatorRef.current?.stop();
      ringtoneOscillatorRef.current?.disconnect();
      ringtoneGainRef.current?.disconnect();
    } catch {
      // Oscillator may already be stopped.
    }

    ringtoneOscillatorRef.current = null;
    ringtoneGainRef.current = null;
    window.clearInterval(vibrationTimerRef.current);
    vibrationTimerRef.current = null;
    navigator.vibrate?.(0);
  }, []);

  const startRingtone = useCallback(() => {
    stopRingtone();

    const playTone = () => {
      try {
        unlockRingtoneAudio();
        const context = ringtoneAudioContextRef.current;
        if (!context) return;

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.15);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        ringtoneOscillatorRef.current = oscillator;
        ringtoneGainRef.current = gain;

        window.setTimeout(() => {
          try {
            oscillator.stop();
            oscillator.disconnect();
            gain.disconnect();
          } catch {
            // Ignore already-stopped oscillator.
          }
          if (ringtoneOscillatorRef.current === oscillator) {
            ringtoneOscillatorRef.current = null;
            ringtoneGainRef.current = null;
          }
        }, 1250);
      } catch {
        // Ringtone audio can be blocked by browser autoplay rules.
      }
    };

    playTone();
    ringtoneTimerRef.current = window.setInterval(playTone, 2200);

    try {
      unlockRingtoneAudio();
    } catch {
      // Ringtone audio can be blocked by browser autoplay rules.
    }

    navigator.vibrate?.([500, 250, 500]);
    vibrationTimerRef.current = window.setInterval(() => {
      navigator.vibrate?.([500, 250, 500]);
    }, 1800);
  }, [stopRingtone, unlockRingtoneAudio]);

  const cleanupCall = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    pendingIceCandidatesRef.current = [];
    pendingIceByCallIdRef.current = {};
    stopRingtone();
    currentPeerIdRef.current = null;
    currentCallIdRef.current = null;
    setCallStartedAt(null);
    setCallDuration(0);
    setIncomingOffer(null);
    setRemoteUser(null);
    setMuted(false);
    setSpeakerOn(false);
    setSpeakerMessage("");
    setErrorMessage("");
    setCallState("idle");
  }, [stopRingtone]);

  const markCallActive = useCallback(() => {
    setCallState("active");
    setCallStartedAt(Date.now());
    setCallDuration(0);
    stopRingtone();
  }, [stopRingtone]);

  useEffect(() => {
    if (callState !== "active" || !callStartedAt) return undefined;

    const updateDuration = () => {
      setCallDuration(Math.max(0, Math.floor((Date.now() - callStartedAt) / 1000)));
    };

    updateDuration();
    const timer = window.setInterval(updateDuration, 1000);
    return () => window.clearInterval(timer);
  }, [callStartedAt, callState]);

  const formatCallDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const flushPendingIceCandidates = async (callId = currentCallIdRef.current) => {
    if (!peerRef.current?.remoteDescription) return;

    const candidates = [
      ...pendingIceCandidatesRef.current,
      ...(callId ? pendingIceByCallIdRef.current[callId] || [] : []),
    ];
    pendingIceCandidatesRef.current = [];
    if (callId) {
      delete pendingIceByCallIdRef.current[callId];
    }

    for (const candidate of candidates) {
      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore stale candidates from a previous call state.
      }
    }
  };

  const createPeerConnection = useCallback(
    (peerUserId) => {
      const peer = new RTCPeerConnection(rtcConfig);

      peer.onicecandidate = (event) => {
        if (!event.candidate || !peerUserId || !currentUserId) return;
        socketRef.current?.emit("voice_call_ice_candidate", {
          callId: currentCallIdRef.current,
          fromUserId: currentUserId,
          toUserId: peerUserId,
          candidate: event.candidate,
        });
      };

      peer.ontrack = (event) => {
        if (!remoteAudioRef.current) return;

        const [remoteStream] = event.streams;
        if (remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
        } else {
          const fallbackStream =
            remoteAudioRef.current.srcObject instanceof MediaStream
              ? remoteAudioRef.current.srcObject
              : new MediaStream();
          fallbackStream.addTrack(event.track);
          remoteAudioRef.current.srcObject = fallbackStream;
        }

        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        remoteAudioRef.current.autoplay = true;
        remoteAudioRef.current.playsInline = true;
        remoteAudioRef.current.play().catch(() => {
          setSpeakerMessage(
            "Tap the call bar once if your browser is waiting for permission to play audio."
          );
        });
      };

      peer.onconnectionstatechange = () => {
        if (["failed", "closed", "disconnected"].includes(peer.connectionState)) {
          cleanupCall();
        }
      };

      peerRef.current = peer;
      return peer;
    },
    [cleanupCall, currentUserId]
  );

  const getMicrophoneStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    localStreamRef.current = stream;
    return stream;
  };

  const addLocalTracks = (peer, stream) => {
    stream.getAudioTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });
  };

  const startVoiceCall = useCallback(
    async ({ toUserId, username, name, photo }) => {
      if (!toUserId || !currentUserId || callState !== "idle") return;

      try {
        setErrorMessage("");
        setCallNotice("");

        const token = localStorage.getItem("token");
        await api.get(`/calls/can-start?receiverId=${toUserId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setCallState("outgoing");
        setRemoteUser({ _id: toUserId, username, name, photo });
        currentPeerIdRef.current = toUserId;
        currentCallIdRef.current = `${currentUserId}_${toUserId}_${Date.now()}`;

        const stream = await getMicrophoneStream();
        const peer = createPeerConnection(toUserId);
        addLocalTracks(peer, stream);

        const offer = await peer.createOffer({ offerToReceiveAudio: true });
        await peer.setLocalDescription(offer);

        socketRef.current?.emit("voice_call_offer", {
          callId: currentCallIdRef.current,
          fromUserId: currentUserId,
          toUserId,
          callerName: currentUsername,
          callerPhoto: localStorage.getItem("photo") || "",
          offer,
        });
      } catch (error) {
        const upgradeMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message;
        setErrorMessage(
          error?.name === "NotAllowedError"
            ? "Microphone access was blocked. Please allow microphone permission."
            : upgradeMessage || "Unable to start voice call."
        );
        setCallNotice(
          upgradeMessage ||
            "Upgrade to enjoy a better plan and continue making calls."
        );
        cleanupCall();
      }
    },
    [callState, cleanupCall, createPeerConnection, currentUserId, currentUsername]
  );

  const acceptIncomingCall = async () => {
    if (!incomingOffer || !currentUserId) return;

    try {
      stopRingtone();
      setErrorMessage("");
      currentPeerIdRef.current = incomingOffer.fromUserId;
      currentCallIdRef.current = incomingOffer.callId;

      const stream = await getMicrophoneStream();
      const peer = createPeerConnection(incomingOffer.fromUserId);
      addLocalTracks(peer, stream);

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingOffer.offer)
      );
      await flushPendingIceCandidates(incomingOffer.callId);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current?.emit("voice_call_answer", {
        callId: incomingOffer.callId,
        fromUserId: currentUserId,
        toUserId: incomingOffer.fromUserId,
        answer,
      });
      setIncomingOffer(null);
      markCallActive();
      remoteAudioRef.current?.play?.().catch(() => {
        setSpeakerMessage("Tap the call bar once if audio does not start.");
      });
    } catch (error) {
      setErrorMessage(
        error?.name === "NotAllowedError"
          ? "Microphone access was blocked. Please allow microphone permission."
          : "Unable to answer voice call."
      );
      endCall();
    }
  };

  const rejectIncomingCall = () => {
    stopRingtone();
    if (incomingOffer?.fromUserId && currentUserId) {
      socketRef.current?.emit("voice_call_rejected", {
        callId: incomingOffer.callId,
        fromUserId: currentUserId,
        toUserId: incomingOffer.fromUserId,
      });
    }
    cleanupCall();
  };

  const endCall = useCallback(() => {
    if (currentPeerIdRef.current && currentUserId) {
      socketRef.current?.emit("voice_call_ended", {
        callId: currentCallIdRef.current,
        fromUserId: currentUserId,
        toUserId: currentPeerIdRef.current,
      });
    }
    cleanupCall();
  }, [cleanupCall, currentUserId]);

  const toggleMute = () => {
    const nextMuted = !muted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMuted(nextMuted);
  };

  const toggleSpeaker = async () => {
    const audioElement = remoteAudioRef.current;
    const nextSpeakerOn = !speakerOn;

    if (!audioElement?.setSinkId) {
      setSpeakerOn(nextSpeakerOn);
      setSpeakerMessage(
        "Your browser controls speaker output. Use your phone speaker button if audio stays on earpiece."
      );
      return;
    }

    try {
      await audioElement.setSinkId(nextSpeakerOn ? "default" : "communications");
      setSpeakerOn(nextSpeakerOn);
      setSpeakerMessage(nextSpeakerOn ? "Speaker mode enabled." : "Speaker mode off.");
    } catch {
      try {
        await audioElement.setSinkId("default");
        setSpeakerOn(nextSpeakerOn);
        setSpeakerMessage("Speaker output set to your default audio device.");
      } catch {
        setSpeakerMessage(
          "Unable to change speaker output in this browser. Use your device audio controls."
        );
      }
    }
  };

  useEffect(() => {
    if (!currentUserId) return undefined;

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    const registerForCalls = () => {
      socket.emit("register_user", currentUserId);
      socket.emit("heartbeat", currentUserId);
    };

    registerForCalls();

    const handleOffer = (data) => {
      if (callStateRef.current !== "idle") {
        socket.emit("voice_call_rejected", {
          callId: data.callId,
          fromUserId: currentUserId,
          toUserId: data.fromUserId,
        });
        return;
      }

      setRemoteUser({
        _id: data.fromUserId,
        username: data.callerName,
        name: data.callerName,
        photo: data.callerPhoto,
      });
      setIncomingOffer(data);
      setCallState("incoming");
      startRingtone();
      setCallNotice(`${data.callerName || "Someone"} is calling you.`);
      showIncomingCallNotification(data);
    };

    const handleAnswer = async (data) => {
      if (!peerRef.current || data.callId !== currentCallIdRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      await flushPendingIceCandidates(data.callId);
      markCallActive();
    };

    const handleIceCandidate = async (data) => {
      if (!data?.candidate) return;

      if (!peerRef.current) {
        if (data.callId) {
          pendingIceByCallIdRef.current[data.callId] = [
            ...(pendingIceByCallIdRef.current[data.callId] || []),
            data.candidate,
          ];
        } else {
          pendingIceCandidatesRef.current.push(data.candidate);
        }
        return;
      }

      if (!peerRef.current.remoteDescription) {
        if (data.callId) {
          pendingIceByCallIdRef.current[data.callId] = [
            ...(pendingIceByCallIdRef.current[data.callId] || []),
            data.candidate,
          ];
        } else {
          pendingIceCandidatesRef.current.push(data.candidate);
        }
        return;
      }

      try {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch {
        // Ignore late ICE candidates after a call has ended.
      }
    };

    const handleRejected = () => {
      stopRingtone();
      setErrorMessage("Voice call was declined.");
      setCallNotice("Voice call was declined.");
      window.setTimeout(cleanupCall, 1200);
    };

    const handleBlocked = (data = {}) => {
      stopRingtone();
      const message =
        data.message ||
        "You have reached your monthly plan limit. Upgrade to enjoy a better plan.";
      setErrorMessage(message);
      setCallNotice(message);
      window.setTimeout(cleanupCall, 3200);
    };

    const handleUnavailable = (data = {}) => {
      stopRingtone();
      const message =
        data.message || "User is not available for calls right now.";
      setErrorMessage(message);
      setCallNotice(message);
      window.setTimeout(cleanupCall, 2200);
    };

    const handleMissed = (data = {}) => {
      if (data.callId !== currentCallIdRef.current && data.callId !== incomingOffer?.callId) {
        return;
      }
      stopRingtone();
      setCallNotice(callStateRef.current === "incoming" ? "Missed voice call." : "No answer.");
      setErrorMessage(callStateRef.current === "incoming" ? "Missed voice call." : "No answer.");
      window.setTimeout(cleanupCall, 1600);
    };

    socket.on("voice_call_offer", handleOffer);
    socket.on("voice_call_answer", handleAnswer);
    socket.on("voice_call_ice_candidate", handleIceCandidate);
    socket.on("voice_call_rejected", handleRejected);
    socket.on("voice_call_blocked", handleBlocked);
    socket.on("voice_call_unavailable", handleUnavailable);
    socket.on("voice_call_missed", handleMissed);
    socket.on("voice_call_ended", cleanupCall);
    socket.on("connect", registerForCalls);
    socket.io.on("reconnect", registerForCalls);
    window.addEventListener("authChanged", registerForCalls);
    window.addEventListener("online", registerForCalls);

    return () => {
      socket.off("voice_call_offer", handleOffer);
      socket.off("voice_call_answer", handleAnswer);
      socket.off("voice_call_ice_candidate", handleIceCandidate);
      socket.off("voice_call_rejected", handleRejected);
      socket.off("voice_call_blocked", handleBlocked);
      socket.off("voice_call_unavailable", handleUnavailable);
      socket.off("voice_call_missed", handleMissed);
      socket.off("voice_call_ended", cleanupCall);
      socket.off("connect", registerForCalls);
      socket.io.off("reconnect", registerForCalls);
      window.removeEventListener("authChanged", registerForCalls);
      window.removeEventListener("online", registerForCalls);
      socket.disconnect();
      cleanupCall();
    };
  }, [
    cleanupCall,
    currentUserId,
    incomingOffer?.callId,
    markCallActive,
    startRingtone,
    stopRingtone,
  ]);

  const displayName = remoteUser?.username || remoteUser?.name || "User";
  const showCallUi = callState !== "idle" || errorMessage;

  return (
    <VoiceCallContext.Provider value={{ startVoiceCall, callState }}>
      {children}
      <audio ref={remoteAudioRef} autoPlay playsInline controls={false} />

      <Dialog open={callState === "incoming"} onClose={rejectIncomingCall}>
        <DialogContent sx={{ minWidth: { xs: 280, sm: 360 }, textAlign: "center" }}>
          <Avatar
            src={remoteUser?.photo || ""}
            sx={{
              width: 82,
              height: 82,
              mx: "auto",
              mb: 1.5,
              bgcolor: "#D9A4F0",
              color: "#2d0052",
              fontWeight: 900,
              fontSize: 30,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h6" fontWeight={900}>
            Ringing...
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {displayName} is calling you
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <IconButton
              onClick={rejectIncomingCall}
              sx={{ bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}
            >
              <CallEndIcon />
            </IconButton>
            <IconButton
              onClick={acceptIncomingCall}
              sx={{ bgcolor: "#22c55e", color: "#fff", "&:hover": { bgcolor: "#16a34a" } }}
            >
              <CallIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      {showCallUi && callState !== "incoming" && (
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            left: "50%",
            bottom: { xs: 88, sm: 24 },
            transform: "translateX(-50%)",
            zIndex: 1700,
            width: { xs: "calc(100% - 28px)", sm: 380 },
            p: 1.4,
            borderRadius: 3,
            border: "1px solid rgba(217,164,240,0.5)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.2}>
            <Avatar src={remoteUser?.photo || ""}>
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={900} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {errorMessage ||
                  (callState === "outgoing"
                    ? "Ringing..."
                    : `Voice call connected - ${formatCallDuration(callDuration)}`)}
              </Typography>
            </Box>
            {callState === "active" && (
              <>
                <IconButton onClick={toggleSpeaker} sx={{ bgcolor: "#f3e8ff" }}>
                  {speakerOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
                <IconButton onClick={toggleMute} sx={{ bgcolor: "#f3e8ff" }}>
                  {muted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </>
            )}
            <IconButton
              onClick={endCall}
              sx={{ bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}
            >
              <CallEndIcon />
            </IconButton>
          </Box>
          {speakerMessage && (
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              {speakerMessage}
            </Typography>
          )}
        </Paper>
      )}
      <Snackbar
        open={Boolean(callNotice)}
        autoHideDuration={5000}
        onClose={() => setCallNotice("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={errorMessage ? "warning" : "info"}
          onClose={() => setCallNotice("")}
          sx={{ width: "100%" }}
        >
          {callNotice}
        </Alert>
      </Snackbar>
    </VoiceCallContext.Provider>
  );
};
