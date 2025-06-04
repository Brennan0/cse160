 import * as THREE from 'three';
 import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
 import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
  
 function main(){
      const canvas = document.querySelector('#c');
      const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
      const fov = 75;
      const aspect = 2;  // the canvas default
      const near = 0.1;
      const far = 5;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.z = 2;
      const scene = new THREE.Scene();
      const boxWidth = 1;
      const boxHeight = 1;
      const boxDepth = 1;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
      // changes from MeshBasicMaterial to MeshPhongMaterial for lighting effects
      const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      renderer.render(scene, camera);
      const controls = new OrbitControls( camera, canvas );
	    controls.target.set( 0, 5, 0 );
	    controls.update();

      // animation with requestAnimationFrame
      function render(time){
        time *= 0.001;

        cubes.forEach((cube, ndx) => {
          const speed = 1 + ndx * .1;
          const rot = time * speed;
          cube.rotation.x = rot;
          cube.rotation.y = rot;
        })
        cube.rotation.x = time;
        cube.rotation.y = time;

        renderer.render(scene, camera);
        requestAnimationFrame(render);
      }

      requestAnimationFrame(render);

      // directional light
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, 2, 4);
      scene.add(light);

      function makeInstance(geometry, color, x){
        const material = new THREE.MeshPhongMaterial({color});

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
      }

      const cubes = [
        makeInstance(geometry, 0x44aa88, 0),
        //makeInstance(geometry, 0x8844aa, -2),
        //makeInstance(geometry, 0xaa8844, 2),
      ];


    }

    main();