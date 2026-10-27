
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Box, Crosshair, Grid2X2, RotateCcw } from 'lucide-react';

function parseAsciiPcd(text) {
  const lines = text.split(/\r?\n/);
  const dataIndex = lines.findIndex((line) =>
    /^DATA\s+/i.test(line.trim())
  );

  if (dataIndex < 0) {
    throw new Error('Invalid PCD: missing DATA header.');
  }

  const dataType = lines[dataIndex].trim().split(/\s+/)[1]?.toLowerCase();

  if (dataType !== 'ascii') {
    throw new Error('Only ASCII PCD files are supported.');
  }

  const fieldsLine = lines.find((line) =>
    /^FIELDS\s+/i.test(line.trim())
  );

  const fields = fieldsLine
    ? fieldsLine.trim().split(/\s+/).slice(1).map((field) => field.toLowerCase())
    : ['x', 'y', 'z'];

  const xIndex = fields.indexOf('x');
  const yIndex = fields.indexOf('y');
  const zIndex = fields.indexOf('z');
  const intensityIndex = fields.indexOf('intensity');

  if (xIndex < 0 || yIndex < 0 || zIndex < 0) {
    throw new Error('PCD needs x, y and z fields.');
  }

  const positions = [];
  const intensities = [];

  for (const line of lines.slice(dataIndex + 1)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const values = trimmed.split(/\s+/).map(Number);
    const requiredIndex = Math.max(xIndex, yIndex, zIndex);

    if (
      values.length <= requiredIndex ||
      !Number.isFinite(values[xIndex]) ||
      !Number.isFinite(values[yIndex]) ||
      !Number.isFinite(values[zIndex])
    ) {
      continue;
    }

    positions.push(
      values[xIndex],
      values[zIndex],
      -values[yIndex]
    );

    const intensity =
      intensityIndex >= 0 ? Number(values[intensityIndex]) : 0.6;

    intensities.push(
      Number.isFinite(intensity) ? intensity : 0.6
    );
  }

  if (positions.length === 0) {
    throw new Error('No valid point records found in the PCD file.');
  }

  return { positions, intensities };
}

export default function PointCloudView({
  pcdFile,
  showGrid = true,
  onToggleGrid,
  colorMode = 'height',
  onStatus,
}) {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const pointsRef = useRef(null);
  const gridRef = useRef(null);
  const loadRequestRef = useRef(0);

  const [pointCount, setPointCount] = useState(0);
  const [loadError, setLoadError] = useState('');

  const reportStatus = useCallback(
    (message) => {
      onStatus?.(message);
    },
    [onStatus]
  );

  // Initialize Three.js and mouse controls.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let disposed = false;
    let animationFrame = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080d15');

    const camera = new THREE.PerspectiveCamera(
      60,
      1,
      0.1,
      10000
    );

    camera.position.set(12, 12, 18);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.domElement.className = 'pointcloud-renderer';
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive 3D point cloud viewer. Drag to rotate and scroll to zoom.'
    );

    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.rotateSpeed = 0.7;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    controls.target.set(0, 0, 0);
    controls.update();

    scene.add(
      new THREE.AmbientLight(0xffffff, 1.2)
    );

    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      1.5
    );

    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const grid = new THREE.GridHelper(
      40,
      40,
      0x35516a,
      0x1b2b3a
    );

    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    scene.add(grid);
    gridRef.current = grid;

    const axes = new THREE.AxesHelper(3);
    scene.add(axes);

    const resize = () => {
      if (disposed) return;

      const width = host.clientWidth;
      const height = host.clientHeight;

      if (width <= 0 || height <= 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const render = () => {
      if (disposed) return;

      animationFrame = requestAnimationFrame(render);

      controls.update();
      renderer.render(scene, camera);
    };

    render();

    engineRef.current = {
      scene,
      camera,
      renderer,
      controls,
      grid,
    };

    reportStatus('3D viewer initialized');

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();

      controls.dispose();

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => material.dispose());
        }
      });

      renderer.dispose();

      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }

      engineRef.current = null;
      pointsRef.current = null;
      gridRef.current = null;
    };
  }, [reportStatus]);

  // Load the selected PCD file or the default warehouse scan.
  useEffect(() => {
    let cancelled = false;
    const requestId = ++loadRequestRef.current;

    async function loadPointCloud() {
      setLoadError('');
      setPointCount(0);

      try {
        let text;

        if (pcdFile) {
          text = await pcdFile.text();
        } else {
          const response = await fetch('/data/warehouse-scan.pcd');

          if (!response.ok) {
            throw new Error(
              `Could not load warehouse-scan.pcd (${response.status}).`
            );
          }

          text = await response.text();
        }

        if (
          cancelled ||
          requestId !== loadRequestRef.current
        ) {
          return;
        }

        const engine = engineRef.current;

        if (!engine) {
          throw new Error('3D viewer is not ready. Please try again.');
        }

        const { positions, intensities } = parseAsciiPcd(text);

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        );

        const colors = [];
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          const z = positions[i * 3 + 2];
          const intensity = intensities[i];

          let color;

          if (colorMode === 'intensity') {
            const value = THREE.MathUtils.clamp(
              intensity / 255,
              0,
              1
            );

            color = new THREE.Color().setHSL(
              0.58 - value * 0.48,
              0.85,
              0.45 + value * 0.2
            );
          } else {
            const height = THREE.MathUtils.clamp(
              (y + 5) / 15,
              0,
              1
            );

            color = new THREE.Color().setHSL(
              0.62 - height * 0.5,
              0.8,
              0.4 + height * 0.2
            );
          }

          colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(colors, 3)
        );

        geometry.computeBoundingSphere();

        const material = new THREE.PointsMaterial({
          size: 0.09,
          vertexColors: true,
          sizeAttenuation: true,
        });

        const pointCloud = new THREE.Points(
          geometry,
          material
        );

        if (pointsRef.current) {
          engine.scene.remove(pointsRef.current);
          pointsRef.current.geometry.dispose();
          pointsRef.current.material.dispose();
        }

        engine.scene.add(pointCloud);
        pointsRef.current = pointCloud;

        const sphere = geometry.boundingSphere;

        if (sphere) {
          engine.controls.target.copy(sphere.center);

          const radius = Math.max(sphere.radius, 2);

          engine.camera.position.set(
            sphere.center.x + radius * 1.5,
            sphere.center.y + radius * 1.2,
            sphere.center.z + radius * 1.5
          );

          engine.controls.update();
        }

        if (!cancelled) {
          setPointCount(count);
          reportStatus(`${count.toLocaleString()} points loaded`);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Unable to load point cloud.'
          );

          reportStatus('Point cloud loading failed');
        }
      }
    }

    loadPointCloud();

    return () => {
      cancelled = true;
    };
  }, [pcdFile, colorMode, reportStatus]);

  // Show or hide the grid.
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.visible = showGrid;
    }
  }, [showGrid]);

  const resetView = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.controls.target.set(0, 0, 0);
    engine.camera.position.set(12, 12, 18);
    engine.controls.update();

    reportStatus('3D camera view reset');
  };

  return (
    <div className="pointcloud-wrap">
      <div
        ref={hostRef}
        className="pointcloud-canvas"
      />

      <div className="map-overlay-top">
        <div className="pointcloud-info">
          <Box size={14} />
          <span>POINT CLOUD</span>
          <strong>{pointCount.toLocaleString()} POINTS</strong>
        </div>

        <div className="pointcloud-crosshair">
          <Crosshair size={16} />
        </div>
      </div>

      <div className="map-overlay-bottom">
        <button
          type="button"
          className="map-tool"
          onClick={onToggleGrid}
          aria-label={showGrid ? 'Hide grid' : 'Show grid'}
          title={showGrid ? 'Hide grid' : 'Show grid'}
        >
          <Grid2X2 size={15} />
        </button>

        <button
          type="button"
          className="map-tool"
          onClick={resetView}
          aria-label="Reset 3D view"
          title="Reset 3D view"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {loadError && (
        <div className="map-error" role="alert">
          {loadError}
        </div>
      )}
    </div>
  );
}
