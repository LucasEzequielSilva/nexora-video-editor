import { useLoader, useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { staticFile, useCurrentFrame } from "remotion";
import { Box3, Group, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type ModeloProps = { archivo: string; rotacion: [number, number, number] };

/**
 * Carga con useLoader (Suspense): el SuspenseLoader de ThreeCanvas frena el render hasta que el modelo está. Con una
 * carga propia (useEffect + setState) el cuadro se capturaba vacío: al renderizar, ThreeCanvas solo dibuja cuando cambia
 * el cuadro, no cuando cambia el estado.
 */
const Modelo = ({ archivo, rotacion }: ModeloProps) => {
  const gltf = useLoader(GLTFLoader, staticFile(archivo));
  const { gl, scene } = useThree();
  // Luz de estudio como entorno, antes del primer dibujo: sin esto los materiales metálicos de los .glb salen negros.
  useMemo(() => {
    if (scene.environment) return;
    const pmrem = new PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }, [gl, scene]);
  const envoltorio = useMemo(() => {
    const obj = gltf.scene.clone(true);
    const caja = new Box3().setFromObject(obj);
    const tam = caja.getSize(new Vector3());
    obj.position.sub(caja.getCenter(new Vector3()));
    const g = new Group();
    g.add(obj);
    g.scale.setScalar(2.2 / Math.max(tam.x, tam.y, tam.z));
    return g;
  }, [gltf]);
  return <primitive object={envoltorio} rotation={rotacion} />;
};

type Props = {
  /** Ruta en public/ (`PACKS/OBJETOS 3D/*.glb` copiado con `npm run recursos -- usar`). */
  archivo: string;
  /** Lado del lienzo en px (cuadrado). */
  lado: number;
  /** Vueltas por segundo alrededor del eje vertical. */
  giro?: number;
  /** Ángulo inicial (rad), para que cada objeto no arranque de frente igual. */
  anguloInicial?: number;
  inclinacion?: number;
};

/** Objeto 3D del pack girando despacio, centrado y escalado para llenar el lienzo; fondo transparente. */
export default function Objeto3D({ archivo, lado, giro = 0.12, anguloInicial = -0.5, inclinacion = 0.35 }: Props) {
  const frame = useCurrentFrame();
  return (
    <ThreeCanvas width={lado} height={lado} camera={{ fov: 30, position: [0, 0.4, 5.4] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1.8} />
      <Modelo archivo={archivo} rotacion={[inclinacion, anguloInicial + (frame / 30) * giro * Math.PI * 2, 0]} />
    </ThreeCanvas>
  );
}
