# AI Digital Twin Platform

## Development Environment

**All commands run inside Docker.** Do not run npm/node commands on the host.

```bash
# Build and start dev server
docker compose up --build

# Run npm commands inside container
docker compose exec app npm install <package>
docker compose exec app npm run build
docker compose exec app npx tsc --noEmit   # type check
```

- Dev server: http://localhost:5174 (host port mapped from container 5173)
- Container mounts project root for hot reload via Vite HMR

## Tech Stack

- React 18 + TypeScript
- Three.js + react-three-fiber (R3F) for 3D
- Zustand for state management
- Recharts for charts
- Tailwind CSS v4
- Vite build tool
- Docker for dev environment

## Project Structure

- `src/components/scene/` — R3F 3D components (equipment, effects, indicators)
- `src/components/dashboard/` — Dashboard monitoring panels
- `src/components/cockpit/` — Manual control interface (pumps, valves, dosing, filters)
- `src/components/layout/` — App layout with tab switching (Dashboard/Cockpit)
- `src/engine/simulation/` — Physics-based sensor simulation
- `src/engine/ai/` — AI agent system (anomaly detection, prediction, decisions)
- `src/engine/store/` — Zustand stores (simulation, sensor, agent, scene, control)
- `src/types/` — TypeScript type definitions
- `src/config/` — Plant layout, sensor config, scenario presets, tutorial steps
- `src/utils/` — Utility functions (math, colors, format)

## Key Architecture Decisions

- No backend — everything runs client-side
- Rule-based AI (deterministic, explainable)
- Procedural 3D geometry (no GLTF assets)
- Simulation time decoupled from wall time
- Three control modes: Auto (AI), Manual (human), Hybrid (AI suggests, human decides)
- Manual controls affect simulation via controlStore → SensorEngine integration
- Lucide icons: always use `LucideIcon` type for icon references, not `React.FC`

## Stores

- `simulationStore` — sim time, speed, scenario state, auto-demo
- `sensorStore` — 14 sensor states with ring buffer readings, health, anomaly scores
- `agentStore` — AI agent log, thinking state, cost tracking
- `sceneStore` — 3D selection, camera, labels, active panel (dashboard/cockpit)
- `controlStore` — control mode, pump/valve/dosing/filter controls, emergency stop, tutorial
