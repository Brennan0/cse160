// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width , canvas.height);// Fill a rectangle with the color
}

function drawVector(v, color){
  let canvas = document.getElementById('example');
  let ctx = canvas.getContext('2d');
  // center position for x and y
  let cx = canvas.width/2;
  let cy = canvas.height/2;
  // getting x and y components of v and scaling by 20
  let x = v.elements[0] * 20;
  let y = v.elements[1] * 20;
  // drawing vector
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.lineTo(cx + x, cy - y);
  ctx.stroke();
}

function handleDrawEvent(){
  let canvas = document.getElementById('example');
  let ctx = canvas.getContext('2d');
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width , canvas.height);
  // read values of x and y inputs for v1
  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;
  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;
  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);
  // call drawVector(v1, red)
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
}

function handleDrawOperationEvent(){
  let canvas = document.getElementById('example');
  let ctx = canvas.getContext('2d');
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width , canvas.height);
  // read values of the text boxes, create v1 and v2, draw v1 and v2
  let v1x = document.getElementById('v1x').value;
  let v1y = document.getElementById('v1y').value;
  let v2x = document.getElementById('v2x').value;
  let v2y = document.getElementById('v2y').value;
  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v1, 'red');
  drawVector(v2, 'blue');
  // read value of the selector and call respective functions, draw resulting vector
  let operation = document.getElementById('ops').value;
  let scalar = document.getElementById('scalar').value;

  let v3 = new Vector3([v1x, v1y, 0]);
  let v4 = new Vector3([v2x, v2y, 0]);

  if (operation == "add"){
    v3 = v1.add(v2);
    drawVector(v3, 'green');
  }else if (operation == "sub"){
    v3 = v1.sub(v2);
    drawVector(v3, 'green');
  }else if (operation == "mul"){
    v3 = v1.mul(scalar);
    drawVector(v3, 'green');
    v4 = v2.mul(scalar);
    drawVector(v4, 'green');
  }else if (operation == "div"){
    v3 = v1.div(scalar);
    drawVector(v3, 'green');
    v4 = v2.div(scalar);
    drawVector(v4, 'green');
  }else if (operation == "magnitude"){
    console.log("Magnitude v1: ", v1.magnitude());
    console.log("Magnitude v2: ", v2.magnitude());
  }else if (operation == "normalize"){
    v3 = v1.normalize();
    drawVector(v3, 'green');
    v4 = v2.normalize();
    drawVector(v4, 'green');
  }else if (operation == "anglebtwn"){
    let alpha = angleBetween(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    if (m1 == 0 || m2 == 0){
      console.log("No angle, m1: ",m1," m2: ",m1,);
    }else{
    console.log("Angle ", alpha);
    }
  }else if (operation == "area"){
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle: ", area)
  }
}

function angleBetween(v1, v2){
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();
  if (m1 == 0 || m2 == 0){
    return null;
  }
  // dot(v1, v2) = ||v1|| * ||v2|| * cos(alpha)
  // cos(alpha) = dot(v1, v2) / (||v1|| * ||v2||)
  let cosalpha = Vector3.dot(v1, v2) / (m1 * m2);
  // arccos(cos(alpha)) = alpha
  // alpha = arccos(cos(alpha))
  let rad = Math.acos(cosalpha);
  // convert rad to degrees
  let degrees = rad * (180 / Math.PI);
  return degrees;
}

function areaTriangle(v1, v2){
// (1/2) * ||v1 x v2||
let cross = Vector3.cross(v1, v2);
let m = cross.magnitude();
return m/2;
}
