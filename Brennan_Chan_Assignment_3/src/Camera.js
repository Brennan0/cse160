class Camera{
    constructor(){
        this.fov = 60.0;
        this.eye=new Vector3([0,0,0]);
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

    panLeft(){
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix = rotationMatrix.setRotate(
            5, 
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = this.at.add(f_prime);
    }

    panRight(){
        let f = new Vector3();
        f = f.set(this.at);
        f = f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix = rotationMatrix.setRotate(
            -5, 
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at = this.at.add(f_prime);
    }
}