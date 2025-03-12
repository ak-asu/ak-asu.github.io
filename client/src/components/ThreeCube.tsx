import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

// Constants
const CUBE_SIZE = 15; // Increased from 10
const BALL_RADIUS = 0.8; // Increased from 0.3
const NUM_BALLS = 4; // Reduced from 10
const ENERGY_LOSS = 0.25; // 1/4th energy loss on collision
const PUSH_FORCE_STRENGTH = 5;
const ANGER_FORCE_STRENGTH = 15;

// Social media URLs for the balls
const BALL_URLS = [
  'https://linkedin.com/in/yourprofile', // LinkedIn
  'https://github.com/yourusername', // GitHub
  'https://twitter.com/yourusername', // Twitter
  'https://yourportfolio.com' // Portfolio
];

// Colors corresponding to each social platform
const BALL_COLORS = [
  0x0077B5, // LinkedIn Blue
  0x333333, // GitHub Dark
  0x1DA1F2, // Twitter Blue
  0x6E5494  // Portfolio Purple
];

// Ball icons - texture paths
const BALL_ICONS = [
  '/images/linkedin-icon.png',
  '/images/github-icon.png',
  '/images/twitter-icon.png',
  '/images/portfolio-icon.png'
];

export const ThreeCube = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    world: CANNON.World;
    controls: OrbitControls;
    cube: THREE.Mesh;
    balls: THREE.Mesh[];
    ballBodies: CANNON.Body[];
    character: THREE.Group;
    characterBody: CANNON.Body;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    clock: THREE.Clock;
    selectedBall: THREE.Mesh | null;
    animationFrameId: number | null;
  } | null>(null);

  const { animationLevel } = useSelector((state: RootState) => state.mode);

  // Cleanup resources
  const cleanupScene = () => {
    if (sceneRef.current) {
      cancelAnimationFrame(sceneRef.current.animationFrameId!);
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      const renderer = sceneRef.current.renderer;
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      
      // Dispose resources
      sceneRef.current.balls.forEach(ball => {
        ball.geometry.dispose();
        if (ball.material instanceof THREE.Material) {
          ball.material.dispose();
        }
      });
      
      if (sceneRef.current.cube.geometry) {
        sceneRef.current.cube.geometry.dispose();
      }
      
      if (Array.isArray(sceneRef.current.cube.material)) {
        sceneRef.current.cube.material.forEach(material => material.dispose());
      } else if (sceneRef.current.cube.material) {
        sceneRef.current.cube.material.dispose();
      }
      
      sceneRef.current.renderer.dispose();
      
      // Clear container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(CUBE_SIZE * 1.5, CUBE_SIZE * 1.5, CUBE_SIZE * 1.5);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(CUBE_SIZE, CUBE_SIZE * 1.5, CUBE_SIZE);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Setup physics world
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0); // Zero gravity
    
    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Setup raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Initialize clock
    const clock = new THREE.Clock();
    
    // Create objects
    const cube = createCube(scene, world);
    const { balls, ballBodies } = createBalls(scene, world);
    const { character, characterBody } = createCharacter(scene, world);
    
    // Store references
    sceneRef.current = {
      scene,
      camera,
      renderer,
      world,
      controls,
      cube,
      balls,
      ballBodies,
      character,
      characterBody,
      raycaster,
      mouse,
      clock,
      selectedBall: null,
      animationFrameId: null
    };
    
    // Start animation loop
    const animate = () => {
      if (!sceneRef.current) return;
      
      const { 
        scene, camera, renderer, world, controls, 
        balls, ballBodies, character, characterBody, clock 
      } = sceneRef.current;
      
      const deltaTime = Math.min(clock.getDelta(), 0.1);
      
      // Update physics world
      world.step(1/60, deltaTime);
      
      // Update ball positions
      for (let i = 0; i < balls.length; i++) {
        balls[i].position.copy(ballBodies[i].position as any);
        balls[i].quaternion.copy(ballBodies[i].quaternion as any);
        
        // Make the icon face the camera (billboard effect)
        if (balls[i].userData.icon) {
          // Get the direction from ball to camera
          const ballToCamera = new THREE.Vector3().subVectors(camera.position, balls[i].position).normalize();
          
          // Apply quaternion to make icon face the camera
          balls[i].userData.icon.quaternion.setFromRotationMatrix(
            new THREE.Matrix4().lookAt(ballToCamera, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0))
          );
        }
      }
      
      // Update character position
      character.position.copy(characterBody.position as any);
      
      // Update controls
      controls.update();
      
      // Render scene
      renderer.render(scene, camera);
      
      sceneRef.current.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup on unmount
    return cleanupScene;
  }, []);

  // Event handlers
  const handleResize = () => {
    if (!sceneRef.current || !containerRef.current) return;
    
    const { camera, renderer } = sceneRef.current;
    camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
  };

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    
    if (!sceneRef.current || !containerRef.current) return;
    
    const { raycaster, mouse, scene, balls, ballBodies, cube } = sceneRef.current;
    
    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position in normalized coordinates (-1 to +1)
    mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, sceneRef.current.camera);
    
    // Check for intersection with balls
    const intersects = raycaster.intersectObjects(balls);
    
    if (intersects.length > 0) {
      // Handle ball click
      sceneRef.current.selectedBall = intersects[0].object as THREE.Mesh;
      const ballIndex = balls.indexOf(sceneRef.current.selectedBall);
      
      // Make the ball angry and apply force if clicked
      sceneRef.current.selectedBall.userData.isAngry = true;
      const ballBody = ballBodies[ballIndex];
      
      // Apply outward force from the center
      const direction = new CANNON.Vec3().copy(ballBody.position);
      direction.normalize();
      direction.scale(ANGER_FORCE_STRENGTH);
          
      ballBody.applyImpulse(direction, ballBody.position);
      
      // Create force effect
      createForceEffect(
        sceneRef.current.selectedBall.position.clone(),
        true,
        scene,
        sceneRef.current.clock
      );
      
      // Change color to indicate anger
      if (sceneRef.current.selectedBall.material instanceof THREE.MeshStandardMaterial) {
        sceneRef.current.selectedBall.material.emissiveIntensity = 0.8;
        sceneRef.current.selectedBall.material.emissive = new THREE.Color(0xff0000);
      }
      
      // Navigate to the associated URL after a short visual effect
      if (sceneRef.current.selectedBall.userData.url) {
        setTimeout(() => {
          window.open(sceneRef.current?.selectedBall?.userData.url, '_blank', 'noopener,noreferrer');
        }, 300);
      }
      
      // Reset after a short time
      setTimeout(() => {
        if (sceneRef.current && sceneRef.current.selectedBall) {
          sceneRef.current.selectedBall.userData.isAngry = false;
          
          if (sceneRef.current.selectedBall.material instanceof THREE.MeshStandardMaterial) {
            sceneRef.current.selectedBall.material.emissiveIntensity = 0.2;
            sceneRef.current.selectedBall.material.emissive = new THREE.Color(
              sceneRef.current.selectedBall.material.color
            );
          }
        }
      }, 1000);
    } else {
      // Check for intersection with cube interior
      const intersectCube = raycaster.intersectObject(cube);
      
      if (intersectCube.length > 0) {
        const hitPoint = intersectCube[0].point;
        
        // Create a force effect at click point
        createForceEffect(
          hitPoint,
          false,
          scene,
          sceneRef.current.clock
        );
        
        // Apply forces to all balls away from the hit point
        for (let i = 0; i < ballBodies.length; i++) {
          const ballBody = ballBodies[i];
          
          // Calculate direction from hit point to ball
          const direction = new CANNON.Vec3()
            .copy(ballBody.position)
            .vsub(new CANNON.Vec3(hitPoint.x, hitPoint.y, hitPoint.z));
          
          // Calculate distance
          const distance = direction.norm();
          
          // Normalize and scale force by distance (closer = stronger)
          if (distance > 0) {
            direction.normalize();
            const forceMagnitude = PUSH_FORCE_STRENGTH * (1 / Math.max(0.5, distance));
            direction.scale(forceMagnitude);
            
            ballBody.applyImpulse(direction, ballBody.position);
          }
        }
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!sceneRef.current || !containerRef.current) return;
    
    const { raycaster, mouse, cube, character } = sceneRef.current;
    
    // Get container bounds
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position in normalized coordinates (-1 to +1)
    mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
    
    // If we're dragging a ball, update its velocity
    if (sceneRef.current.selectedBall) {
      raycaster.setFromCamera(mouse, sceneRef.current.camera);
      const intersectCube = raycaster.intersectObject(cube);
      
      if (intersectCube.length > 0) {
        const hitPoint = intersectCube[0].point;
        const ballIndex = sceneRef.current.balls.indexOf(sceneRef.current.selectedBall);
        
        if (ballIndex !== -1) {
          const ballBody = sceneRef.current.ballBodies[ballIndex];
          
          // Set velocity in the direction of mouse movement
          const direction = new CANNON.Vec3(
            hitPoint.x - ballBody.position.x,
            hitPoint.y - ballBody.position.y,
            hitPoint.z - ballBody.position.z
          );
          
          // Scale based on distance
          const speed = Math.min(direction.norm() * 5, 15);
          direction.normalize();
          direction.scale(speed);
          
          ballBody.velocity.copy(direction);
        }
      }
    }
    
    // Update character's head orientation to follow cursor
    raycaster.setFromCamera(mouse, sceneRef.current.camera);
    const intersectCube = raycaster.intersectObject(cube);
    
    if (intersectCube.length > 0 && character) {
      const hitPoint = intersectCube[0].point;
      
      // Make the character look at the cursor position
      character.lookAt(hitPoint);
    }
  };

  const handleMouseUp = () => {
    if (sceneRef.current) {
      sceneRef.current.selectedBall = null;
    }
  };

  return (
    <div className="w-full h-[600px] relative">
      <div ref={containerRef} className="w-full h-full"></div>
      <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded text-sm max-w-[250px] pointer-events-none">
        <p>Click on the colored balls to visit my profiles</p>
      </div>
    </div>
  );
};

// Helper functions

function createCube(scene: THREE.Scene, world: CANNON.World): THREE.Mesh {
  const cubeGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
  
  // Create materials for each face of the cube
  const materials = [];
  
  // All faces except bottom are mirror-like and transparent
  for (let i = 0; i < 6; i++) {
    if (i === 2) { // Bottom face (assuming Y-up)
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide
      }));
    } else {
      materials.push(new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.05,
        transparent: true,
        opacity: 0.3,
        reflectivity: 1.0,
        side: THREE.DoubleSide
      }));
    }
  }
  
  const cube = new THREE.Mesh(cubeGeometry, materials);
  cube.receiveShadow = true;
  scene.add(cube);
  
  // Invert the faces for proper rendering of the interior
  cube.geometry.scale(-1, 1, 1);
  
  // Add physics for each wall of the cube
  const halfSize = CUBE_SIZE / 2;
  
  // Create planes for each face of the cube
  createBoundaryPlane(new CANNON.Vec3(0, -halfSize, 0), new CANNON.Vec3(0, 1, 0), world);
  createBoundaryPlane(new CANNON.Vec3(0, halfSize, 0), new CANNON.Vec3(0, -1, 0), world);
  createBoundaryPlane(new CANNON.Vec3(-halfSize, 0, 0), new CANNON.Vec3(1, 0, 0), world);
  createBoundaryPlane(new CANNON.Vec3(halfSize, 0, 0), new CANNON.Vec3(-1, 0, 0), world);
  createBoundaryPlane(new CANNON.Vec3(0, 0, -halfSize), new CANNON.Vec3(0, 0, 1), world);
  createBoundaryPlane(new CANNON.Vec3(0, 0, halfSize), new CANNON.Vec3(0, 0, -1), world);
  
  return cube;
}

function createBoundaryPlane(position: CANNON.Vec3, normal: CANNON.Vec3, world: CANNON.World): void {
  const planeShape = new CANNON.Plane();
  const planeBody = new CANNON.Body({ mass: 0 });
  planeBody.addShape(planeShape);
  planeBody.quaternion.setFromVectors(new CANNON.Vec3(0, 1, 0), normal);
  planeBody.position.copy(position);
  world.addBody(planeBody);
}

function createBalls(scene: THREE.Scene, world: CANNON.World) {
  const balls: THREE.Mesh[] = [];
  const ballBodies: CANNON.Body[] = [];
  
  // Load texture loader
  const textureLoader = new THREE.TextureLoader();
  
  for (let i = 0; i < NUM_BALLS; i++) {
    const radius = BALL_RADIUS;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    
    // Create materials for the ball
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: BALL_COLORS[i],
      metalness: 0.3,
      roughness: 0.4,
      emissive: BALL_COLORS[i],
      emissiveIntensity: 0.2
    });
    
    // Create a ball with the base material
    const ball = new THREE.Mesh(geometry, baseMaterial);
    ball.castShadow = true;
    ball.userData = { 
      isAngry: false,
      url: BALL_URLS[i]
    };
    
    // Create a separate mesh for the icon that always faces the camera
    try {
      const iconTexture = textureLoader.load(BALL_ICONS[i], undefined, undefined, error => {
        console.warn(`Failed to load texture for ball ${i}:`, error);
      });
      
      // Create a plane geometry for the icon
      const iconSize = radius * 1.2;
      const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
      const iconMaterial = new THREE.MeshBasicMaterial({ 
        map: iconTexture, 
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      
      const icon = new THREE.Mesh(iconGeometry, iconMaterial);
      
      // Position the icon slightly in front of the ball's surface
      icon.position.set(0, 0, radius * 1.01);
      
      // Add the icon to the ball
      ball.add(icon);
      
      // Store the icon reference for billboard effect
      ball.userData.icon = icon;
    } catch (error) {
      console.error(`Error creating icon for ball ${i}:`, error);
    }
    
    scene.add(ball);
    balls.push(ball);
    
    // Create physics body for the ball
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        (Math.random() - 0.5) * CUBE_SIZE * 0.6,
        (Math.random() - 0.5) * CUBE_SIZE * 0.6,
        (Math.random() - 0.5) * CUBE_SIZE * 0.6
      ),
      shape: shape,
      linearDamping: 0.05 // Increased damping to slow balls down over time
    });
    
    // Apply initial velocity
    body.velocity.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 8
    );
    
    // Handle collision energy loss
    body.addEventListener('collide', handleCollision);
    
    world.addBody(body);
    ballBodies.push(body);
  }
  
  return { balls, ballBodies };
}

function handleCollision(this: CANNON.Body, event: any) {
  // Apply energy loss on collision
  const velocity = this.velocity;
  velocity.x *= (1 - ENERGY_LOSS);
  velocity.y *= (1 - ENERGY_LOSS);
  velocity.z *= (1 - ENERGY_LOSS);
  
  // Add minimum velocity to ensure balls keep moving
  const minSpeed = 0.5;
  const currentSpeed = velocity.norm();
  
  if (currentSpeed < minSpeed) {
    velocity.normalize();
    velocity.scale(minSpeed);
  }
}

function createCharacter(scene: THREE.Scene, world: CANNON.World) {
  // Create a spherical body for the character
  const radius = 0.7;
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.3,
    roughness: 0.6
  });
  
  const character = new THREE.Group();
  
  // Create the main body
  const body = new THREE.Mesh(geometry, material);
  body.castShadow = true;
  character.add(body);
  
  // Add eyes
  const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.25, 0.2, 0.5);
  character.add(leftEye);
  
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.25, 0.2, 0.5);
  character.add(rightEye);
  
  // Add the character to the scene
  character.position.set(0, 0, 0);
  scene.add(character);
  
  // Create physics body for the character
  const shape = new CANNON.Sphere(radius);
  const characterBody = new CANNON.Body({
    mass: 0,  // Make it static
    position: new CANNON.Vec3(0, 0, 0),
    shape: shape
  });
  world.addBody(characterBody);
  
  return { character, characterBody };
}

function createForceEffect(position: THREE.Vector3, isAnger: boolean, scene: THREE.Scene, clock: THREE.Clock) {
  const geometry = new THREE.SphereGeometry(0.1, 16, 16);
  const material = new THREE.MeshBasicMaterial({ 
    color: isAnger ? 0xff0000 : 0x00ffff, 
    transparent: true, 
    opacity: 0.7 
  });
  
  const effect = new THREE.Mesh(geometry, material);
  effect.position.copy(position);
  scene.add(effect);
  
  // Animation parameters
  const duration = 0.5;  // seconds
  const startTime = clock.getElapsedTime();
  const maxScale = isAnger ? 3 : 1.5;
  
  // Create the animation
  function animateEffect() {
    const elapsedTime = clock.getElapsedTime() - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Scale up and fade out
    const scale = maxScale * progress;
    effect.scale.set(scale, scale, scale);
    effect.material.opacity = 0.7 * (1 - progress);
    
    if (progress < 1) {
      requestAnimationFrame(animateEffect);
    } else {
      scene.remove(effect);
      geometry.dispose();
      material.dispose();
    }
  }
  
  animateEffect();
}
