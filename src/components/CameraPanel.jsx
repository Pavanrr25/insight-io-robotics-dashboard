import { useEffect, useRef, useState } from 'react';
import { Camera, CircleStop, Download, Pause, Play, Radio, Upload, Video } from 'lucide-react';

export default function CameraPanel({ onEvent, emergencyStop }) {
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [recording, setRecording] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');
  const [captureNotice, setCaptureNotice] = useState('');

  useEffect(() => () => { if (customVideoUrl) URL.revokeObjectURL(customVideoUrl); }, [customVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && !emergencyStop) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, emergencyStop, customVideoUrl]);

  const chooseVideo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setCaptureNotice('Please choose a video file.');
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setCustomVideoUrl((oldUrl) => {
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      return nextUrl;
    });
    setPlaying(true);
    onEvent?.(`Loaded camera clip: ${file.name}`);
    event.target.value = '';
  };

  const takeSnapshot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      setCaptureNotice('Camera frame is not ready yet.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const link = document.createElement('a');
    link.download = `insight-camera-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setCaptureNotice('Snapshot saved.');
    onEvent?.('Camera snapshot exported');
    window.setTimeout(() => setCaptureNotice(''), 2400);
  };

  const toggleRecording = () => {
    const next = !recording;
    setRecording(next);
    onEvent?.(next ? 'Camera recording indicator enabled' : 'Camera recording indicator stopped');
  };

  return (
    <section className="panel camera-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <span className="panel-icon"><Video size={16} /></span>
          <div><h2>Camera feed</h2><p>FRONT CAM <span className="muted-dot">•</span> CAM-01</p></div>
        </div>
        <div className="camera-head-right">
          <span className={`pill ${emergencyStop ? 'pill-danger' : 'pill-live'}`}><span /> {emergencyStop ? 'STOPPED' : 'LIVE'}</span>
          <button type="button" className="icon-button" onClick={() => inputRef.current?.click()} aria-label="Load local video" title="Load local video"><Upload size={15} /></button>
          <input ref={inputRef} type="file" accept="video/*" onChange={chooseVideo} hidden />
        </div>
      </div>
      <div className="camera-frame">
        <video
          ref={videoRef}
          className="camera-video"
          src={customVideoUrl || '/media/camera-simulation.mp4'}
          muted
          loop
          playsInline
          autoPlay
          onError={() => setCaptureNotice('Sample video could not be played. Use the upload button to choose a local clip.')}
          onCanPlay={() => setCaptureNotice('')}
        />
        <div className="camera-vignette" />
        <div className="camera-scanline" />
        <div className="camera-corner corner-tl" /><div className="camera-corner corner-tr" />
        <div className="camera-corner corner-bl" /><div className="camera-corner corner-br" />
        <div className="camera-hud camera-hud-left"><span>CAM 01 / FRONT</span><span>1080P <i>•</i> 30 FPS</span></div>
        <div className="camera-hud camera-hud-right"><span>REC {recording ? <b className="record-dot" /> : null} {recording ? '00:00:18' : 'STANDBY'}</span><span>EXPOSURE AUTO</span></div>
        <div className="detection-box detection-one"><span>OBJECT 01</span><b>96.8%</b></div>
        <div className="detection-box detection-two"><span>OBJECT 02</span><b>92.4%</b></div>
        <div className="camera-crosshair"><span /><span /></div>
        {emergencyStop && <div className="camera-stopped-overlay"><CircleStop size={25} /><strong>CAMERA FEED PAUSED</strong><small>Emergency stop engaged</small></div>}
        {captureNotice && <div className="camera-notice">{captureNotice}</div>}
        <div className="camera-bottom-hud"><span><Radio size={12} /> STREAM 01</span><span>LATENCY <b>24 ms</b></span><span>BITRATE <b>8.4 Mb/s</b></span></div>
      </div>
      <div className="camera-controls">
        <div className="camera-controls-left">
          <button type="button" className="control-button primary-control" onClick={() => setPlaying((value) => !value)} disabled={emergencyStop} aria-label={playing ? 'Pause camera feed' : 'Play camera feed'}>{playing && !emergencyStop ? <Pause size={14} /> : <Play size={14} />}{playing && !emergencyStop ? 'Pause feed' : 'Resume feed'}</button>
          <button type="button" className={`control-button ${recording ? 'recording-active' : ''}`} onClick={toggleRecording}><span className="record-dot" /> {recording ? 'Recording' : 'Record'}</button>
        </div>
        <button type="button" className="control-button snapshot-button" onClick={takeSnapshot}><Camera size={14} /> Snapshot <Download size={12} /></button>
      </div>
    </section>
  );
}
