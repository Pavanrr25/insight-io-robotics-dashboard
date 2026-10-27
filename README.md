# Insight.IO — ERIC Robotics Dashboard

A locally hosted React dashboard concept based on the supplied Insight.IO reference screenshot and screen recording. It focuses on the full-screen robot-operator experience: a warehouse map, camera preview, mission status, operating mode, telemetry, emergency stop, and direction controls.

> **Scope note:** The UI and controls run locally as a simulation. They do not control a real robot and do not connect to a ROS bridge. The 3D map uses the included local ASCII `.pcd` sample or a user-selected ASCII `.pcd` file. ROS/ROS 2 integration can be added as a separate extension.

## Features

- Full-screen warehouse floor-map view with robot marker, mapped zones and simulated LiDAR detections.
- Camera mode with a local looping sample video and map preview.
- 3D point-cloud mode rendered with Three.js and the local `public/data/warehouse-scan.pcd` file.
- Load another ASCII `.pcd` file from the browser using **Load .PCD** in 3D mode.
- Auto / Manual mode toggle, mission pause/resume, quick-goal action and directional-pad controls.
- Emergency stop state that pauses the mission simulation and disables movement commands.
- Zoom slider and zoom-in / zoom-out controls in map mode.
- Responsive layout for desktop and mobile widths.
- No runtime web API calls are required. Install dependencies once before running locally. The CSS uses system fonts to avoid remote font dependencies.

## Requirements

- Node.js 20 or newer (Node 20 LTS or Node 22 LTS recommended)
- npm
- A modern browser with WebGL support for the 3D point-cloud view

## Run locally

1. Extract the project ZIP.
2. Open a terminal in the `insight-io-dashboard` folder.
3. Install the JavaScript dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite, normally `http://localhost:5173`.

To create and preview a production build:

```bash
npm run build
npm run preview
```

## Controls

- **Sidebar map icon:** open the warehouse map.
- **Sidebar scan icon:** open the interactive 3D point cloud. Drag to rotate and scroll to zoom.
- **Sidebar camera icon** or the camera inset: open the full camera feed.
- **Quick Goal:** add a simulated goal to the mission.
- **AUTO / MANUAL:** switch the operator mode indicator.
- **INITIATE / RESUME** or the pause button: pause/resume the simulated mission.
- **Emergency STOP:** engage/release the emergency-stop simulation.
- **Direction pad:** logs a simulated move/turn command and switches to Manual mode.
- **Zoom controls:** change the floor-map scale.
- **Load .PCD:** choose another local ASCII PCD file while in 3D mode.

## Project structure

```text
insight-io-dashboard/
├── index.html
├── package.json
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

`CameraPanel.jsx` is retained as a reusable camera-panel component from the starter iteration. The current immersive layout renders the camera feed inside the primary view or as a picture-in-picture preview.

## Architecture and implementation notes

- **React + Vite** provide the component model and local development server.
- **CSS + inline SVG** draw the lightweight, responsive occupancy-map illustration and UI overlays.
- **Three.js** renders the `.pcd` point cloud in 3D; `OrbitControls` enables rotation and zoom.
- **Local static assets** keep the sample video and point-cloud data bundled with the project.
- Mission, mode and emergency-stop controls are client-side simulation state. They should not be represented as real robot telemetry.
- The included point-cloud parser supports ASCII PCD files with `x`, `y`, and `z` fields. Binary/compressed PCD files need conversion or a more capable parser.

## Demo capture for submission

After running the app locally, capture a screen recording showing at least:

1. The map view and camera picture-in-picture.
2. Switching to the full camera view.
3. Switching to the 3D point-cloud mode and rotating the cloud.
4. Toggling Auto / Manual, pausing/resuming the mission, and activating Emergency Stop.

Save the capture into the repository (for example, `docs/demo.mp4`) and link it from the public GitHub repository. Use your own screen recording from the running build so it accurately reflects the submitted code.

## Submission checklist

- [ ] `npm install` succeeds on a clean machine.
- [ ] `npm run build` succeeds.
- [ ] Sample MP4 and PCD files are present in `public/`.
- [ ] Desktop and mobile layouts have been checked.
- [ ] Screenshots or a short demo recording are added.
- [ ] Repository is public and README setup instructions are easy to follow.

## License / sample assets

This is an assignment/demo project. Confirm the usage and redistribution terms of any replacement camera footage or point-cloud datasets before committing them to a public repository.
