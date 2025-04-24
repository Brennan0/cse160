class Triangle{
    constructor(){
      this.type='triangle';
      this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      this.size = 5.0;
      this.orient = 0;
    }
  
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    //var xy = g_points[i];
    //var rgba = g_colors[i];
    //var size = g_sizes[i];
  
    // Pass the position of a point to a_Position variable
    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
    // Pass the size of a point to the u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    //gl.drawArrays(gl.POINTS, 0, 1);

    // Delta
    var d = this.size/360.0;
    if(this.orient == 0){
    drawTriangle([xy[0], xy[1] + 1.5 * d, xy[0] - d, xy[1] , xy[0] + d, xy[1]]);
    }else if(this.orient == 1){
      drawTriangle([xy[0] + 1.5 * d, xy[1], xy[0], xy[1] - d, xy[0], xy[1] + d]);
    }else if(this.orient == 2){
      drawTriangle([xy[0], xy[1] - 1.5 * d, xy[0] - d, xy[1] , xy[0] + d, xy[1]]);
    }else{
      drawTriangle([xy[0] - 1.5 * d, xy[1], xy[0], xy[1] - d, xy[0], xy[1] + d]);
    }
  }

  }

function drawTriangle(vertices){

    //var vertices = new Float32Array([
    //  0, 0.5,   -0.5, -0.5,   0.5, -0.5
    //]);
    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //return n;
  }

function drawTriangle3D(vertices){

    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //return n;
}

 function drawPicture(){
  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // "Black" 
  gl.uniform4f(u_FragColor, .2, .2, .2, 1);

  // front wheel
  drawTriangle([-.4,0 ,-.3,-.1 ,-.1,0]);
  drawTriangle([-.3,-.1 ,-.2,-.1,-.1,0]);
  drawTriangle([-.4,0 ,-.1,0 ,-.4,.1]);
  drawTriangle([-.4,.1 ,-.1,0 ,-.1,.1]);
  drawTriangle([-.4,.1 ,-.3,.2 ,-.2,.2]);
  drawTriangle([-.4,.1 ,-.2,.2 ,-.1,.1]);

  // rear wheel
  drawTriangle([.3,0 ,.4,-.1 ,.6,0]);
  drawTriangle([.4,-.1 ,.5,-.1,.6,0]);
  drawTriangle([.3,0 ,.6,0 ,.3,.1]);
  drawTriangle([.3,.1 ,.6,0 ,.6,.1]);
  drawTriangle([.3,.1 ,.4,.2 ,.5,.2]);
  drawTriangle([.3,.1 ,.5,.2 ,.6,.1]);

  drawTriangle([-.3,.3, -.1,.3, -.1,.4]);
  drawTriangle([-.1,.3, -.1,.4, .3,.3]);
  drawTriangle([-.1,.4, .3,.3, .5,.4]);
  // Grey
  gl.uniform4f(u_FragColor, .4, .4, .4, 1);
  //gl.uniform1f(u_Size, 5);
  drawTriangle([-.1,0, -.1, .1 , .3, 0]);
  drawTriangle([.3,.1, -.1, .1 , .3, 0]);
  drawTriangle([-.65,0 ,-.65,.1 ,-.4,0]);
  drawTriangle([-.65,.1, -.4,0, -.4,.1]);
  drawTriangle([-.75,0, -.65,0, -.65,.1]);
  drawTriangle([.6,0, .6,.1, .8,.1]);

  // Orange
  gl.uniform4f(u_FragColor, 1, .55, 0, 1);
  drawTriangle([-.1,.1,-.2,.2,.4,.2]);
  drawTriangle([-.1,.1,.3,.1,.4,.2]);
  drawTriangle([-.8,.1, -.6,.2, -.4,.1]);
  drawTriangle([-.6,.2, -.4,.1, -.3,.2]);
  drawTriangle([-.6,.2, -.3,.2, -.3,.3]);
  drawTriangle([-.3,.2, -.3,.3, .8,.3]);
  drawTriangle([-.3,.2, .8,.2, .8,.3]);
  drawTriangle([.5,.2, .8,.1, .8,.2]);
  drawTriangle([.5,.2, .6,.1, .8,.1]);
  drawTriangle([.3,.3, .5,.3, .5,.4]);
  drawTriangle([.5,.3, .5,.4, .8,.3]);

  // Red
  gl.uniform4f(u_FragColor, 1, .3, .3, 1);
  drawTriangle([.8,.1, .8,.3, .82,.3]);
  drawTriangle([.8,.1, .82,.3, .82,.1]);

  // Yellow
  gl.uniform4f(u_FragColor, .7, .7, 0, 1);
  drawTriangle([-.75,.125, -.685,.19, -.6,.2]);
  //gl.uniform1f(u_Size, 5);
  //drawTriangle([]);

  // 35 TOTAL TRIANGLES FOR THIS DRAWING OF A CAR
 }