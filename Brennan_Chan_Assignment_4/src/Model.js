//import { Matrix4 } from "../lib/cuon-matrix";
//import { OBJLoader } from "../lib/OBJLoader";

class Model {
  constructor(gl, filePath) {
    this.filePath = filePath;
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.textureNum = -2;
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.loader = new OBJLoader(this.filePath);
    this.loader.parseModel().then(() => {
      this.modelData = this.loader.getModelData();

      //console.log(this.modelData);

      this.vertexBuffer = gl.createBuffer();
      this.normalBuffer = gl.createBuffer();

      if (!this.vertexBuffer || !this.normalBuffer) {
        console.log("Failed to create bufferes for", this.filePath);
        return;
      }
    });
  }

  render() {
    if (!this.loader.isFullyLoaded) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.modelData.vertices),
      gl.DYNAMIC_DRAW
    );

    // Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.modelData.normals),
      gl.DYNAMIC_DRAW
    );
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    // set uniforms
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4fv(u_FragColor, this.color);

    
    // Pass the matrix to u_NormalMatrix attribute
    gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
  }
}
