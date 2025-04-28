class Pyr{
    constructor(){
      this.type='pyramid';
      //this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
    }
  
  drawPyr(matrix, color){ // render(){
        //var xy = this.position;
        var rgba = color;//this.color;
        //var size = this.size;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);//this.matrix.elements);
        
        drawTriangle3D([0,0,0, 0,0,1, .5,.5,.5]);
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3D([1,0,1, 0,0,1, .5,.5,.5]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        //bottom
        drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);
        drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);

        
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        drawTriangle3D([0,0,0, .5,.5,.5, 1,0,0]);
        gl.uniform4f(u_FragColor, rgba[0]*.75, rgba[1]*.75, rgba[2]*.75, rgba[3]);
        drawTriangle3D([1,0,0, .5,.5,.5, 1,0,1]);
    }    
  }