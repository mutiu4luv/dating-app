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
  Typography,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

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

export const useVoiceCall = () => useContext(VoiceCallContext);

export const VoiceCallProvider = ({ children }) => {
  const location = useLocation();
  const [callState, setCallState] = useState("idle");
  const [remoteUser, setRemoteUser] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [muted, setMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const currentUserId = authUser.id;
  const currentUsername = authUser.username;

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    setAuthUser({
      id: localStorage.getItem("userId") || "",
      username:
        localStorage.getItem("username") || localStorage.getItem("name") || "User",
    });
  }, [location.pathname]);

  const cleanupCall = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    currentPeerIdRef.current = null;
    currentCallIdRef.current = null;
    setIncomingOffer(null);
    setRemoteUser(null);
    setMuted(false);
    setErrorMessage("");
    setCallState("idle");
  }, []);

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
        const [remoteStream] = event.streams;
        if (remoteAudioRef.current && remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(() => {});
        }
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
        setErrorMessage(
          error?.name === "NotAllowedError"
            ? "Microphone access was blocked. Please allow microphone permission."
            : "Unable to start voice call."
        );
        cleanupCall();
      }
    },
    [callState, cleanupCall, createPeerConnection, currentUserId, currentUsername]
  );

  const acceptIncomingCall = async () => {
    if (!incomingOffer || !currentUserId) return;

    try {
      setErrorMessage("");
      setCallState("active");
      currentPeerIdRef.current = incomingOffer.fromUserId;
      currentCallIdRef.current = incomingOffer.callId;

      const stream = await getMicrophoneStream();
      const peer = createPeerConnection(incomingOffer.fromUserId);
      addLocalTracks(peer, stream);

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingOffer.offer)
      );
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current?.emit("voice_call_answer", {
        callId: incomingOffer.callId,
        fromUserId: currentUserId,
        toUserId: incomingOffer.fromUserId,
        answer,
      });
      setIncomingOffer(null);
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

  useEffect(() => {
    if (!currentUserId) return undefined;

    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.emit("register_user", currentUserId);

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
    };

    const handleAnswer = async (data) => {
      if (!peerRef.current || data.callId !== currentCallIdRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
      setCallState("active");
    };

    const handleIceCandidate = async (data) => {
      if (!peerRef.current || !data.candidate) return;
      try {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch {
        // Ignore late ICE candidates after a call has ended.
      }
    };

    const handleRejected = () => {
      setErrorMessage("Voice call was declined.");
      window.setTimeout(cleanupCall, 1200);
    };

    socket.on("voice_call_offer", handleOffer);
    socket.on("voice_call_answer", handleAnswer);
    socket.on("voice_call_ice_candidate", handleIceCandidate);
    socket.on("voice_call_rejected", handleRejected);
    socket.on("voice_call_ended", cleanupCall);

    return () => {
      socket.off("voice_call_offer", handleOffer);
      socket.off("voice_call_answer", handleAnswer);
      socket.off("voice_call_ice_candidate", handleIceCandidate);
      socket.off("voice_call_rejected", handleRejected);
      socket.off("voice_call_ended", cleanupCall);
      socket.disconnect();
      cleanupCall();
    };
  }, [cleanupCall, currentUserId]);

  const displayName = remoteUser?.username || remoteUser?.name || "User";
  const showCallUi = callState !== "idle" || errorMessage;

  return (
    <VoiceCallContext.Provider value={{ startVoiceCall, callState }}>
      {children}
      <audio ref={remoteAudioRef} autoPlay playsInline />

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
            Incoming voice call
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
                    ? "Calling..."
                    : "Voice call connected")}
              </Typography>
            </Box>
            {callState === "active" && (
              <IconButton onClick={toggleMute} sx={{ bgcolor: "#f3e8ff" }}>
                {muted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            )}
            <IconButton
              onClick={endCall}
              sx={{ bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}
            >
              <CallEndIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </VoiceCallContext.Provider>
  );
};
