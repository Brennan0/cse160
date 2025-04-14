class Line {
    constructor(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
      this.type = 'line';
      this.color = [1.0,1.0,1.0,1.0];
      this.size = 1;
    }
  
    render() {
      let xy = [...this.p1, ...this.p2];
  
      let vertices = new Float32Array(xy);
  
      var vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
  

      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  

      gl.uniform4fv(u_FragColor, this.color);

      gl.uniform1f(u_Size, this.size);

      gl.drawArrays(gl.LINES, 0, 2);
    }
  }
  