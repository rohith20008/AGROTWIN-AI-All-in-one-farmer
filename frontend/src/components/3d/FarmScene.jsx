import { useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/* ---------- COLOR ---------- */
function getMoistureColor(value) {
  if (value > 75) return "#00ff66";
  if (value > 60) return "#ccff33";
  if (value > 40) return "#ff9933";
  if (value > 20) return "#ff3333";
  return "#663300";
}

/* ---------- DISTANCE ---------- */
function getDistance(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2);
}

/* ---------- BLENDED MOISTURE ---------- */
function getBlendedMoisture(pos, sensors) {
  let total = 0;
  let weightSum = 0;

  sensors.forEach((s) => {
    const dist = getDistance(pos, s.pos);
    const weight = 1 / (dist + 0.5); // smooth influence
    total += s.value * weight;
    weightSum += weight;
  });

  return total / weightSum;
}

/* ---------- CROP ---------- */
function Crop({ position, moisture }) {
  const ref = useRef();
  const color = getMoistureColor(moisture);

  useFrame((state) => {
    ref.current.rotation.y += 0.01;
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.15, 0.5, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}

/* ---------- SENSOR ---------- */
function SensorNode({ data, onClick }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    const scale = hovered ? pulse * 1.5 : pulse;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh
      ref={ref}
      position={data.pos}
      onClick={() => onClick(data)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial
        color={hovered ? "#ffffff" : data.color}
        emissive={data.alert ? "#ff0000" : data.color}
        emissiveIntensity={data.alert ? 5 : 2}
      />
    </mesh>
  );
}

/* ---------- SENSOR RADIUS ---------- */
function SensorRadius({ position, alert }) {
  const ref = useRef();

  useFrame((state) => {
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={ref} position={[position[0], 0.01, position[2]]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[0.5, 2, 32]} />
      <meshBasicMaterial
        color={alert ? "red" : "#00ffcc"}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

/* ---------- WATER WAVE ---------- */
function WaterWave({ position }) {
  const ref = useRef();

  useFrame((state) => {
    const scale = (Math.sin(state.clock.elapsedTime * 2) + 1.5);
    ref.current.scale.set(scale, scale, scale);
    ref.current.material.opacity = 0.3 / scale;
  });

  return (
    <mesh position={[position[0], 0.02, position[2]]} rotation={[-Math.PI/2,0,0]} ref={ref}>
      <ringGeometry args={[0.2, 0.3, 32]} />
      <meshBasicMaterial color="#00ccff" transparent />
    </mesh>
  );
}

/* ---------- DATA LINE ---------- */
function DataLine({ start, end }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];

  return (
    <Line
      points={points}
      color="#00ffcc"
      dashed
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

/* ---------- MAIN ---------- */
export default function FarmScene({ sensors, onSensorClick }) {

  const grid = useMemo(() => {
    const arr = [];
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        arr.push([x, 0, z]);
      }
    }
    return arr;
  }, []);

  return (
    <>
      {/* GROUND */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#050d12" />
      </mesh>

      {/* CROPS (BLENDED) */}
      {grid.map((pos, i) => {
        const moisture = getBlendedMoisture(pos, sensors);
        return <Crop key={i} position={pos} moisture={moisture} />;
      })}

      {/* SENSORS + RADIUS + WATER */}
      {sensors.map((s, i) => (
        <group key={i}>
          <SensorNode data={s} onClick={onSensorClick} />
          <SensorRadius position={s.pos} alert={s.alert} />
          <WaterWave position={s.pos} />
        </group>
      ))}

      {/* DATA FLOW */}
      {sensors.map((s, i) => (
        <DataLine
          key={i}
          start={s.pos}
          end={sensors[(i + 1) % sensors.length].pos}
        />
      ))}
    </>
  );
}