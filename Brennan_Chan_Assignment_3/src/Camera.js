class Camera{
    constructor(){
        this.fov = 60.0;
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-1]);
        this.up=new Vector3([0,1,0]);
        this.viewMat = new Matrix4();
        this.projMat = new Matrix4()
    }
    /*
    passProj(){
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projMat.elements);
    }

    passView(){
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);
    }
    */
    moveForward(){
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        f = f.normalize();
        f = f.mul(0.1);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    moveBack(){
        let f = new Vector3();
        f = f.set(this.eye);
        f = f.sub(this.at);
        f = f.normalize();
        f = f.mul(0.1);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    moveLeft() {
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        let s = new Vector3();
        s.set(Vector3.cross(this.up, f));
        s = s.normalize();
        s = s.mul(0.1);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    moveRight() {
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        let s = new Vector3();
        s.set(Vector3.cross(f, this.up));
        s = s.normalize();
        s = s.mul(0.1);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    panLeft(alpha) {
    

    // f = at - eye
    let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
    ]);

    // Rotate f around up vector
    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);

    // at = eye + f_prime
    this.at = new Vector3([
        this.eye.elements[0] + f_prime.elements[0],
        this.eye.elements[1] + f_prime.elements[1],
        this.eye.elements[2] + f_prime.elements[2]
    ]);
}


    panRight(alpha) {

    let f = new Vector3([
        this.at.elements[0] - this.eye.elements[0],
        this.at.elements[1] - this.eye.elements[1],
        this.at.elements[2] - this.eye.elements[2]
    ]);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at = new Vector3([
        this.eye.elements[0] + f_prime.elements[0],
        this.eye.elements[1] + f_prime.elements[1],
        this.eye.elements[2] + f_prime.elements[2]
    ]);
}


    getBlock() {
        let forwardVect = new Vector3(this.at.elements).sub(this.eye).normalize();
        const x = Math.floor(this.eye.elements[0] + forwardVect.elements[0] + 16);
        const z = Math.floor(this.eye.elements[2] + forwardVect.elements[2] + 16);
        const mapx = Math.max(0, Math.min(31, x));
        const mapz = Math.max(0, Math.min(31, z));

        return [mapx, mapz];
    }


    addBlock() {
        const [x, z] = this.getBlock();
        g_map[x][z] += 1;
    }

    deleteBlock() {
        const [x, z] = this.getBlock();
        if (g_map[x][z] > 0) g_map[x][z] -= 1;
    }
}