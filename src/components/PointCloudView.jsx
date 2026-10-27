import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Box, Crosshair, Grid2X2, RotateCcw, Upload } from 'lucide-react';

function parseAsciiPcd(text) {
  const lines = text.split(/\r?\n/);
  let dataIndex = lines.findIndex((line) => /^DATA\s+/i.test(line.trim()));
  if (dataIndex < 0) throw new Error('Invalid PCD: missing DATA header.');
  const dataType = lines[dataIndex].trim().split(/\s+/)[1]?.toLowerCase();
  if (dataType !== 'ascii') throw new Error('This demo loader supports ASCII PCD files.');
  const fieldsLine = lines.find((line) => /^FIELDS\s+/i.test(line.trim()));
  const fields = fieldsLine ? fieldsLine.trim().split(/\s+/).slice(1).map((v) => v.toLowerCase()) : ['x', 'y', 'z'];
  const xi = fields.indexOf('x'); const yi = fields.indexOf('y'); const zi = fields.indexOf('z');
  const intensityIndex = fields.indexOf('intensity');
  if (xi < 0 || yi < 0 || zi < 0) throw new Error('PCD needs x, y and z fields.');
  const positions = []; const intensities = [];
  for (const line of lines.slice(dataIndex + 1)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const values = trimmed.split(/\s+/).map(Number);
    if (values.length <= Math.max(xi, yi, zi) || !Number.isFinite(values[xi] + values[yi] + values[zi])) continue;
    positions.push(values[xi], values[zi], -values[yi]);
    intensities.push(intensityIndex >= 0 ? Number(values[intensityIndex]) || 0 : 0.6);
  }
  if (!positions.length) throw new Error('No point records found in PCD.');
  return { positions, intensities };
}

export default function PointCloudView({ pcdFile, showGrid = true, onToggleGrid, colorMode = 'height', onStatus }) {
  const hostRef = useRef(null);
  const engineRef = useRef(null);
  const pointsRef = useRef(null);
  const gridRef = useRef(null);
  const [pointCount, setPointCount] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080d15');
    scene.fog = new THREE.FogExp2('#080d15', 0.012);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
    camera.position.set(18, 14, 19);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D point cloud map; drag to rotate and scroll to zoom');
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const keyLight = new THREE.PointLight(0x57e7df, 18, 100);
    keyLight.position.set(8, 18, 4);
    scene.add(keyLight);
    const grid = new THREE.GridHelper(40, 40, 0x254d5a, 0x172a35);
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    scene.add(grid);
    gridRef.current = grid;

    const axes = new THREE.AxesHelper(4);
    axes.material.transparent = true;
    axes.material.opacity = 0.85;
    scene.add(axes);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0, 1, 0);
    controls.minDistance = 5;
    controls.maxDistance = 65;
    controls.maxPolarAngle = Math.PI * 0.48;

    const resizeObserver = new ResizeObserver(() => {
      if (!host || disposed) return;
      const width = Math.max(host.clientWidth, 1); const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(host);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    engineRef.current = { scene, camera, renderer, controls, host };

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      if (pointsRef.current) {
        scene.remove(pointsRef.current);
        pointsRef.current.geometry.dispose();
        pointsRef.current.material.dispose();
        pointsRef.current = null;
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadError('');
        let contents;
        if (pcdFile) contents = await pcdFile.text();
        else {
          const response = await fetch('/data/warehouse-scan.pcd');
          if (!response.ok) throw new Error('Sample point cloud could not be loaded.');
          contents = await response.text();
        }
        const parsed = parseAsciiPcd(contents);
        if (cancelled) return;
        const engine = engineRef.current;
        if (!engine) return;
        if (pointsRef.current) {
          engine.scene.remove(pointsRef.current);
          pointsRef.current.geometry.dispose();
          pointsRef.current.material.dispose();
        }
        const geometry = new THREE.BufferGeometry();
        const positionArray = new Float32Array(parsed.positions);
        geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        const colors = new Float32Array(parsed.positions.length);
        for (let index = 0; index < parsed.positions.length / 3; index += 1) {
          const x = parsed.positions[index * 3]; const y = parsed.positions[index * 3 + 1]; const z = parsed.positions[index * 3 + 2];
          const c = new THREE.Color();
          if (colorMode === 'intensity') {
            const intensity = Math.max(0, Math.min(1, parsed.intensities[index]));
            c.setHSL(0.52 - intensity * 0.38, 0.9, 0.48 + intensity * 0.12);
          } else {
            const height = Math.max(0, Math.min(1, (y + 1) / 7));
            c.setHSL(0.48 - height * 0.32 + Math.min(Math.abs(x + z) / 100, 0.08), 0.82, 0.42 + height * 0.18);
          }
          colors[index * 3] = c.r; colors[index * 3 + 1] = c.g; colors[index * 3 + 2] = c.b;
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();
        const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.095, vertexColors: true, transparent: true, opacity: 0.94, sizeAttenuation: true }));
        engine.scene.add(points);
        pointsRef.current = points;
        setPointCount(parsed.positions.length / 3);
        onStatus?.(`${(parsed.positions.length / 3).toLocaleString()} points loaded`);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Could not read point cloud.';
          setLoadError(message);
          onStatus?.(`Load failed: ${message}`);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [pcdFile, colorMode, onStatus]);

  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = showGrid;
  }, [showGrid]);

  const resetView = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.camera.position.set(18, 14, 19);
    engine.controls.target.set(0, 1, 0);
    engine.controls.update();
  };

  return (
    <div className="pointcloud-wrap">
      <div className="pointcloud-canvas" ref={hostRef} />
      <div className="map-overlay map-overlay-top">
        <span className="map-coordinate"><Crosshair size={12} /> X +00.42 / Y -01.18 / Z +02.06</span>
        <span className="map-live-dot"><span /> SCAN ACTIVE</span>
      </div>
      <div className="map-overlay map-overlay-bottom">
        <span className="point-count"><i /> {pointCount.toLocaleString()} POINTS</span>
        <button type="button" className={`map-tool ${showGrid ? 'tool-active' : ''}`} onClick={onToggleGrid} title="Toggle map grid" aria-label="Toggle map grid" aria-pressed={showGrid}><Grid2X2 size={14} /></button>
        <button type="button" className="map-tool" onClick={resetView} title="Reset 3D view" aria-label="Reset 3D view"><RotateCcw size={14} /></button>
      </div>
      {loadError && <div className="map-error"><Box size={16} /><span>{loadError}</span></div>}
    </div>
  );
}
