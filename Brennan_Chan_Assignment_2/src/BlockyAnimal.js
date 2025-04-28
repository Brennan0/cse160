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
let g_neckAngle = 0;
let g_magentaAngle = 0;

let g_neckAnimation = false;
let g_magentaAnimation = false;
// Set up actions for ther HTML UI elements
function addAllActionsForHtmlUI(){

  // button events (shape)
  //document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0];};
  //document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0];};

  // clearButton events
  //document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderScene();};

  // color slider events
  //document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  //document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  //document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  // shape button events
  //document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
  //document.getElementById('triangleButton').onclick = function() {g_selectedType=TRIANGLE};
  //document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};
  //document.getElementById('lineButton').onclick = function() {g_selectedType=LINE};


  //document.getElementById('pictureButton').onclick = function() {drawPicture()};

  // rotate button event
  //document.getElementById('rotateButton').onclick = function() {g_selectedRot = (g_selectedRot + 1) % 4};
  
  document.getElementById('yellowOnButton').onclick = function() {g_neckAnimation = true;}
  document.getElementById('yellowOffButton').onclick = function() {g_neckAnimation = false;}

  document.getElementById('magOnButton').onclick = function() {g_magentaAnimation = true;}
  document.getElementById('magOffButton').onclick = function() {g_magentaAnimation = false;}
  // size slider events
  //document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_neckAngle = this.value; renderScene(); });

  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderScene(); });
  //document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

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
  if (g_neckAnimation){
    g_neckAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation){
    g_magentaAngle = (45*Math.sin(5 * g_seconds));
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
  b1.matrix.rotate(g_neckAngle/1.5,0,1,0);
  b1.matrix.scale(0.5,0.3,.3);
  var b1Coord = new Matrix4(b1.matrix);
  b1.render();


  var l1 = new Matrix4(b1.matrix);
  
  var fleg1 = new Cube();
  fleg1.color = [.6,.55,.4,1.0];
  fleg1.matrix = l1;
  fleg1.matrix.translate(1,.1,0.3);
  fleg1.matrix.rotate(g_neckAngle/1.5,0,1,0);
  fleg1.matrix.scale(0.3,0.3,.3);
  var fleg1Coord = new Matrix4(fleg1.matrix);
  fleg1.render();

  var l2 = new Matrix4(b1.matrix);
  
  var fleg2 = new Cube();
  fleg2.color = [.6,.55,.4,1.0];
  fleg2.matrix = l2;
  fleg2.matrix.translate(-.3,.1,0.3);
  fleg2.matrix.rotate(g_neckAngle/1.5,0,1,0);
  fleg2.matrix.scale(0.3,0.3,.3);
  var fleg2Coord = new Matrix4(fleg2.matrix);
  fleg2.render();


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
  b2.matrix.rotate(-g_neckAngle/2,0,1,0);
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
  b3.matrix.rotate(g_neckAngle/1,0,1,0);
  b3.matrix.scale(.8,.9,.9);
  var b3Coord = new Matrix4(b3.matrix);
  b3.render();


  var l3 = new Matrix4(b3.matrix);
  
  var fleg3 = new Cube();
  fleg3.color = [.6,.55,.4,1.0];
  fleg3.matrix = l3;
  fleg3.matrix.translate(1,.1,0.3);
  fleg3.matrix.rotate(g_neckAngle/1.5,0,1,0);
  fleg3.matrix.scale(0.3,0.3,.3);
  var fleg3Coord = new Matrix4(fleg3.matrix);
  fleg3.render();

  var l4 = new Matrix4(b3.matrix);
  
  var fleg4 = new Cube();
  fleg4.color = [.6,.55,.4,1.0];
  fleg4.matrix = l4;
  fleg4.matrix.translate(-.3,.1,0.3);
  fleg4.matrix.rotate(g_neckAngle/1.5,0,1,0);
  fleg4.matrix.scale(0.3,0.3,.3);
  var fleg4Coord = new Matrix4(fleg4.matrix);
  fleg4.render();

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


  var neckOrig = new Matrix4(b1.matrix);
  // Draw left arm
  var neck = new Cube();
  neck.color = [.8,.7,.4,1.0];
  neck.matrix = neckOrig;
  neck.matrix.translate(.5,.5,0);
  //neck.matrix.setTranslate(0,-.7,-.4);
  neck.matrix.rotate(-60,1,0,0);
  neck.matrix.rotate(-g_neckAngle/2,0,0,1);
  
  var neckCoordinatesMat = new Matrix4(neck.matrix);
  neck.matrix.scale(.3,.6,.3);
  neck.matrix.translate(-.5,0,0);
  neck.render();

  var magenta = new Cube();
  magenta.color = [.5,.4,.2,1.0];
  magenta.matrix = neckCoordinatesMat; //translate(-.1,.1,0,0);
  magenta.matrix.translate(0,.5,-.2);
  magenta.matrix.rotate(g_magentaAngle/4,1,0,0);
  magenta.matrix.scale(.6,.6,.6);
  magenta.matrix.translate(-.5,0,-0.001);
  magenta.render();

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