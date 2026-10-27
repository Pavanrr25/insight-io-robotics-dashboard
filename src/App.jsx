import React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BatteryFull,
  Camera, Check, CircleStop, Crosshair, Map as MapIcon, MapPinned,
  Pause, Play, RotateCcw, Scan, Signal, UserRound, Upload, Navigation2,
} from 'lucide-react';
import PointCloudView from './components/PointCloudView.jsx';

const NAV_ITEMS = [
  { id: 'map', label: 'Map View', icon: MapIcon },
  { id: 'cloud', label: '3D Point Cloud', icon: Scan },
  { id: 'camera', label: 'Camera View', icon: Camera },
  { id: 'goals', label: 'Goals', icon: MapPinned },
  { id: 'telemetry', label: 'Telemetry', icon: Activity },
];

function WarehouseMap({ zoom = 1, compact = false, onRobotClick }) {
  return (
    <div
      className={`warehouse-map ${compact ? 'warehouse-map-compact' : ''}`}
      style={{ '--map-zoom': zoom }}
    >
      <svg
        className="map-blueprint"
        viewBox="0 0 700 830"
        role="img"
        aria-label="Simulated warehouse occupancy map with detected objects"
      >
        <defs>
          <pattern
            id={compact ? 'miniDots' : 'mapDots'}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.2" fill="#e9a8ac" opacity=".72" />
          </pattern>
        </defs>

        <g className="floorplan-tilt">
          <path className="map-floor" d="M155 28 L518 23 L538 70 L560 93 L548 147 L575 170 L572 288 L604 324 L610 533 L575 575 L568 664 L526 690 L523 744 L418 750 L396 715 L298 716 L284 682 L205 681 L197 615 L150 594 L149 466 L117 439 L118 318 L137 294 L126 190 L151 164 Z" />

          <path className="map-wall" d="M155 28 L518 23 L538 70 M560 93 L548 147 L575 170 L572 288 L604 324 L610 533 L575 575 L568 664 L526 690 L523 744 L418 750 L396 715 L298 716 L284 682 L205 681 L197 615 L150 594 L149 466 L117 439 L118 318 L137 294 L126 190 L151 164 Z" />

          <path className="map-wall-break" d="M126 190 L141 205 M142 294 L132 306 M151 466 L162 482 M197 615 L185 602 M298 716 L304 704 M526 690 L544 669 M610 533 L596 520 M572 288 L558 280 M538 70 L522 88" />

          <rect className="map-room" x="191" y="178" width="164" height="49" rx="2" transform="rotate(-3 191 178)" />
          <rect className="map-room" x="395" y="115" width="62" height="96" rx="2" transform="rotate(-12 395 115)" />
          <rect className="map-room" x="355" y="268" width="142" height="34" rx="2" transform="rotate(-10 355 268)" />
          <rect className="map-room" x="185" y="366" width="94" height="122" rx="2" transform="rotate(-8 185 366)" />
          <rect className="map-room" x="378" y="345" width="110" height="198" rx="2" transform="rotate(-8 378 345)" />
          <rect className="map-room" x="314" y="409" width="25" height="143" rx="1" transform="rotate(-9 314 409)" />
          <rect className="map-room" x="448" y="555" width="91" height="76" rx="2" transform="rotate(-10 448 555)" />
          <rect className="map-room-light" x="210" y="505" width="58" height="31" rx="2" />

          <rect x="367" y="338" width="196" height="323" fill="url(#mapDots)" opacity=".35" />

          <path className="mapped-red-edge" d="M505 297 L570 321 L589 496 L558 556 L520 606 L466 620 M500 315 L547 329 L565 487 L541 536" />

          {Array.from({ length: 86 }, (_, i) => {
            const x = 354 + ((i * 37) % 190);
            const y = 327 + ((i * 61) % 302);

            return (
              <circle
                key={i}
                className={i % 5 === 0 ? 'lidar-pink-strong' : 'lidar-pink'}
                cx={x}
                cy={y}
                r={i % 7 === 0 ? 2.8 : 1.7}
              />
            );
          })}

          {Array.from({ length: 22 }, (_, i) => (
            <circle
              key={`dark-${i}`}
              className="lidar-dark"
              cx={136 + ((i * 29) % 52)}
              cy={194 + ((i * 53) % 416)}
              r={i % 4 === 0 ? 3 : 1.8}
            />
          ))}

          <g className="map-object" transform="translate(443 408)">
            <rect x="-11" y="-14" width="22" height="28" rx="2" />
            <path d="M-6 -9 L6 -9 M-6 8 L6 8" />
          </g>

          <g className="map-object" transform="translate(499 478)">
            <rect x="-9" y="-13" width="18" height="26" rx="2" />
            <path d="M-4 -7 L4 -7 M-4 7 L4 7" />
          </g>

          <g className="map-object" transform="translate(254 430)">
            <path d="M-14 -5 L8 -9 L14 0 L9 9 L-10 7 Z" />
            <circle r="3" />
          </g>

          <text className="map-room-label" x="230" y="204">STORAGE A</text>
          <text className="map-room-label" x="400" y="286" transform="rotate(-10 400 286)">AISLE 04</text>
          <text className="map-room-label" x="399" y="465" transform="rotate(-8 399 465)">PICKING ZONE</text>
          <text className="map-room-label" x="204" y="420" transform="rotate(-8 204 420)">ZONE B</text>

          <g
            className="robot-marker"
            transform="translate(272 340)"
            onClick={onRobotClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onRobotClick?.();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Robot position"
          >
            <circle className="robot-marker-ring" r="19" />
            <rect x="-12" y="-6" width="24" height="12" rx="3" />
            <circle cx="-7" cy="8" r="3.5" />
            <circle cx="7" cy="8" r="3.5" />
            <path d="M-6 -7 L-4 -13 L5 -13 L8 -6" />
            <circle className="robot-marker-dot" cx="0" cy="0" r="2" />
          </g>
        </g>
      </svg>

      {!compact && (
        <div className="map-coordinate-chip">
          <Crosshair size={12} /> MAP_01 <span>·</span> X 04.24 / Y 12.08
        </div>
      )}
    </div>
  );
}

function CameraFeed({ className = '', stopped = false, large = false }) {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stopped) {
      video.pause();
      return;
    }

    const playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(() => setVideoError(true));
    }
  }, [stopped]);

  return (
    <div className={`camera-feed ${className} ${large ? 'camera-feed-large' : ''}`}>
      {!videoError ? (
        <video
          ref={videoRef}
          src="/media/camera-simulation.mp4"
          muted
          loop
          autoPlay
          playsInline
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="camera-fallback">
          <Camera size={30} />
          <span>Local camera sample</span>
        </div>
      )}

      <div className="camera-overlay-grain" />

      <div className="camera-label-row">
        <span><span className="red-dot" /> CAM-01 / FRONT</span>
        <span>SIMULATED FEED</span>
      </div>

      {large && (
        <>
          <div className="camera-box box-a"><span>OBJECT 01</span></div>
          <div className="camera-box box-b"><span>OBJECT 02</span></div>
          <div className="camera-crosshair"><i /><i /></div>
          <div className="camera-meta">
            1920 × 1080 <span>·</span> 30 FPS <span>·</span> 24 ms LATENCY
          </div>
        </>
      )}

      {stopped && (
        <div className="camera-stopped">
          <CircleStop size={25} />
          <strong>EMERGENCY STOP</strong>
          <span>Camera feed simulation paused</span>
        </div>
      )}
    </div>
  );
}

function DirectionPad({ disabled, onCommand }) {
  const press = (direction) => onCommand?.(direction);

  return (
    <div
      className={`direction-pad ${disabled ? 'direction-pad-disabled' : ''}`}
      aria-label="Robot direction controls"
    >
      <button className="pad-up" type="button" aria-label="Move forward" disabled={disabled} onClick={() => press('Forward')}>
        <ArrowUp size={14} />
      </button>

      <button className="pad-left" type="button" aria-label="Rotate left" disabled={disabled} onClick={() => press('Rotate left')}>
        <ArrowLeft size={14} />
      </button>

      <div className="pad-center">
        <span>N</span>
        <Navigation2 size={11} />
        <small>MANUAL</small>
      </div>

      <button className="pad-right" type="button" aria-label="Rotate right" disabled={disabled} onClick={() => press('Rotate right')}>
        <ArrowRight size={14} />
      </button>

      <button className="pad-down" type="button" aria-label="Move backward" disabled={disabled} onClick={() => press('Backward')}>
        <ArrowDown size={14} />
      </button>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState('map');
  const [mode, setMode] = useState('AUTO');
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [missionRunning, setMissionRunning] = useState(true);
  const [mapZoom, setMapZoom] = useState(1);
  const [pcdFile, setPcdFile] = useState(null);
  const [showCloudGrid, setShowCloudGrid] = useState(false);
  const [statusMessage, setStatusMessage] = useState('On Mission 1234');
  const [lastAction, setLastAction] = useState('Ready');
  const [time, setTime] = useState(new Date());
  const [showToast, setShowToast] = useState(false);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const announce = useCallback((message) => {
    setLastAction(message);
    setShowToast(true);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setShowToast(false);
      toastTimerRef.current = null;
    }, 2300);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handlePointStatus = useCallback((status) => {
    setLastAction(status);
  }, []);

  const chooseView = (view) => {
    if (view === 'goals') {
      setStatusMessage('Goal Added');
      announce('Quick goal added to mission');
      setActiveView('map');
      return;
    }

    if (view === 'telemetry') {
      announce('Telemetry nominal · battery 100% · signal strong');
      return;
    }

    setActiveView(view);

    announce(
      view === 'map'
        ? 'Map view active'
        : view === 'camera'
          ? 'Camera view active'
          : '3D point cloud active'
    );
  };

  const toggleMission = () => {
    const next = !missionRunning;

    setMissionRunning(next);
    setStatusMessage(next ? 'On Mission 1234' : 'Mission Paused');

    announce(next ? 'Mission resumed' : 'Mission paused');
  };

  const toggleEmergency = () => {
    const next = !emergencyStop;

    setEmergencyStop(next);

    if (next) {
      setMissionRunning(false);
    }

    setStatusMessage(
      next
        ? 'Emergency Stop Active'
        : missionRunning
          ? 'On Mission 1234'
          : 'Mission Paused'
    );

    announce(next ? 'Emergency stop engaged' : 'Emergency stop released');
  };

  const choosePcd = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pcd')) {
      announce('Please select a .pcd file');
      event.target.value = '';
      return;
    }

    setPcdFile(file);
    setActiveView('cloud');
    announce(`Loaded point cloud: ${file.name}`);

    event.target.value = '';
  };

  const commandRobot = (direction) => {
    if (emergencyStop) return;

    if (mode !== 'MANUAL') {
      setMode('MANUAL');
    }

    announce(`Manual command: ${direction}`);
  };

  const formattedTime = time.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <main className={`insight-screen ${emergencyStop ? 'is-emergency' : ''}`}>
      <aside className="robot-sidebar">
        <button
          className="brand-tile"
          type="button"
          aria-label="ERIC Robotics home"
          onClick={() => chooseView('map')}
        >
          <strong>ERIC</strong>
          <span>ROBOTICS</span>
        </button>

        <nav className="robot-nav" aria-label="Dashboard views">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`robot-nav-button ${activeView === id ? 'robot-nav-active' : ''}`}
              onClick={() => chooseView(id)}
              title={label}
              aria-label={label}
            >
              <Icon size={17} strokeWidth={1.8} />
              {activeView === id && <span className="nav-active-rail" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-grow" />

        <button
          type="button"
          className="robot-nav-button profile-nav"
          onClick={() => announce('Operator profile: Mission Operator')}
          aria-label="Operator profile"
          title="Operator profile"
        >
          <UserRound size={16} />
        </button>

        <span className="sidebar-bottom-label">IO</span>
      </aside>

      <section className={`mission-world ${activeView === 'cloud' ? 'cloud-world' : ''}`}>
        {activeView === 'map' && (
          <>
            <div className="map-backdrop" />
            <WarehouseMap
              zoom={mapZoom}
              onRobotClick={() => announce('Robot is at waypoint 17')}
            />
          </>
        )}

        {activeView === 'camera' && (
          <CameraFeed className="main-camera" stopped={emergencyStop} large />
        )}

        {activeView === 'cloud' && (
          <>
            <PointCloudView
              pcdFile={pcdFile}
              showGrid={showCloudGrid}
              onToggleGrid={() => setShowCloudGrid((visible) => !visible)}
              colorMode="intensity"
              onStatus={handlePointStatus}
            />

            <div className="cloud-title">
              <span className="cloud-live-dot" />
              LIVE POINT CLOUD
              <small>WAREHOUSE / LIDAR-01</small>
            </div>

            <label className="pcd-upload-button">
              <Upload size={13} /> LOAD .PCD
              <input type="file" accept=".pcd,text/plain" onChange={choosePcd} />
            </label>
          </>
        )}

        <div className="top-left-controls">
          <div className="mission-status-pill">
            <span>Status</span>
            <strong>{statusMessage}</strong>
            <button
              type="button"
              aria-label={missionRunning ? 'Pause mission' : 'Resume mission'}
              onClick={toggleMission}
              disabled={emergencyStop}
            >
              {missionRunning && !emergencyStop
                ? <Pause size={13} fill="currentColor" />
                : <Play size={13} fill="currentColor" />}
            </button>
          </div>

          <button
            type="button"
            className="quick-goal-pill"
            onClick={() => chooseView('goals')}
          >
            <span>QUICK GOAL</span>
            <span className="pill-arrow"><ArrowRight size={15} /></span>
          </button>
        </div>

        <div className="telemetry-capsule">
          <div className="telemetry-item">
            <strong>100%</strong>
            <BatteryFull size={13} className="battery-green" />
            <span className="telemetry-divider" />
          </div>

          <div className="telemetry-item">
            <Signal size={13} />
            <strong>Strong</strong>
            <span className="telemetry-divider" />
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">Failsafe</span>
            <strong>Okay</strong>
            <i className="green-dot" />
            <span className="telemetry-divider" />
          </div>

          <div className="telemetry-item">
            <span className="telemetry-label">System</span>
            <strong>Okay</strong>
            <i className="green-dot" />
          </div>
        </div>

        <button
          type="button"
          className="active-view-chip"
          onClick={() => chooseView(activeView === 'camera' ? 'map' : 'camera')}
        >
          {activeView === 'camera'
            ? 'Camera View'
            : activeView === 'cloud'
              ? '3D Map View'
              : 'Map View'}
        </button>

        <div className="top-right-controls">
          <div className="mode-toggle" aria-label="Robot operating mode">
            <span>MODE</span>

            <button
              type="button"
              className={mode === 'AUTO' ? 'mode-selected' : ''}
              onClick={() => {
                setMode('AUTO');
                announce('Auto mode selected');
              }}
            >
              AUTO
            </button>

            <button
              type="button"
              className={mode === 'MANUAL' ? 'mode-selected' : ''}
              onClick={() => {
                setMode('MANUAL');
                announce('Manual mode selected');
              }}
            >
              MANUAL
            </button>
          </div>

          <button
            type="button"
            className="initiate-pill"
            onClick={toggleMission}
            disabled={emergencyStop}
          >
            <span>{missionRunning ? 'PAUSE' : 'RESUME'}</span>
            <span className="pill-arrow"><ArrowRight size={15} /></span>
          </button>
        </div>

        {activeView === 'cloud' && (
          <div className="cloud-mode-toggle">
            <button type="button" onClick={() => chooseView('map')}>
              <MapIcon size={13} /> Floor Map
            </button>
            <button type="button" className="cloud-current">
              <Scan size={13} /> 3D Cloud
            </button>
          </div>
        )}

        {activeView === 'camera' ? (
          <div className="mini-map-card" title="Switch to map view">
            <button
              type="button"
              onClick={() => chooseView('map')}
              aria-label="Switch to map view"
            >
              <WarehouseMap compact zoom={0.84} />
            </button>
            <span className="mini-map-label">MAP PREVIEW</span>
          </div>
        ) : activeView !== 'cloud' ? (
          <div className="camera-pip-wrap">
            <div className="zoom-rail">
              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))}
                aria-label="Zoom in"
              >
                +
              </button>

              <input
                aria-label="Map zoom"
                type="range"
                min="0.7"
                max="1.8"
                step="0.1"
                value={mapZoom}
                onChange={(event) => setMapZoom(Number(event.target.value))}
              />

              <button
                type="button"
                onClick={() => setMapZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))}
                aria-label="Zoom out"
              >
                −
              </button>
            </div>

            <button
              type="button"
              className="camera-pip-button"
              onClick={() => chooseView('camera')}
              aria-label="Open camera view"
            >
              <CameraFeed className="camera-pip" stopped={emergencyStop} />
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className={`emergency-control ${emergencyStop ? 'emergency-activated' : ''}`}
          onClick={toggleEmergency}
          aria-label={emergencyStop ? 'Release emergency stop' : 'Trigger emergency stop'}
        >
          <span className="emergency-caption">
            {emergencyStop ? 'STOP ACTIVE' : 'EMERGENCY'}
          </span>

          <span className="emergency-ring">
            <RotateCcw size={31} strokeWidth={3} />
          </span>

          <strong>{emergencyStop ? 'RELEASE' : 'STOP'}</strong>
        </button>

        <DirectionPad
          disabled={emergencyStop}
          onCommand={commandRobot}
        />

        <div className="world-footer-left">
          <span className="world-pulse" />
          ROBOT <strong>ER-04</strong>
          <span className="world-footer-divider" />
          {formattedTime}
          <span className="world-footer-divider" />
          {mode} MODE
        </div>

        {showToast && (
          <div className="action-toast">
            <Check size={13} /> {lastAction}
          </div>
        )}

        {emergencyStop && (
          <div className="emergency-screen-banner">
            <CircleStop size={15} />
            Emergency stop engaged — movement commands are disabled
          </div>
        )}
      </section>
    </main>
  );
}