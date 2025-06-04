import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
//import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const clock = new THREE.Clock();

  // Camera
	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
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
		//const repeats = planeSize / 2;
		//texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshStandardMaterial( {
			map: texture,
      roughness: 1000,
      metalness: 0,
			//side: THREE.DoubleSide,
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
    loader.load( '../assets/skyline.glb', ( glb ) =>{

      const model = glb.scene;
      model.position.set( 0, 0, 0 );
      model.scale.set( 0.1, 0.1, 0.1);
      scene.add( model );

    }, undefined, ( error ) => {

      console.error( error );

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
  {
    const cylGeo = new THREE.CylinderGeometry( 5, 5, 10, 32 );
    const cylMat = new THREE.MeshPhysicalMaterial( { 
      transmission: 1,
      thickness: 0.5,
      roughness: 0.015,
      envMap: 3
    } );
    const mesh = new THREE.Mesh( cylGeo, cylMat );
    // Shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;
		mesh.position.set(-25,7.5,-15 );
		scene.add( mesh );
  }
   // glass bottom
  {
    const cylGeo = new THREE.CylinderGeometry( 5, 2, 3, 32 );


    const cylMat = new THREE.MeshPhysicalMaterial( {
      color: 0xffd700,         // Rich gold color
      metalness: 1.0,          // Full metal
      roughness: 0.1,          // Low roughness = more shiny
      reflectivity: 0.8,       // High reflectivity
      clearcoat: 0.1,          // Optional: adds a glossy finish
      clearcoatRoughness: 0.05,

    } );
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

  
  // Spot Light
	{
		const color = 0xFFFFFF;
		const intensity = 1000;
		const light = new THREE.SpotLight( color, intensity );
		//light.position.set( 0, 10, 0 );
		//light.target.position.set( - 5, 0, 0 );
    light.position.set(-25,13,-15 );
		light.target.position.set(-25,1,-15);
		scene.add( light );
		scene.add( light.target );
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = -0.0001; // reduce shadow acne

		const helper = new THREE.SpotLightHelper( light );
		scene.add( helper );

		function updateLight() {

			light.target.updateMatrixWorld();
			helper.update();

		}

		updateLight();

		const gui = new GUI();
		gui.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		gui.add( light, 'intensity', 0, 250, 1 );
		gui.add( light, 'distance', 0, 40 ).onChange( updateLight );
		gui.add( new DegRadHelper( light, 'angle' ), 'value', 0, 90 ).name( 'angle' ).onChange( updateLight );
		gui.add( light, 'penumbra', 0, 1, 0.01 );

		makeXYZGUI( gui, light.position, 'position', updateLight );
		makeXYZGUI( gui, light.target.position, 'target', updateLight );

	}
   
  // Directional light
  {
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-50, 7, 17);
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
		const intensity = 0.3;
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

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();
