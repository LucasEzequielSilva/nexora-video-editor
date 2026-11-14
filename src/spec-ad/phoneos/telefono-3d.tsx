import { useLoader, useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { staticFile } from "remotion";
import { Box3, BufferAttribute, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PMREMGenerator, SRGBColorSpace, TextureLoader, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * iPhone 17 Pro de Ranguel (Sketchfab, CC BY 4.0: va el crédito en el post) con una captura real del panel como pantalla.
 * La malla "Display" trae UV de un atlas: se le arman UV nuevas desde su posición (es un plano) para que la captura entre
 * entera y derecha.
 */
const Modelo = ({ pantalla, rotacion, posicion, escala }: { pantalla: string; rotacion: [number, number, number]; posicion: [number, number, number]; escala: number }) => {
  const gltf = useLoader(GLTFLoader, staticFile("spec-ad/phoneos/iphone-17-pro.glb"));
  const textura = useLoader(TextureLoader, staticFile(pantalla));
  const { gl, scene } = useThree();
  useMemo(() => {
    if (scene.environment) return;
    const pmrem = new PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }, [gl, scene]);
  const envoltorio = useMemo(() => {
    textura.colorSpace = SRGBColorSpace;
    textura.anisotropy = 8;
    const obj = gltf.scene.clone(true);
    let display: Mesh | null = null;
    obj.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh) return;
      const mat = Array.isArray(m.material) ? m.material[0] : m.material;
      // El vidrio frontal tapa la pantalla con un reflejo gris: se saca.
      if (mat?.name === "Glass") m.visible = false;
      // Cuerpo en grafito: sobre el escenario negro el blanco del modelo se quema.
      const grafito: Record<string, string> = { Aluminum: "#2c2c31", Plastic_antena: "#1c1c20", Tint_back_glass: "#17171a", Frosted_glass: "#1f1f23" };
      if (mat && grafito[mat.name] && "color" in mat) {
        const nuevo = (mat as MeshStandardMaterial).clone();
        nuevo.color.set(grafito[mat.name]);
        nuevo.metalness = 0.85;
        nuevo.roughness = 0.32;
        m.material = nuevo;
      }
      if (mat?.name !== "Display") return;
      display = m;
      const geo = m.geometry.clone();
      const pos = geo.getAttribute("position");
      geo.computeBoundingBox();
      const bb = geo.boundingBox!;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
        uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
        // El cuerpo de aluminio llega a z 0.0042, delante de la pantalla (0.0035): se la pone apenas por encima.
        pos.setZ(i, 0.00445);
      }
      pos.needsUpdate = true;
      geo.setAttribute("uv", new BufferAttribute(uv, 2));
      m.geometry = geo;
      // Las caras de la pantalla miran hacia atrás en el modelo: doble cara para que se vea de frente.
      m.material = new MeshBasicMaterial({ map: textura, toneMapped: false, side: DoubleSide });
      m.renderOrder = 2;
    });
    // Centro y escala según la pantalla (la caja del modelo entero trae piezas lejos del teléfono).
    obj.updateMatrixWorld(true);
    const caja = new Box3().setFromObject(display ?? obj);
    const tam = caja.getSize(new Vector3());
    const centro = caja.getCenter(new Vector3());
    const k = 2 / Math.max(tam.x, tam.y, tam.z);
    const g = new Group();
    obj.position.copy(centro.multiplyScalar(-1));
    const interno = new Group();
    interno.add(obj);
    interno.scale.setScalar(k);
    g.add(interno);
    return g;
  }, [gltf, textura]);
  return <primitive object={envoltorio} rotation={rotacion} position={posicion} scale={escala} />;
};

export default function Telefono3D({
  ancho,
  alto,
  pantalla,
  rotacion,
  posicion = [0, 0, 0],
  escala = 1,
}: {
  ancho: number;
  alto: number;
  pantalla: string;
  rotacion: [number, number, number];
  posicion?: [number, number, number];
  escala?: number;
}) {
  return (
    <ThreeCanvas width={ancho} height={alto} camera={{ fov: 30, position: [0, 0, 5.4] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 5]} intensity={1.8} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color="#22c55e" />
      <Modelo pantalla={pantalla} rotacion={rotacion} posicion={posicion} escala={escala} />
    </ThreeCanvas>
  );
}
