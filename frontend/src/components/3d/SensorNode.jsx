function SensorNode({ position, color, onClick, name, value }) {
  const ref = useRef();

  useFrame((state) => {
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={() => onClick({ name, value })}
    >
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
}