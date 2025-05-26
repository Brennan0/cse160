// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -3) {                // Use normal map
      gl_FragColor = vec4(v_Normal+1.0/2.0,1.0);                  // Use normal color

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                         // Use color

    } else if (u_whichTexture == -1){                     // Use UV debug color
      gl_FragColor = vec4(v_UV,1,1);

    } else if (u_whichTexture == 0){                      // Use texture0
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1){                      // All Grass
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else {                                              // Error, put pink
      gl_FragColor = vec4(1,0.25,0.8,1);  
    }

  }`

// Global vars
let canvas;
let gl;
let a_Position;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
    
  // Get the storage location of u_Sampler
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

 u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Get the storage location of u_Sampler
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }


  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}
// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const LINE = 3;

// Globals for UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_selectedSeg = 10;
let g_selectedRot = 0;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_mouseDown = false;
let g_lastX = 0;

let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_normalOn = false;

// Set up actions for ther HTML UI elements
function addAllActionsForHtmlUI(){

  document.getElementById('normalON').onclick = function() {g_normalOn = true;};
  document.getElementById('normalOFF').onclick = function() {g_normalOn = false;};
  document.getElementById('yellowOnButton').onclick = function() {g_yellowAnimation = true;}
  document.getElementById('yellowOffButton').onclick = function() {g_yellowAnimation = false;}

  document.getElementById('magOnButton').onclick = function() {g_magentaAnimation = true;}
  document.getElementById('magOffButton').onclick = function() {g_magentaAnimation = false;}
  // size slider events
  //document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderScene(); });

  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderScene(); });
  //document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); });
}

function initTextures() {
  var image0 = new Image();  // Create the image object
  if (!image0) {
    console.log('Failed to create the image1 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendImageToTEXTURE0(image0); };
  // Tell the browser to load an image
  image0.src = 'creeper.jpg';

  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = 'grassBlockSq.jpg';
  
  // Add more texture loading
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
}

function onMove(){
  canvas.onmousedown = function(ev) {
    g_mouseDown = true;
    g_lastX = ev.clientX;
    }
  
  canvas.onmouseup = function(ev) {
    g_mouseDown = false;
  };
  
  canvas.onmousemove = function(ev) {
    if (g_mouseDown) {
      const dx = ev.clientX - g_lastX;
      g_lastX = ev.clientX;

      const alpha = dx * 0.4;
      g_camera.panLeft(-alpha);

      renderScene();
    }
  };
}

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addAllActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = click;
  //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  document.onkeydown = keydown;
  onMove();
  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);;

  updateAnimationAngles();

  renderScene();

  requestAnimationFrame(tick);
}

var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; // The array to store the size of a point

let start = null;

function convertCoordinates(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function updateAnimationAngles(){
  if (g_yellowAnimation){
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(5 * g_seconds));
  }
}

// can replace with vector class from asgn0
var g_eye = [0,0,3];
var g_at = [0,0, -100];
var g_up = [0,1,0];

function keydown(ev){
  if (ev.keyCode == 87){ // W
    g_camera.moveForward();
    //g_eye[2] -= 0.2;
  } else if (ev.keyCode == 65){ // A
    g_camera.moveLeft();
    //g_eye[0] -= 0.2;
  } else if (ev.keyCode == 83){ // S
    g_camera.moveBack();
    //g_eye[2] += 0.2;
  } else if (ev.keyCode == 68){ // D
    g_camera.moveRight();
    //g_eye[0] += 0.2;
  } else if (ev.keyCode == 81){ // Q
    g_camera.panLeft(5);
  } else if (ev.keyCode == 69){ // E
    g_camera.panRight(5);
  } else if (ev.keyCode == 70){
    g_camera.addBlock();
  } else if (ev.keyCode == 71){
    g_camera.deleteBlock();
  }

  renderScene();
}


var g_camera = new Camera();
var g_map = [
[2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0
],
[0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0
],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0
],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0
],
[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 2, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 5, 3, 1, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 4, 2, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 1, 2, 3, 3, 2, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0
],
[1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2,
 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
],
];
/*
var g_map = [
[1, 1, 1, 1, 1, 1, 1, 1, 1],
[0, 1, 0, 0, 0, 1, 0, 0, 0],
[1, 0, 0, 0, 0, 1, 0, 0, 1],
[1, 0, 0, 0, 1, 0, 0, 0, 1],
[1, 0, 0, 0, 0, 0, 0, 1, 0],
[1, 1, 1, 1, 0, 0, 1, 0, 0],
[1, 0, 0, 0, 0, 0, 1, 0, 1],
[1, 0, 0, 0, 0, 0, 1, 0, 1],
[1, 1, 1, 1, 1, 1, 1, 1, 1],

];*/

function drawMap(){
  var wall = new Cube();
  //var wall2 = new Cube();
  for(x=0; x<32; x++){
    for(y=0;y<32;y++){
      let n = g_map[x][y];
      for(z=0;z<n;z++){
        wall.color = [1,1,1,1];
        wall.textureNum = 1;
        wall.matrix.scale(1,1,1);
        wall.matrix.setTranslate(x-16, z - 0.75, y-16);
        wall.renderFaster();
      }
    }

  }
}

function renderScene(){

  // check the time at the start of this function
  var startTime = performance.now();
  /*
  // Pass the projection matrix
  //g_camera.passProj();
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 1000); // degrees, aspect ratio, near plane, far plane
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  //g_camera.passView();
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  */

  
  // Pass the projection matrix
  //g_camera.passProj();
  //var projMat = new Matrix4();
  g_camera.projMat.setPerspective(60, canvas.width/canvas.height, 1, 100); // degrees, aspect ratio, near plane, far plane
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMat.elements);

  // Pass the view matrix
  //g_camera.passView();
  //var viewMat = new Matrix4();
  g_camera.viewMat.setLookAt(
    g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2],
    g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],
    g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]
  ); // (eye, at, up);
  /*
  g_camera.viewMat.setLookAt(
    g_eye[0], g_eye[1], g_eye[2],
    g_at[0], g_at[1], g_at[2],  
    g_up[0], g_up[1], g_up[2]); // (eye, at, up)
  */
  gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMat.elements);
  

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a test triangle
  //drawTriangle3D([-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]);

  // Draw floor
  var floor = new Cube();
  floor.color = [1,0,0,1];
  floor.textureNum = 1;
  floor.matrix.translate(0,-0.75, 0);
  floor.matrix.scale(32,0,32);
  floor.matrix.translate(-.5,0,-.5);
  floor.render();

  //drawMap();
  var ball = new Sphere();
  //ball.color = [0,1,0,1];
  //ball.textureNum = -1;
  if (g_normalOn){
    ball.textureNum = -3;
  }
  ball.matrix.setTranslate(0,0,0);
  ball.matrix.scale(0.5,0.5,0.5);
  ball.render();
  // Draw sky
  var sky = new Cube();
  sky.color = [.8,.9,1,1];
  if (g_normalOn){
    sky.textureNum = -3;
  }else{
    sky.textureNum = -2;
  }
  sky.matrix.scale(-8,-8,-8);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.renderFaster();

  // Draw the body cube
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  if (g_normalOn){
    body.textureNum = -3;
  }else{
    body.textureNum = -2;
  }
  body.matrix.translate(-0.25,-.75,-.5);
  body.matrix.rotate(0,1,0,0);
  body.matrix.scale(0.5,0.3,0.5);
  body.renderFaster();

  // Draw left arm
  var yellow = new Cube();
  yellow.color = [1,1,0,1];
  if (g_normalOn){
    yellow.textureNum = -3;
  }else{
    yellow.textureNum = -2;
  }
  yellow.matrix.setTranslate(0,-.7,-.4);
  yellow.matrix.rotate(0,1,0,0);
  //yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  /*
  if (g_yellowAnimation){
    yellow.matrix.rotate(45*Math.sin(g_seconds), 0,0,1);
  } else {
    yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  }
  */
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25,.5,.25);
  yellow.matrix.translate(-.5,0,0);
  yellow.renderFaster();

  var magenta = new Cube();
  magenta.color = [1,0,1,1];
  if (g_normalOn){
    magenta.textureNum = -3;
  }else{
    magenta.textureNum = -2;
  }
  magenta.matrix = yellowCoordinatesMat; //translate(-.1,.1,0,0);
  magenta.matrix.translate(0,0.5,0);
  magenta.matrix.rotate(0,1,0,0);
  //magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(.4,.4,.4);
  magenta.matrix.translate(-.5,0,-0.001);
  magenta.renderFaster();

  var eye1Coord = new Matrix4(magenta.matrix);
  var eye1 = new Cube();
  eye1.textureNum = -2;
  eye1.color = [0,0,0,1.0];
  eye1.matrix = eye1Coord;

  eye1.matrix.rotate(270,1,0,0)
  eye1.matrix.translate(0,-1.13,.5);
  eye1.matrix.scale(.2,.1,.2);
  eye1.renderFaster();

  eye1.matrix.translate(4,0,0);
  eye1.renderFaster();

  eye1.matrix.translate(-3,0,-2);
  eye1.matrix.scale(3,1,.5);
  eye1.renderFaster();

  drawAnimal();

  var duration = performance.now() - startTime;

  sendTextToHTML("ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration)/10 + " orientation: " + g_selectedRot * 90, "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
let g_wholeAngle = 0;

let g_headAngle = 0;

let g_shoulderAngle = 0;

let g_legAngle = 0;


let g_footAngle = 0;


function drawAnimal(){
  // Draw Body section 1 --------------------------------------------------------------------------
  var b1 = new Cube();
  b1.color = [.5,.4,.3,1.0];
  b1.matrix.textureNum = -2;
  b1.matrix.translate(2 - 0.005 * - g_yellowAngle,-.4 - 0.009 * Math.abs(g_yellowAngle),-4);
  //b1.matrix.translate(-0.25,-.6,-4);
  b1.matrix.rotate(g_wholeAngle/4,0,1,0);
  b1.matrix.rotate(180,0,1,0);
  b1.matrix.scale(0.5,0.3,.3);
  var b1Coord = new Matrix4(b1.matrix);
  //b1.render();
  b1.drawCube(b1.matrix,[.5,.4,.3,1.0]);


  var shoulder1 = new Matrix4(b1.matrix);
  
  var fleg1 = new Cube();
  fleg1.color = [.6,.55,.4,1.0];
  fleg1.matrix = shoulder1;
  fleg1.matrix.translate(1,.1,0.3);
  /*if(g_pokeAnimation){
    fleg1.matrix.rotate(g_shoulderAngle,1,0,0);
  }else{*/
  fleg1.matrix.rotate(g_shoulderAngle/4,0,0,1);
  //}
  fleg1.matrix.scale(0.3,0.3,.3);
  var fleg1Coord = new Matrix4(fleg1.matrix);
  //fleg1.render();
  fleg1.drawCube(fleg1.matrix,[.6,.55,.4,1.0]);

  var fleg1a = new Cube();
  fleg1a.color = [.6,.55,.4,1.0];
  fleg1a.matrix = fleg1Coord;
  fleg1a.matrix.translate(.5,.01,0.25);
  fleg1a.matrix.rotate(-90,0,0,1);
  fleg1a.matrix.rotate(g_legAngle/3,0,1,0);
  fleg1a.matrix.scale(1.5,.4,.5);
  var fleg1aCoord = new Matrix4(fleg1a.matrix);
  //fleg1a.render();
  fleg1a.drawCube(fleg1a.matrix,[.6,.55,.4,1.0]);

  var foot1 = new Cube();
  foot1.color = [.6,.55,.4,1.0];
  foot1.matrix = fleg1aCoord;
  foot1.matrix.translate(.8,-.2,.9);
  foot1.matrix.rotate(90,0,1,0);
  foot1.matrix.rotate(g_footAngle/7,0,1,0);
  foot1.matrix.scale(2.5,2,.3);
  //foot1.render();
  foot1.drawCube(foot1.matrix,[.6,.55,.4,1.0]);

  var shoulder2 = new Matrix4(b1.matrix);
  
  var fleg2 = new Cube();
  fleg2.color = [.6,.55,.4,1.0];
  fleg2.matrix = shoulder2;
  fleg2.matrix.translate(-.3,.1,0.3);

  /*if(g_pokeAnimation){
    fleg2.matrix.rotate(-g_shoulderAngle,1,0,0);
  }else{*/
  fleg2.matrix.rotate(-g_shoulderAngle/4,0,0,1);
  //}
  fleg2.matrix.scale(0.3,0.3,.3);
  var fleg2Coord = new Matrix4(fleg2.matrix);
  //fleg2.render();
  fleg2.drawCube(fleg2.matrix,[.6,.55,.4,1.0]);

  var fleg2a = new Cube();
  fleg2a.color = [.6,.55,.4,1.0];
  fleg2a.matrix = fleg2Coord;
  fleg2a.matrix.translate(0.08,.01,0.25);
  fleg2a.matrix.rotate(-90,0,0,1);
  fleg2a.matrix.rotate(-g_legAngle/3,0,1,0);
  fleg2a.matrix.scale(1.5,.4,.5);
  var fleg2aCoord = new Matrix4(fleg2a.matrix);
  //fleg2a.render();
  fleg2a.drawCube(fleg2a.matrix,[.6,.55,.4,1.0]);

  var foot2 = new Cube();
  foot2.color = [.6,.55,.4,1.0];
  foot2.matrix = fleg2aCoord;
  foot2.matrix.translate(.8,-.8,.9);
  foot2.matrix.rotate(90,0,1,0);
  foot2.matrix.rotate(g_footAngle/7,0,1,0);
  foot2.matrix.scale(2.5,2,.3);
  //foot2.render();
  foot2.drawCube(foot2.matrix,[.6,.55,.4,1.0]);

  var spikeCoord1 = new Matrix4(b1.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  //s1.render();
  s1.drawPyr(s1.matrix, [.85,.75,.5,1.0]);

  var spikeCoord2 = new Matrix4(b1.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  //s2.render();
  s2.drawPyr(s2.matrix, [.85,.75,.5,1.0]);

  var spikeCoord3 = new Matrix4(b1.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  //s3.render();
  s3.drawPyr(s3.matrix, [.85,.75,.5,1.0]);

  var spikeCoord4 = new Matrix4(b1.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  //s4.render();
  s4.drawPyr(s4.matrix, [.85,.75,.5,1.0]);


  // Draw Body section 2 --------------------------------------------------------------------------
  var b2 = new Cube();
  b2.color = [.5,.4,.3,1.0];
  b2.matrix = b1Coord;
  b2.matrix.translate(0.1,0,1);
  b2.matrix.rotate(-g_wholeAngle/3,0,1,0);
  b2.matrix.scale(.8,.9,1);
  var b2Coord = new Matrix4(b2.matrix);
  //b2.render();
  b2.drawCube(b2.matrix,[.5,.4,.3,1.0]);

  var spikeCoord1 = new Matrix4(b2.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  //s1.render();
  s1.drawPyr(s1.matrix, [.85,.75,.5,1.0]);

  var spikeCoord2 = new Matrix4(b2.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  //s2.render();
  s2.drawPyr(s2.matrix, [.85,.75,.5,1.0]);

  var spikeCoord3 = new Matrix4(b2.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  //s3.render();
  s3.drawPyr(s3.matrix, [.85,.75,.5,1.0]);

  var spikeCoord4 = new Matrix4(b2.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  //s4.render();
  s4.drawPyr(s4.matrix, [.85,.75,.5,1.0]);

  var spikeCoord5 = new Matrix4(b2.matrix);
  var s5 = new Pyr();
  s5.color = [.85,.75,.5,1.0];
  s5.matrix = spikeCoord5;
  s5.matrix.translate(0,0,0);
  s5.matrix.rotate(90,0,0,1);
  s5.matrix.scale(0.5,.4,1);
  //s5.render();
  s5.drawPyr(s5.matrix, [.85,.75,.5,1.0]);

  var spikeCoord6 = new Matrix4(b2.matrix);
  var s6 = new Pyr();
  s6.color = [.85,.75,.5,1.0];
  s6.matrix = spikeCoord6;
  s6.matrix.translate(1,.5,0);
  s6.matrix.rotate(-90,0,0,1);
  s6.matrix.scale(0.5,.4,1);
  //s6.render();
  s6.drawPyr(s6.matrix, [.85,.75,.5,1.0]);

  

  // Draw Body section 3 --------------------------------------------------------------------------
  var b3 = new Cube();
  b3.color = [.5,.4,.3,1.0];
  b3.matrix = b2Coord;
  b3.matrix.translate(0.1,0,1);
  b3.matrix.rotate(g_wholeAngle/2,0,1,0);
  b3.matrix.scale(.8,.9,.9);
  var b3Coord = new Matrix4(b3.matrix);
  //b3.render();
  b3.drawCube(b3.matrix,[.5,.4,.3,1.0]);


  // Shoulder 3
  var shoulder3 = new Matrix4(b3.matrix);
  
  var rleg1 = new Cube();
  rleg1.color = [.6,.55,.4,1.0];
  rleg1.matrix = shoulder3;
  rleg1.matrix.translate(1,.1,0.3);
  //fleg3.matrix.rotate(0,0,1,0);
  /*if(g_pokeAnimation){
    rleg1.matrix.rotate(-g_shoulderAngle,1,0,0);
  }else{*/
    rleg1.matrix.rotate(g_shoulderAngle/4,0,0,1);
  //}
  rleg1.matrix.scale(0.3,0.3,.3);
  var rleg1Coord = new Matrix4(rleg1.matrix);
  //rleg1.render();
  rleg1.drawCube(rleg1.matrix,[.6,.55,.4,1.0]);

  var rleg1a = new Cube();
  rleg1a.color = [.6,.55,.4,1.0];
  rleg1a.matrix = rleg1Coord;
  rleg1a.matrix.translate(.5,.01,0.25);
  rleg1a.matrix.rotate(-90,0,0,1);
  rleg1a.matrix.rotate(g_legAngle/3,0,1,0);
  rleg1a.matrix.scale(1.5,.4,.5);
  var rleg1aCoord = new Matrix4(rleg1a.matrix);
  //rleg1a.render();
  rleg1a.drawCube(rleg1a.matrix,[.6,.55,.4,1.0]);

  var foot3 = new Cube();
  foot3.color = [.6,.55,.4,1.0];
  foot3.matrix = rleg1aCoord;
  foot3.matrix.translate(.8,-.2,.9);
  foot3.matrix.rotate(90,0,1,0);
  foot3.matrix.rotate(g_footAngle/7,0,1,0);
  foot3.matrix.scale(2.5,2,.3);
  //foot3.render();
  foot3.drawCube(foot3.matrix,[.6,.55,.4,1.0]);



  // shoulder 4
  var shoulder4 = new Matrix4(b3.matrix);
  var rleg2 = new Cube();
  rleg2.color = [.6,.55,.4,1.0];
  rleg2.matrix = shoulder4;
  rleg2.matrix.translate(-.3,.1,0.3);
  //fleg4.matrix.rotate(0,0,1,0);
  /*if(g_pokeAnimation){
    rleg2.matrix.rotate(g_shoulderAngle,1,0,0);
  }else{*/
    rleg2.matrix.rotate(g_shoulderAngle/4,0,0,1);
  //}
  rleg2.matrix.scale(0.3,0.3,.3);
  var rleg2Coord = new Matrix4(rleg2.matrix);
  //rleg2.render();
  rleg2.drawCube(rleg2.matrix,[.6,.55,.4,1.0]);

  var rleg2a = new Cube();
  rleg2a.color = [.6,.55,.4,1.0];
  rleg2a.matrix = rleg2Coord;
  rleg2a.matrix.translate(0.08,.01,0.25);
  rleg2a.matrix.rotate(-90,0,0,1);
  rleg2a.matrix.rotate(-g_legAngle/3,0,1,0);
  rleg2a.matrix.scale(1.5,.4,.5);
  var rleg2aCoord = new Matrix4(rleg2a.matrix);
  //rleg2a.render();
  rleg2a.drawCube(rleg2a.matrix,[.6,.55,.4,1.0]);

  var foot4 = new Cube();
  foot4.color = [.6,.55,.4,1.0];
  foot4.matrix = rleg2aCoord;
  foot4.matrix.translate(.8,-.8,.9);
  foot4.matrix.rotate(90,0,1,0);
  foot4.matrix.rotate(g_footAngle/7,0,1,0);
  foot4.matrix.scale(2.5,2,.3);
  //foot4.render();
  foot4.drawCube(foot4.matrix,[.6,.55,.4,1.0]);

  var spikeCoord1 = new Matrix4(b3.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  //s1.render();
  s1.drawPyr(s1.matrix, [.85,.75,.5,1.0]);
  

  var spikeCoord2 = new Matrix4(b3.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  //s2.render();
  s2.drawPyr(s2.matrix, [.85,.75,.5,1.0]);

  var spikeCoord3 = new Matrix4(b3.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  //s3.render();
  s3.drawPyr(s3.matrix, [.85,.75,.5,1.0]);

  var spikeCoord4 = new Matrix4(b3.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  //s4.render();
  s4.drawPyr(s4.matrix, [.85,.75,.5,1.0]);

  // Draw Tail
  var tail = new Pyr();
  tail.color = [.85,.75,.5,1.0];
  tail.matrix = b3Coord;
  tail.matrix.translate(0.1,.9,1);
  tail.matrix.rotate(90,1,0,0);
  tail.matrix.scale(.8,4,.9);
  //tail.render();
  tail.drawPyr(tail.matrix, [.85,.75,.5,1.0]);


  // Neck -----------------------------------------------------------------------------------------
  var neckOrig = new Matrix4(b1.matrix);
  // Draw neck
  var neck = new Cube();
  neck.color = [.6,.55,.4,1.0];
  neck.matrix = neckOrig;
  neck.matrix.translate(.5,.5,0);
  //neck.matrix.setTranslate(0,-.7,-.4);
  neck.matrix.rotate(-60,1,0,0);
  neck.matrix.rotate(-g_wholeAngle/2,0,0,1);
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.3,.6,.3);
  neck.matrix.translate(-.5,0,0);
  //neck.render();
  neck.drawCube(neck.matrix, [.6,.55,.4,1.0]);

  // Head -----------------------------------------------------------------------------------------
  var head = new Cube();
  head.color = [.5,.4,.3,1.0];
  head.matrix = neckCoordinatesMat; //translate(-.1,.1,0,0);
  head.matrix.translate(0,.5,-.2);
  //head.matrix.rotate(g_headAngle/4,1,0,0);
  /*if(g_pokeAnimation){
    head.matrix.rotate(g_headAngle,0,0,1);
  }else{*/
    head.matrix.rotate(g_headAngle/4,1,0,0);
  //}
  head.matrix.scale(.6,.6,.6);
  head.matrix.translate(-.5,0,-0.001);
  //head.render();
  head.drawCube(head.matrix, [.5,.4,.3,1.0]);

  var eye1Coord = new Matrix4(head.matrix);
  var eye1 = new Cube();
  eye1.textureNum = -2;
  eye1.color = [.5,.4,.3,1.0];
  eye1.matrix = eye1Coord;
  eye1.matrix.translate(0,1,.5);
  eye1.matrix.scale(.2,.1,.2);
  eye1.drawCube(eye1.matrix, [0,0,0,1]);

  eye1.matrix.translate(4,0,0);
  eye1.drawCube(eye1.matrix, [0,0,0,1]);

  eye1.matrix.translate(-3,0,-2);
  eye1.matrix.scale(3,1,.5);
  eye1.drawCube(eye1.matrix, [0,0,0,1]);

  var spikeCoord1 = new Matrix4(head.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,1);
  s1.matrix.rotate(90,1,0,0);
  s1.matrix.scale(0.5,1,1);
  //s1.render();
  s1.drawPyr(s1.matrix, [.85,.75,.5,1.0]);

  var spikeCoord2 = new Matrix4(head.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,1);
  s2.matrix.rotate(90,1,0,0);
  s2.matrix.scale(0.5,1,1);
  //s2.render();
  s2.drawPyr(s2.matrix, [.85,.75,.5,1.0]);

  var spikeCoord3 = new Matrix4(head.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  //s3.render();
  s3.drawPyr(s3.matrix, [.85,.75,.5,1.0]);

  var spikeCoord4 = new Matrix4(head.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  //s4.render();
  s4.drawPyr(s4.matrix, [.85,.75,.5,1.0]);

  var spikeCoord5 = new Matrix4(head.matrix);
  var s5 = new Pyr();
  s5.color = [.85,.75,.5,1.0];
  s5.matrix = spikeCoord5;
  s5.matrix.translate(0,0,0);
  s5.matrix.rotate(90,0,0,1);
  s5.matrix.scale(0.5,.8,1);
  //s5.render();
  s5.drawPyr(s5.matrix, [.85,.75,.5,1.0]);

  var spikeCoord6 = new Matrix4(head.matrix);
  var s6 = new Pyr();
  s6.color = [.85,.75,.5,1.0];
  s6.matrix = spikeCoord6;
  s6.matrix.translate(1,.5,0);
  s6.matrix.rotate(-90,0,0,1);
  s6.matrix.scale(0.5,.8,1);
  //s6.render();
  s6.drawPyr(s6.matrix, [.85,.75,.5,1.0]);

  var spikeCoord7 = new Matrix4(head.matrix);
  // spikes
  var s7 = new Pyr();
  s7.color = [.85,.75,.5,1.0];
  s7.matrix = spikeCoord7;
  s7.matrix.translate(0,0,0);
  s7.matrix.rotate(-90,1,0,0);
  s7.matrix.scale(0.5,.7,1);
  //s7.render();
  s7.drawPyr(s7.matrix, [.85,.75,.5,1.0]);

  var spikeCoord8 = new Matrix4(head.matrix);
  var s8 = new Pyr();
  s8.color = [.85,.75,.5,1.0];
  s8.matrix = spikeCoord8;
  s8.matrix.translate(0.5,0,0);
  s8.matrix.rotate(-90,1,0,0);
  s8.matrix.scale(0.5,.7,1);
  //s8.render();
  s8.drawPyr(s8.matrix, [.85,.75,.5,1.0]);
}