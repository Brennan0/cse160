class Point{
    constructor(){
      this.type='point';
      this.position = [0.0,0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      this.size = 5.0;
    }
  
  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    //var xy = g_points[i];
    //var rgba = g_colors[i];
    //var size = g_sizes[i];
  
    gl.disableVertexAttribArray(a_Position);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([xy[0], xy[1]]), gl.DYNAMIC_DRAW);

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
    // Pass the size of a point to the u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    //drawTriangle([xy[0], xy[1], xy[0] + .1, xy[1], xy[0], xy[1] +.1]);
  }
  }