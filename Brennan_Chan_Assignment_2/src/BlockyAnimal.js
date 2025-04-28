// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global vars
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if(!u_Size){
    console.log('Failed to get the storage location of u_Size');
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
let g_globalAngle = 45;

let g_wholeAngle = 0;
let g_wholeAnimation = false;

let g_headAngle = 0;
let g_headAnimation = false;

let g_shoulderAngle = 0;
//let g_shoulderAnimation = false;

let g_legAngle = 0;
//let g_letAnimation = false;

let g_footAngle = 0;
//let g_footAnimation = false;

// Set up actions for ther HTML UI elements
function addAllActionsForHtmlUI(){

  document.getElementById('wholeOnButton').onclick = function() {g_wholeAnimation = true;}
  document.getElementById('wholeOffButton').onclick = function() {g_wholeAnimation = false;}

  document.getElementById('headOnButton').onclick = function() {g_headAnimation = true;}
  document.getElementById('headOffButton').onclick = function() {g_headAnimation = false;}
  // size slider events
  
  document.getElementById('wholeSlide').addEventListener('mousemove', function() { g_wholeAngle = this.value; renderScene(); });
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderScene(); });
  
  document.getElementById('shoulderSlide').addEventListener('mousemove', function() { g_shoulderAngle = this.value; renderScene(); });
  document.getElementById('legSlide').addEventListener('mousemove', function() { g_legAngle = this.value; renderScene(); });
  document.getElementById('footSlide').addEventListener('mousemove', function() { g_footAngle = this.value; renderScene(); });
  
  

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderScene(); });
}

function main() {

  setupWebGL();

  connectVariablesToGLSL();

  addAllActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
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
  console.log(g_seconds);;

  updateAnimationAngles();

  renderScene();

  requestAnimationFrame(tick);
}

var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = []; // The array to store the size of a point

let start = null;

function click(ev) {
  // gather x and y as converted from even to GL
  let [x,y] = convertCoordinates(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
    point.orient =g_selectedRot;
  } else if (g_selectedType == CIRCLE){
    point = new Circle();
    point.segments=g_selectedSeg;
  } else{
    if (!start) {
      start = [x, y];
    } else {
      line = new Line(start, [x, y]);
      line.color = g_selectedColor.slice();
      line.size = g_selectedSize/20;
      g_shapesList.push(line);
      start = null;
      renderScene();
    }
    return;
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  renderScene();
}

function convertCoordinates(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

function updateAnimationAngles(){
  if (g_wholeAnimation){
    g_wholeAngle = (45*Math.sin(g_seconds));
    g_shoulderAngle = g_wholeAngle;
    g_legAngle = g_wholeAngle;
    g_footAngle = g_wholeAngle;
  }
  if (g_headAnimation){
    g_headAngle = (45*Math.sin(5 * g_seconds));
  }
}

function renderScene(){

  // check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  //globalRotMat.rotate(-25,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw Body section 1 --------------------------------------------------------------------------
  var b1 = new Cube();
  b1.color = [.5,.4,.3,1.0];
  b1.matrix.translate(-0.25,-.75,-.5);
  b1.matrix.rotate(g_wholeAngle/4,0,1,0);
  b1.matrix.scale(0.5,0.3,.3);
  var b1Coord = new Matrix4(b1.matrix);
  b1.render();


  var shoulder1 = new Matrix4(b1.matrix);
  
  var fleg1 = new Cube();
  fleg1.color = [.6,.55,.4,1.0];
  fleg1.matrix = shoulder1;
  fleg1.matrix.translate(1,.1,0.3);
  fleg1.matrix.rotate(g_shoulderAngle/4,0,0,1);
  fleg1.matrix.scale(0.3,0.3,.3);
  var fleg1Coord = new Matrix4(fleg1.matrix);
  fleg1.render();

  var fleg1a = new Cube();
  fleg1a.color = [.6,.55,.4,1.0];
  fleg1a.matrix = fleg1Coord;
  fleg1a.matrix.translate(.5,.01,0.25);
  fleg1a.matrix.rotate(-90,0,0,1);
  fleg1a.matrix.rotate(g_legAngle/3,0,1,0);
  fleg1a.matrix.scale(1.5,.4,.5);
  var fleg1aCoord = new Matrix4(fleg1a.matrix);
  fleg1a.render();

  var foot1 = new Cube();
  foot1.color = [.6,.55,.4,1.0];
  foot1.matrix = fleg1aCoord;
  foot1.matrix.translate(.8,-.2,.9);
  foot1.matrix.rotate(90,0,1,0);
  foot1.matrix.rotate(g_footAngle/7,0,1,0);
  foot1.matrix.scale(2.5,2,.3);
  foot1.render();

  var shoulder2 = new Matrix4(b1.matrix);
  
  var fleg2 = new Cube();
  fleg2.color = [.6,.55,.4,1.0];
  fleg2.matrix = shoulder2;
  fleg2.matrix.translate(-.3,.1,0.3);
  fleg2.matrix.rotate(g_shoulderAngle/4,0,0,1);
  fleg2.matrix.scale(0.3,0.3,.3);
  var fleg2Coord = new Matrix4(fleg2.matrix);
  fleg2.render();

  var fleg2a = new Cube();
  fleg2a.color = [.6,.55,.4,1.0];
  fleg2a.matrix = fleg2Coord;
  fleg2a.matrix.translate(0.08,.01,0.25);
  fleg2a.matrix.rotate(-90,0,0,1);
  fleg2a.matrix.rotate(-g_legAngle/3,0,1,0);
  fleg2a.matrix.scale(1.5,.4,.5);
  var fleg2aCoord = new Matrix4(fleg2a.matrix);
  fleg2a.render();

  var foot2 = new Cube();
  foot2.color = [.6,.55,.4,1.0];
  foot2.matrix = fleg2aCoord;
  foot2.matrix.translate(.8,-.8,.9);
  foot2.matrix.rotate(90,0,1,0);
  foot2.matrix.rotate(g_footAngle/7,0,1,0);
  foot2.matrix.scale(2.5,2,.3);
  foot2.render();

  var spikeCoord1 = new Matrix4(b1.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  s1.render();

  var spikeCoord2 = new Matrix4(b1.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  s2.render();

  var spikeCoord3 = new Matrix4(b1.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  s3.render();

  var spikeCoord4 = new Matrix4(b1.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  s4.render();


  // Draw Body section 2 --------------------------------------------------------------------------
  var b2 = new Cube();
  b2.color = [.5,.4,.3,1.0];
  b2.matrix = b1Coord;
  b2.matrix.translate(0.1,0,1);
  b2.matrix.rotate(-g_wholeAngle/3,0,1,0);
  b2.matrix.scale(.8,.9,1);
  var b2Coord = new Matrix4(b2.matrix);
  b2.render();

  var spikeCoord1 = new Matrix4(b2.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  s1.render();

  var spikeCoord2 = new Matrix4(b2.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  s2.render();

  var spikeCoord3 = new Matrix4(b2.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  s3.render();

  var spikeCoord4 = new Matrix4(b2.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  s4.render();

  var spikeCoord5 = new Matrix4(b2.matrix);
  var s5 = new Pyr();
  s5.color = [.85,.75,.5,1.0];
  s5.matrix = spikeCoord5;
  s5.matrix.translate(0,0,0);
  s5.matrix.rotate(90,0,0,1);
  s5.matrix.scale(0.5,.4,1);
  s5.render();

  var spikeCoord6 = new Matrix4(b2.matrix);
  var s6 = new Pyr();
  s6.color = [.85,.75,.5,1.0];
  s6.matrix = spikeCoord6;
  s6.matrix.translate(1,.5,0);
  s6.matrix.rotate(-90,0,0,1);
  s6.matrix.scale(0.5,.4,1);
  s6.render();

  

  // Draw Body section 3 --------------------------------------------------------------------------
  var b3 = new Cube();
  b3.color = [.5,.4,.3,1.0];
  b3.matrix = b2Coord;
  b3.matrix.translate(0.1,0,1);
  b3.matrix.rotate(g_wholeAngle/2,0,1,0);
  b3.matrix.scale(.8,.9,.9);
  var b3Coord = new Matrix4(b3.matrix);
  b3.render();

  // Shoulder 3
  var shoulder3 = new Matrix4(b3.matrix);
  
  var rleg1 = new Cube();
  rleg1.color = [.6,.55,.4,1.0];
  rleg1.matrix = shoulder3;
  rleg1.matrix.translate(1,.1,0.3);
  //fleg3.matrix.rotate(0,0,1,0);
  rleg1.matrix.rotate(g_shoulderAngle/4,0,0,1);
  rleg1.matrix.scale(0.3,0.3,.3);
  var rleg1Coord = new Matrix4(rleg1.matrix);
  rleg1.render();

  var rleg1a = new Cube();
  rleg1a.color = [.6,.55,.4,1.0];
  rleg1a.matrix = rleg1Coord;
  rleg1a.matrix.translate(.5,.01,0.25);
  rleg1a.matrix.rotate(-90,0,0,1);
  rleg1a.matrix.rotate(g_legAngle/3,0,1,0);
  rleg1a.matrix.scale(1.5,.4,.5);
  var rleg1aCoord = new Matrix4(rleg1a.matrix);
  rleg1a.render();

  var foot3 = new Cube();
  foot3.color = [.6,.55,.4,1.0];
  foot3.matrix = rleg1aCoord;
  foot3.matrix.translate(.8,-.2,.9);
  foot3.matrix.rotate(90,0,1,0);
  foot3.matrix.rotate(g_footAngle/7,0,1,0);
  foot3.matrix.scale(2.5,2,.3);
  foot3.render();



  // shoulder 4
  var shoulder4 = new Matrix4(b3.matrix);
  
  var rleg2 = new Cube();
  rleg2.color = [.6,.55,.4,1.0];
  rleg2.matrix = shoulder4;
  rleg2.matrix.translate(-.3,.1,0.3);
  //fleg4.matrix.rotate(0,0,1,0);
  rleg2.matrix.rotate(g_shoulderAngle/4,0,0,1);
  rleg2.matrix.scale(0.3,0.3,.3);
  var rleg2Coord = new Matrix4(rleg2.matrix);
  rleg2.render();

  var rleg2a = new Cube();
  rleg2a.color = [.6,.55,.4,1.0];
  rleg2a.matrix = rleg2Coord;
  rleg2a.matrix.translate(0.08,.01,0.25);
  rleg2a.matrix.rotate(-90,0,0,1);
  rleg2a.matrix.rotate(-g_legAngle/3,0,1,0);
  rleg2a.matrix.scale(1.5,.4,.5);
  var rleg2aCoord = new Matrix4(rleg2a.matrix);
  rleg2a.render();

  var foot4 = new Cube();
  foot4.color = [.6,.55,.4,1.0];
  foot4.matrix = rleg2aCoord;
  foot4.matrix.translate(.8,-.8,.9);
  foot4.matrix.rotate(90,0,1,0);
  foot4.matrix.rotate(g_footAngle/7,0,1,0);
  foot4.matrix.scale(2.5,2,.3);
  foot4.render();

  var spikeCoord1 = new Matrix4(b3.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,0);
  s1.matrix.rotate(0,1,0,0);
  s1.matrix.scale(0.5,1,1);
  s1.render();

  var spikeCoord2 = new Matrix4(b3.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,0);
  s2.matrix.rotate(0,1,0,0);
  s2.matrix.scale(0.5,1,1);
  s2.render();

  var spikeCoord3 = new Matrix4(b3.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  s3.render();

  var spikeCoord4 = new Matrix4(b3.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  s4.render();

  // Draw Tail
  var tail = new Pyr();
  tail.color = [.85,.75,.5,1.0];
  tail.matrix = b3Coord;
  tail.matrix.translate(0.1,.9,1);
  tail.matrix.rotate(90,1,0,0);
  tail.matrix.scale(.8,4,.9);
  tail.render();


  // Neck -----------------------------------------------------------------------------------------
  var neckOrig = new Matrix4(b1.matrix);
  // Draw neck
  var neck = new Cube();
  neck.color = [.8,.7,.4,1.0];
  neck.matrix = neckOrig;
  neck.matrix.translate(.5,.5,0);
  //neck.matrix.setTranslate(0,-.7,-.4);
  neck.matrix.rotate(-60,1,0,0);
  neck.matrix.rotate(-g_wholeAngle/2,0,0,1);
  
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.3,.6,.3);
  neck.matrix.translate(-.5,0,0);
  neck.render();

  // Head -----------------------------------------------------------------------------------------
  var head = new Cube();
  head.color = [.5,.4,.2,1.0];
  head.matrix = neckCoordinatesMat; //translate(-.1,.1,0,0);
  head.matrix.translate(0,.5,-.2);
  head.matrix.rotate(g_headAngle/4,1,0,0);
  head.matrix.scale(.6,.6,.6);
  head.matrix.translate(-.5,0,-0.001);
  head.render();

  var spikeCoord1 = new Matrix4(head.matrix);
  // spikes
  var s1 = new Pyr();
  s1.color = [.85,.75,.5,1.0];
  s1.matrix = spikeCoord1;
  s1.matrix.translate(0,1,1);
  s1.matrix.rotate(90,1,0,0);
  s1.matrix.scale(0.5,1,1);
  s1.render();

  var spikeCoord2 = new Matrix4(head.matrix);
  var s2 = new Pyr();
  s2.color = [.85,.75,.5,1.0];
  s2.matrix = spikeCoord2;
  s2.matrix.translate(0.5,1,1);
  s2.matrix.rotate(90,1,0,0);
  s2.matrix.scale(0.5,1,1);
  s2.render();

  var spikeCoord3 = new Matrix4(head.matrix);
  var s3 = new Pyr();
  s3.color = [.85,.75,.5,1.0];
  s3.matrix = spikeCoord3;
  s3.matrix.translate(1,1,0);
  s3.matrix.rotate(-90,0,0,1);
  s3.matrix.scale(0.5,.4,1);
  s3.render();

  var spikeCoord4 = new Matrix4(head.matrix);
  var s4 = new Pyr();
  s4.color = [.85,.75,.5,1.0];
  s4.matrix = spikeCoord4;
  s4.matrix.translate(0,0.5,0);
  s4.matrix.rotate(90,0,0,1);
  s4.matrix.scale(0.5,.4,1);
  s4.render();

  var spikeCoord5 = new Matrix4(head.matrix);
  var s5 = new Pyr();
  s5.color = [.85,.75,.5,1.0];
  s5.matrix = spikeCoord5;
  s5.matrix.translate(0,0,0);
  s5.matrix.rotate(90,0,0,1);
  s5.matrix.scale(0.5,.8,1);
  s5.render();

  var spikeCoord6 = new Matrix4(head.matrix);
  var s6 = new Pyr();
  s6.color = [.85,.75,.5,1.0];
  s6.matrix = spikeCoord6;
  s6.matrix.translate(1,.5,0);
  s6.matrix.rotate(-90,0,0,1);
  s6.matrix.scale(0.5,.8,1);
  s6.render();


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