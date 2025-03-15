import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { SPHERE_RADIUS } from './utils';


export default function SphericalContainer() {
  const themeMode = useSelector((state: RootState) => state.mode.themeMode);
  const wallColor = themeMode === 'dark' ? '#333333' : '#e0e0e0';

  return (
    <mesh name="sphere">
      <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
      <meshStandardMaterial color={wallColor} transparent opacity={0.1} side={2} />
    </mesh>
  );
}
