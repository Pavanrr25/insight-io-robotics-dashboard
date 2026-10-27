import { useEffect, useRef, useState } from 'react';
import { Camera, CircleStop, Download, Pause, Play, Radio, Upload, Video } from 'lucide-react';

export default function CameraPanel({ onEvent, emergencyStop = false }) {
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const noticeTimerRef = useRef(null);

  const [playing, setPlaying] = useState(true);
  const [recording, setRecording] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [captureNotice, setCaptureNotice] = useState('');

  const showNotice = (message) => {
    setCaptureNotice(message);

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setCaptureNotice('');
      noticeTimerRef.current = null;
    }, 2600);
  };

  // Release the previous local video URL when it changes or this component unmounts.
  useEffect(() => {
    if (!customVideoUrl) return undefined;

    return () => {
      URL.revokeObjectURL(customVideoUrl);
    };
  }, [customVideoUrl]);

  // Keep the video element in sync with the play/pause and emergency-stop states.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (emergencyStop || !playing) {
      video.pause();
      return;
    }

    const playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(() => {
        setPlaying(false);
        showNotice('Video playback was blocked. Press Resume feed to try again.');
      });
    }
  }, [playing, emergencyStop, customVideoUrl]);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const chooseVideo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showNotice('Please choose a valid video file.');
      event.target.value = '';
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setCustomVideoUrl(nextUrl);
    setPlaying(true);
    showNotice(`Loaded local clip: ${file.name}`);
    onEvent?.(`Loaded camera clip: ${file.name}`);

    // Allow the same file to be selected again later.
    event.target.value = '';
  };

  const takeSnapshot = () => {
    const video = videoRef.current;

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) {
      showNotice('Camera frame is not ready yet. Wait for the video to load.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
