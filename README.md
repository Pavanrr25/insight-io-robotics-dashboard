# Insight.IO — ERIC Robotics Dashboard

A responsive robotics dashboard built with React, Vite and Three.js. The interface provides a warehouse map, a camera simulation view, a 3D point-cloud visualization and interactive mission-control elements.

**Live Demo:** https://insight-io-robotics-dashboard.vercel.app  
**GitHub Repository:** https://github.com/Pavanrr25/insight-io-robotics-dashboard

## 1. Project Overview

Insight.IO is a frontend implementation of the dashboard design provided in the ERIC Robotics assessment.

The project focuses on recreating the reference interface and providing interactive dashboard experiences through locally hosted assets and browser-based rendering.

The application includes three primary visualization modes:

- **Map View:** A simulated warehouse map with a robot marker, mapped areas and visual LiDAR-style indicators.
- **Camera View:** A camera interface that plays a locally hosted sample video.
- **3D Map View:** An interactive point-cloud visualization powered by Three.js, using a local `.pcd` dataset.

Mission controls, robot status and telemetry elements are frontend simulations. The current implementation does not communicate with a physical robot or a ROS/ROS2 system.

## 2. Features

### Dashboard and Warehouse Map

- Warehouse-style dashboard interface.
- Simulated robot position and mapped zones.
- Map zoom controls.
- Navigation between dashboard views.

### Camera View

- Playback of a locally hosted sample video.
- Support for selecting a local video file.
- Play and pause controls.
- Snapshot capture and PNG download.
- Simulated camera overlays and status indicators.

### 3D Point-Cloud View

- Three.js-based 3D rendering.
- Loading of the default local PCD dataset.
- Support for selecting another local `.pcd` file.
- Point-cloud navigation using OrbitControls.
- Point visualization and grid controls.
- Camera reset and point-cloud information.
- ASCII PCD parsing with X, Y and Z fields and optional intensity data.

**Format limitation:** The current PCD parser supports ASCII PCD files. Binary and compressed PCD formats are not supported.

### Mission and Robot Controls

- Auto and Manual mode selection.
- Simulated mission pause and resume.
- Emergency-stop interface state.
- Directional control interface.
- Quick Goal interaction.
- Simulated status messages and telemetry.

These controls demonstrate frontend interaction only. They do not send movement commands to a physical robot.

### Responsive Interface

- Dashboard layout designed for desktop and smaller screens.
- Reusable React components.
- Interactive interface elements and status indicators.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite 6 | Development server and build tool |
| JavaScript | Application logic |
| CSS3 | Dashboard styling and responsive layout |
| Three.js | 3D point-cloud rendering |
| OrbitControls | 3D scene navigation |
| Lucide React | Interface icons |
| PCD | Local point-cloud data format |

## 4. Project Structure

```text
insight-io-robotics-dashboard/
├── index.html
├── package.json
├── package-lock.json
├── public/
│   ├── data/
│   │   └── warehouse-scan.pcd
│   └── media/
│       └── camera-simulation.mp4
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    └── components/
        ├── CameraPanel.jsx
        └── PointCloudView.jsx
```

## 5. Installation and Local Setup

### Prerequisites

- Node.js (Node 20 LTS recommended).
- npm.
- A modern browser with WebGL support.

### Step 1 — Clone the repository

```bash
git clone https://github.com/Pavanrr25/insight-io-robotics-dashboard.git
```

### Step 2 — Open the project directory

```bash
cd insight-io-robotics-dashboard
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser. The default address is usually:

```text
http://localhost:5173
```

### Step 5 — Create a production build

```bash
npm run build
```

### Step 6 — Preview the production build

```bash
npm run preview
```

## 6. Implementation Approach

### Component-Based Architecture

The application uses React components to organize the main dashboard and specialized visualization elements.

- `App.jsx` manages the main dashboard layout, navigation, view selection and simulated control states.
- `CameraPanel.jsx` contains the camera interface implementation.
- `PointCloudView.jsx` handles Three.js scene creation, PCD parsing and point-cloud rendering.
- `styles.css` contains the dashboard's visual styling and responsive layout.
- `main.jsx` initializes the React application.

### 3D Point-Cloud Rendering

Three.js is used to create a browser-based 3D scene. The application reads the ASCII PCD data, extracts the X, Y and Z coordinates, and uses those coordinates to render the point cloud.

The visualization supports interactive scene navigation through OrbitControls.

### Camera Simulation

The camera interface uses a locally hosted video asset. This allows the dashboard to demonstrate camera playback without requiring an external video-streaming service.

### Mission Controls

Mission and robot controls are implemented using React state. They demonstrate interface behavior, including mode switching, mission pause/resume and emergency-stop status changes.

They are not connected to real robot hardware.

## 7. Design and Architecture Decisions

1. **React:** Selected to organize the dashboard into reusable and maintainable components.
2. **Vite:** Used for a lightweight development workflow and production builds.
3. **Three.js:** Selected to render interactive 3D point-cloud data directly in the browser.
4. **Local Assets:** The sample camera video and point-cloud data are served from the project itself, avoiding external runtime asset dependencies.
5. **Frontend Simulation:** Mission controls and telemetry are simulated to demonstrate dashboard interactions without requiring a robotics backend.

## 8. Current Scope and Limitations

This submission focuses on the frontend dashboard and visualization experience.

The current implementation:

- Uses a local sample video rather than a live camera stream.
- Uses a local PCD dataset rather than a live LiDAR sensor.
- Supports ASCII PCD parsing, not binary or compressed PCD.
- Simulates robot controls, mission status and telemetry.
- Does not include ROS/ROS2 communication or physical robot control.
- Does not include a backend or persistent mission-management service.

ROS/ROS2 integration, live sensor data and real robot control could be developed as future extensions.

## 9. Demo and Screenshots

The following sequence can be used to demonstrate the implementation:

1. Show the main warehouse dashboard.
2. Demonstrate the camera view and video playback.
3. Open the 3D point-cloud view and rotate the scene.
4. Demonstrate Auto/Manual mode switching.
5. Demonstrate mission pause/resume.
6. Demonstrate the emergency-stop interface state.
7. Show the responsive layout.

Suggested screenshot folder:

```text
docs/
├── dashboard-map.png
├── camera-view.png
└── point-cloud-view.png
```

Add actual screenshots or a recorded demo only after capturing them.

## 10. Deployment

The application is deployed as a static frontend using Vercel.

**Build command:** `npm run build`  
**Output directory:** `dist`

The `public/data` and `public/media` assets are included in the deployed project.

**Live Demo:** https://insight-io-robotics-dashboard.vercel.app

---

## 11. Developer Information

- **Full Name:** Pavan Rajaram Rathod
- **GitHub Username:** Pavanrr25

---

**Developed as part of the ERIC Robotics Full Stack Developer Assessment.**