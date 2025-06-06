class Cube{
    constructor(){
      this.type='cube';
      //this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
    }
    //render() {
    //    this.drawCube();
    //}
  

   drawCube(matrix, color){
      //var xy = this.position;
      var rgba = color;
      //var size = this.size;

      // Pass the color of a point to u_FragColor uniform variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);//this.matrix.elements);

      // Front of cube
      drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
      drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

      // back
      drawTriangle3D([0,0,1, 1,1,1, 1,0,1]);
      drawTriangle3D([0,0,1, 0,1,1, 1,1,1]);

      // Pass the color of a point to u_FragColor uniform variable
      gl.uniform4f(u_FragColor, rgba[0]*.85, rgba[1]*.85, rgba[2]*.85, rgba[3]);

      // Top of cube
      drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
      drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);

      //bottom
      drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
      drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);

      gl.uniform4f(u_FragColor, rgba[0]*.75, rgba[1]*.75, rgba[2]*.75, rgba[3]);

      // left side
      drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);
      drawTriangle3D([0,0,0, 0,1,0, 0,1,1]);

      // right side
      drawTriangle3D([1,0,0, 1,0,1, 1,1,1]);
      drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
    }    
  }