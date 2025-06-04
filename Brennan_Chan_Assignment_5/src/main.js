import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';


async function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const clock = new THREE.Clock();

  // Camera
	const fov = 45;
	const aspect = 2; 
	const near = 0.1;
	const far = 100000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 15, 60 );

  // Camera controls
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 7, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

  //Floor plane
	{
		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( '../assets/dunes.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
      roughness: 1000,
      metalness: 0,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
    // Shadows
    mesh.receiveShadow = true;
    mesh.position.set(0,1.1,0);
    mesh.scale.set(1.5,1,1.5);
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

  // Skybox
  {
    const loader = new GLTFLoader();
    loader.load( '../assets/nebula.glb', ( glb ) =>{

      const model = glb.scene;
      model.position.set( 0, 0, 0 );
      model.scale.set( 1, 1, 1);
      model.rotation.x = -10;
      model.rotation.y = -10;
      scene.add( model );

    }, undefined, ( error ) => {

      console.error( error );

    } );
  }

  // duck
  {

    const mtlLoader = new MTLLoader();
		mtlLoader.load( '../assets/bird/12250_Bird_v1_L3.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( '../assets/bird/12250_Bird_v1_L3.obj', ( root ) => {
        root.rotation.x = -Math.PI/2;
        root.rotation.z = -Math.PI/1.5;
        root.scale.set(0.45,0.45,0.45);
        root.position.set(12,1,-7);
				scene.add( root );

			} );

		} );
  }

  // cat
  {

    const mtlLoader = new MTLLoader();
		mtlLoader.load( '../assets/cat.mtl', ( mtl ) => {

			mtl.preload();
			const objLoader = new OBJLoader();
			objLoader.setMaterials( mtl );
			objLoader.load( '../assets/cat.obj', ( root ) => {
        root.rotation.x = -Math.PI/2;
        root.rotation.z = Math.PI/6;
        root.scale.set(0.25,0.25,0.25);
        root.position.set(-12,1,-7);
				scene.add( root );

			} );

		} );
  }

  // Bonsai tree
  {

    //const dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('../lib/draco/'); // draco decoder files
    const loader = new GLTFLoader();  
    //loader.setDRACOLoader(dracoLoader);
    
    loader.load( '../assets/bonsai.glb', ( glb ) =>{

      const model = glb.scene;
      model.position.set( 25, 1, -15 );
      model.scale.set( 15, 15, 15);
      model.castShadow = true;
      model.receiveShadow = true;
      model.rotation.y = Math.PI/1.15;
      scene.add( model );

    }, undefined, ( error ) => {

      console.error( error );

    } );
  }

  // Pen
  // Pen group with fire
const penGroup = new THREE.Group();

// Pen body
const penBody = new THREE.CylinderGeometry(0.05, 0.05, 3, 32);
const penMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const penMesh = new THREE.Mesh(penBody, penMaterial);
penMesh.rotation.z = Math.PI / 2;
penGroup.add(penMesh);

// Pen tip
const penTip = new THREE.ConeGeometry(0.06, 0.2, 32);
const tipMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const tipMesh = new THREE.Mesh(penTip, tipMaterial);
tipMesh.position.x = 1.6;
tipMesh.rotation.z = -Math.PI / 2;
penGroup.add(tipMesh);

// Tray
const trayGeo = new THREE.BoxGeometry( 3, 0.5, 1 );
const loader = new THREE.TextureLoader();
const texture = loader.load('../assets/rosewood.jpg');
texture.colorSpace = THREE.SRGBColorSpace;

const trayMat = new THREE.MeshPhongMaterial( { map: texture, shininess: 30 } );

const tray = new THREE.Mesh( trayGeo, trayMat );
tray.position.set(0,-0.325,0);
// Shadows
tray.castShadow = true;
tray.receiveShadow = true;
penGroup.add( tray );

// Fire effect
const fireMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.8 });
const fireGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const fire = new THREE.Mesh(fireGeometry, fireMaterial);
fire.position.x = 1.75;
penGroup.add(fire);

// Flicker function
function flicker() {
  fire.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2);
}

// Smoke effect
const smokeLoader = new THREE.TextureLoader();
const smokeTex = smokeLoader.load('../assets/smoke.png');
smokeTex.colorSpace = THREE.SRGBColorSpace;

const smokeMat = new THREE.PointsMaterial({
  map: smokeTex,
  transparent: true,
  depthWrite: false,
  size: 3,
  opacity: 0.5,
});

const smokeGeo = new THREE.BufferGeometry();
const smokeCount = 20;
const positions = [];

for (let i = 0; i < smokeCount; i++) {
  positions.push(
    1.75 + (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.1
  );
}
smokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
const smoke = new THREE.Points(smokeGeo, smokeMat);
//smoke.scale.set(2, 2, 2);
penGroup.add(smoke);

const velocities = new Array(smokeCount).fill().map(() => new THREE.Vector3(
  (Math.random() - 0.5) * 0.002,
  0.01 + Math.random() * 0.01,
  (Math.random() - 0.5) * 0.002
));

// Position pen on table
penGroup.scale.set(2,2,2);
penGroup.position.set(2, 1.75, 10);
penGroup.rotation.y = 3*Math.PI/4;
scene.add(penGroup);

// LOL
{
  const webGLGroup = new THREE.Group();
  // LOL
		const loader = new THREE.TextureLoader();
		const texture = loader.load( '../assets/webGL.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;

		const planeGeo = new THREE.PlaneGeometry( 7, 11 );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
      roughness: 1000,
      metalness: 0,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
    // Shadows
    mesh.receiveShadow = true;
    mesh.position.set(0,.28,0);
		mesh.rotation.x = Math.PI * - .5;
		webGLGroup.add( mesh );
    
    const backMat = new THREE.MeshPhongMaterial({ color: '#363636'});
    const pageMat = new THREE.MeshPhongMaterial({ color: 'beige'});

    const frontGeo = new THREE.BoxGeometry(7, 0.5, 11);
    const front = new THREE.Mesh(frontGeo, backMat);
    front.castShadow = true;
    front.receiveShadow = true;
    webGLGroup.add(front);

    const spineGeo = new THREE.BoxGeometry(0.3, 3, 11);
    const spine = new THREE.Mesh(spineGeo, backMat);
    spine.castShadow = true;
    spine.receiveShadow = true;
    spine.position.set(-3.5,-1.25,0);
    webGLGroup.add(spine);

    const pagesGeo = new THREE.BoxGeometry(6.5, 2.6, 10);
    const pages = new THREE.Mesh(pagesGeo, pageMat);
    pages.castShadow = true;
    pages.receiveShadow = true;
    pages.position.set(0,-1.25,0);
    webGLGroup.add(pages);

    const backGeo = new THREE.BoxGeometry(7, 0.5, 11);
    const back = new THREE.Mesh(backGeo, backMat);
    back.castShadow = true;
    back.receiveShadow = true;
    back.position.set(0,-2.5,0);
    webGLGroup.add(back);

    webGLGroup.position.set(12,4,6);
    webGLGroup.rotation.y = -Math.PI/12
    scene.add(webGLGroup);
}

  // Book
  {
  const bookGroup = new THREE.Group();
  
  // Materials
  const backMat = new THREE.MeshPhongMaterial({ color: '#363636'});
  const pageMat = new THREE.MeshPhongMaterial({ color: 'beige'});

  // back 
  const spineGeo = new THREE.BoxGeometry(15, 1, 10);
  const spine = new THREE.Mesh(spineGeo, backMat);
  spine.castShadow = true;
  spine.receiveShadow = true;
  bookGroup.add(spine);

  // Left page
  const leftGeo = new THREE.BoxGeometry(5, 2, 8);
  const left = new THREE.Mesh(leftGeo, pageMat);
  left.position.set(-2.7, 1, 0); // shift left
  //left.rotation.y = THREE.MathUtils.degToRad(10); // slight open angle
  left.castShadow = true;
  left.receiveShadow = true;
  bookGroup.add(left);

  // Left lower 1
  const leftLowGeo = new THREE.BoxGeometry(2, 1, 8);
  const leftLow = new THREE.Mesh(leftLowGeo, pageMat);
  leftLow.position.set(-5, 1, 0); // shift left
  //left.rotation.y = THREE.MathUtils.degToRad(10); // slight open angle
  leftLow.castShadow = true;
  leftLow.receiveShadow = true;
  bookGroup.add(leftLow);

  // Left lower 2
  const leftLow2Geo = new THREE.BoxGeometry(2, 0.6, 8);
  const leftLow2 = new THREE.Mesh(leftLow2Geo, pageMat);
  leftLow2.position.set(-5.7, 0.8, 0); // shift left
  //left.rotation.y = THREE.MathUtils.degToRad(10); // slight open angle
  leftLow2.castShadow = true;
  leftLow2.receiveShadow = true;
  bookGroup.add(leftLow2);

  // Right page
  const rightGeo = new THREE.BoxGeometry(5, 2, 8);
  const right = new THREE.Mesh(rightGeo, pageMat);
  right.position.set(2.7, 1, 0); // shift right
  //right.rotation.y = THREE.MathUtils.degToRad(-10); // slight open angle
  right.castShadow = true;
  right.receiveShadow = true;
  bookGroup.add(right);

  // right lower 1
  const rightLowGeo = new THREE.BoxGeometry(2, 1, 8);
  const rightLow = new THREE.Mesh(rightLowGeo, pageMat);
  rightLow.position.set(5, 1, 0); // shift left
  //left.rotation.y = THREE.MathUtils.degToRad(10); // slight open angle
  rightLow.castShadow = true;
  rightLow.receiveShadow = true;
  bookGroup.add(rightLow);

  // right lower 2
  const rightLow2Geo = new THREE.BoxGeometry(2, 0.6, 8);
  const rightLow2 = new THREE.Mesh(rightLow2Geo, pageMat);
  rightLow2.position.set(5.7, 0.8, 0); // shift left
  //left.rotation.y = THREE.MathUtils.degToRad(10); // slight open angle
  rightLow2.castShadow = true;
  rightLow2.receiveShadow = true;
  bookGroup.add(rightLow2);

  bookGroup.position.set(-10, 1.1, 10); // adjust as needed for your table
  bookGroup.rotation.y = Math.PI/8
  scene.add(bookGroup);
}

  // glass top
  {
    const cylGeo = new THREE.CylinderGeometry( 5, 5, 1, 32 );
    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/rosewood.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const cylMat = new THREE.MeshPhongMaterial( { map: texture } );
    const mesh = new THREE.Mesh( cylGeo, cylMat );
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
		mesh.position.set(-25,13,-15 );
		scene.add( mesh );
  }
  
  // glass cylinder
  let astronautGroup;
  {
    const glassGroup = new THREE.Group();
    scene.add(glassGroup);
    const glassMat = new THREE.MeshPhysicalMaterial({
    transmission: 1,
    opacity: 1,
    transparent: true,
    roughness: 0,
    metalness: 0,
    thickness: 0.05,
    ior: 1.45,
    clearcoat: 1,
    envMapIntensity: 1
    });

    const glassGeo = new THREE.CylinderGeometry(5, 5, 10, 32);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.castShadow = false;
    glassMesh.receiveShadow = true;

    glassGroup.add(glassMesh);

    // a small glowing cylinder inside the glass
    const bulbGeo = new THREE.CylinderGeometry( 0.75, 0.5, 0.67, 32 );
    const bulbMat = new THREE.MeshStandardMaterial({ emissive: 0xffffcc, emissiveIntensity: 10 });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = 5; // move bulb upward inside glass
    bulbMesh.castShadow = true;

    glassGroup.add(bulbMesh);

    // spotlight emitting from bulb
    const spot = new THREE.SpotLight(0xffee88, 100);
    spot.position.set(0, 0.5, 0);
    spot.target.position.set(0, -1, 0); // target above the glass
    spot.angle = Math.PI / 4;
    spot.penumbra = 0.5;
    spot.castShadow = true;
    glassGroup.add(spot);
    glassGroup.add(spot.target);
    

    // astronaut
    const loader = new GLTFLoader();
    loader.load( '../assets/Astronaut.glb', ( glb ) =>{

    astronautGroup = new THREE.Group();  // New group to act as pivot
    const astronaut = glb.scene;

    
    astronaut.position.set(0, -3, 0);

    astronaut.scale.set(1.5, 1.5, 1.5);
    astronaut.traverse((child) => {
    if (child.isMesh) {
      child.receiveShadow = true;
    }
    });

    astronautGroup.add(astronaut);
    glassGroup.add(astronautGroup);

    }, undefined, ( error ) => {

      console.error( error );

    } );

    glassGroup.position.set(-25, 7.5, -15);
  }
   // glass bottom
  {
    const cylGeo = new THREE.CylinderGeometry( 5, 2, 3, 32 );

    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/rosewood.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const cylMat = new THREE.MeshPhongMaterial( { map: texture } );
    const mesh = new THREE.Mesh( cylGeo, cylMat );
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
		mesh.position.set(-25,1,-15 );
		scene.add( mesh );
  }

  // tble legs
	{
                                            // top rad, bottom rad, height, radial seg
		const cylGeo = new THREE.CylinderGeometry( 5, 2, 30, 32 );

    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/rosewood.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const cylMat = new THREE.MeshPhongMaterial( { map: texture, shininess: 300 } );
    const mesh = new THREE.Mesh( cylGeo, cylMat );
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const leg1 = mesh.clone();
		leg1.position.set(-30,-15,20 );
		scene.add( leg1 );

    const leg2 = mesh.clone();
		leg2.position.set(-30,-15,-20 );
		scene.add( leg2 );

    const leg3 = mesh.clone();
		leg3.position.set(30,-15,20 );
		scene.add( leg3 );

    const leg4 = mesh.clone();
		leg4.position.set(30,-15,-20 );
		scene.add( leg4 );


	}

  // table top
  {
	
		const cubeGeo = new THREE.BoxGeometry( 70, 2, 50 );
    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/rosewood.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

		const cubeMat = new THREE.MeshPhongMaterial( { map: texture, shininess: 300 } );

		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set(0,0,0);
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
		scene.add( mesh );
	}

  // Earth
  let rotatingSphere;
	{

		const sphereRadius = 4;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );

    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/earth.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

		const sphereMat = new THREE.MeshPhongMaterial( { map: texture, shininess: 300} );
		rotatingSphere = new THREE.Mesh( sphereGeo, sphereMat );
		//mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
    rotatingSphere.position.set(0,10,-15);
    // Shadows
    rotatingSphere.rotation.z = -Math.PI/12;
    rotatingSphere.castShadow = true;
    rotatingSphere.receiveShadow = true;
		scene.add( rotatingSphere );

	}
  // Earth stand
  {
    const cylGeo = new THREE.CylinderGeometry( 2, 4, 2, 32 );
    const loader = new THREE.TextureLoader();
    const texture = loader.load('../assets/rosewood.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;

    const cylMat = new THREE.MeshPhongMaterial( { map: texture } );
    const mesh = new THREE.Mesh( cylGeo, cylMat );
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
		mesh.position.set(0,1,-15 );
		scene.add( mesh );
  }

	class ColorGUIHelper {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}

	}

	class DegRadHelper {

		constructor( obj, prop ) {

			this.obj = obj;
			this.prop = prop;

		}
		get value() {

			return THREE.MathUtils.radToDeg( this.obj[ this.prop ] );

		}
		set value( v ) {

			this.obj[ this.prop ] = THREE.MathUtils.degToRad( v );

		}

	}

	function makeXYZGUI( gui, vector3, name, onChangeFn ) {

		const folder = gui.addFolder( name );
		folder.add( vector3, 'x', - 100, 100 ).onChange( onChangeFn );
		folder.add( vector3, 'y', -100, 100 ).onChange( onChangeFn );
		folder.add( vector3, 'z', - 100, 100 ).onChange( onChangeFn );
		folder.open();

	}

  

  // Directional light
  {
    const color = '#ffdf87';
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-90, 20, -110);
    light.target.position.set(40, -2,0);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = -0.001;

    // Configure the shadow camera (important!)
    light.shadow.camera.left = -100;
    light.shadow.camera.right = 100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 200;
    scene.add(light);
    scene.add(light.target);
  }

  // Ambient light  
  {

		const color = 0xFFFFFF;
		const intensity = 0.7;
		const light = new THREE.AmbientLight( color, intensity );
		scene.add( light );

		//const gui = new GUI();
		//gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		//gui.add( light, 'intensity', 0, 5, 0.01 );

	}

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

	function render() {
    const time = clock.getDelta();
    const elapsed = clock.getElapsedTime();

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

    // earth rotation
    if (rotatingSphere){
      rotatingSphere.rotation.y += time * 0.5;
      rotatingSphere.position.y = 7 + (Math.sin(elapsed * 1.5) * 0.45);
    }

    // astronaut rotating
    if(astronautGroup){
      astronautGroup.rotation.z += time * 0.5;
    }

     flicker();

  const pos = smoke.geometry.attributes.position.array;
  for (let i = 0; i < smokeCount; i++) {
    let idx = i * 3;
    pos[idx] += velocities[i].x;
    pos[idx + 1] += velocities[i].y;
    pos[idx + 2] += velocities[i].z;

    // reset smoke when too high
    if (pos[idx + 1] > 2) {
      pos[idx] = 1.75 + (Math.random() - 0.5) * 0.1;
      pos[idx + 1] = 0;
      pos[idx + 2] = (Math.random() - 0.5) * 0.1;
    }
  }
  smoke.geometry.attributes.position.needsUpdate = true;

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
