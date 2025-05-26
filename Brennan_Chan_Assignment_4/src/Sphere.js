class Sphere{
    constructor(){
      this.type='sphere';
      //this.position = [0.0,0.0,0.0];
      this.color = [1.0,1.0,1.0,1.0];
      //this.size = 5.0;
      //this.segments = 10;
      this.matrix = new Matrix4();
      this.textureNum=-2;
      /*
      this.cubeUV32 = new Float32Array([
        0.335,0.335, 0.66,0.66, 0.66,0.335
        ,
        0.335,0.335, 0.335,0.66, 0.66,0.66
        ,
        // back
        0,0.335, 0.33,0.335, 0.33,0.66
        ,
        0,0.335, 0,0.66, 0.33,0.66
        ,
        // Top of cube
        0.66,0.66, 0.66,1, .335,1
        ,
        0.66,0.66, 0.335,1, 0.335,0.66
        ,
        // Bottom
        0.334,0.33, 0.334,0, 0.66,0
        ,
        0.334,0.33, 0.66,0, 0.66,0.33
        ,
        // left side
        0,0.334, 0.33,0.334, 0.33,0.66
        ,
        0,0.334, 0,0.66, 0.33,0.66
        ,
        // right side
        0.33,0.334, 0,0.334, 0,0.66
        , 
        0.33,0.334, 0.33,0.66, 0,0.66
      ]);

      this.cubeVerts32 = new Float32Array([
        0,0,0, 1,1,0, 1,0,0
        ,
        0,0,0, 0,1,0, 1,1,0
        ,
        // back
        0,0,1, 1,0,1, 1,1,1
        ,
        0,0,1, 0,1,1, 1,1,1
        ,
        // Top of cube
        0,1,0, 0,1,1, 1,1,1
        ,
        0,1,0, 1,1,1, 1,1,0
        ,
        //bottom
        0,0,0, 0,0,1, 1,0,1
        ,
        
        0,0,0, 1,0,1, 1,0,0
        ,
        // left side
        0,0,0, 0,0,1, 0,1,1
        ,
        0,0,0, 0,1,0, 0,1,1
        ,
        // right side
        1,0,0, 1,0,1, 1,1,1
        ,
        1,0,0, 1,1,0, 1,1,1
        
      ]);

      this.cubeNorm32 = new Float32Array([
        // front
        0,0,-1, 0,0,-1, 0,0,-1
        ,
        0,0,-1, 0,0,-1, 0,0,-1
        ,
        // back
        0,0,1, 0,0,1, 0,0,1
        ,
        0,0,1, 0,0,1, 0,0,1
        ,
        // Top of cube
        0,1,0, 0,1,0, 0,1,0
        ,
        0,1,0, 0,1,0, 0,1,0
        ,
        //bottom
        0,-1,0, 0,-1,0, 0,-1,0
        ,
        0,-1,0, 0,-1,0, 0,-1,0
        ,
        // left side
        -1,0,0, -1,0,0, -1,0,0
        ,
        -1,0,0, -1,0,0, -1,0,0
        ,
        // right side
        1,0,0, 1,0,0, 1,0,0
        ,
        1,0,0, 1,0,0, 1,0,0
      ]);
*/
    }
    render(){
      //var xy = this.position;
      var rgba = this.color;
      //var size = this.size;

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the color of a point to u_FragColor uniform variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);//this.matrix.elements);

      var d = Math.PI / 10;
      var dd = Math.PI / 10;

      for (var t = 0; t<Math.PI; t+=d){
        for (var r=0; r< (2*Math.PI); r+=d){
          var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
          var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
          var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
          var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

          var v = [];
          var uv = [];
          v=v.concat(p1);
          uv=uv.concat([0,0]);
          v=v.concat(p2);
          uv=uv.concat([0,0]);
          v=v.concat(p4);
          uv=uv.concat([0,0]);

          gl.uniform4f(u_FragColor, 1,1,1,1);
          drawTriangle3DUVNormal(v, uv, v);

          v=[];
          uv=[];
          v=v.concat(p1);
          uv=uv.concat([0,0]);
          v=v.concat(p4);
          uv=uv.concat([0,0]);
          v=v.concat(p3);
          uv=uv.concat([0,0]);
          gl.uniform4f(u_FragColor, 1,0,0,1);
          drawTriangle3DUVNormal(v, uv, v);

        
      }
    }
  }  

    renderFaster(){
      //var xy = this.position;
      var rgba = this.color;
      //var size = this.size;

      // Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);

      // Pass the color of a point to u_FragColor uniform variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);//this.matrix.elements);

      // Made multiple buffers

      //var n = 3; // The number of vertices

      // Create a buffer object for positions
      var vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }

      // Bind the buffer object to target
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      // Write date into the buffer object
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
  
      // Assign the buffer object to a_Position variable
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_Position);

      var uvBuffer = gl.createBuffer();
      if (!uvBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }

      // Bind the buffer object to target
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

      // Write date into the buffer object
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeUV32, gl.DYNAMIC_DRAW);
  
      // Assign the buffer object to a_Position variable
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_UV);

      var normalBuffer = gl.createBuffer();
      if (!normalBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }

      // Bind the buffer object to target
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

      // Write date into the buffer object
      gl.bufferData(gl.ARRAY_BUFFER, this.cubeNorm32, gl.DYNAMIC_DRAW);
  
      // Assign the buffer object to a_Position variable
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_Normal);

      gl.drawArrays(gl.TRIANGLES, 0, 36);

    }    
  }