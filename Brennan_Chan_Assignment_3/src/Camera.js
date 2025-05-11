class Camera{
    constructor(){
        this.fov = 60.0;
        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
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
    forward(){
        var f = this.at.sub(this.eye);
        f=f.div(3);
        this.at=this.at.add(f);
        this.eye=this.eye.add(f);
    }

    back(){
        var f = this.eye.sub(this.at);
        f=f.div(3);
        this.at=this.at.add(f);
        this.eye=this.eye.add(f);
    }

    left() {
        var f = this.eye.sub(this.at);
        f=f.div(3);
        var s=f.cross(this.up);
        s=s.div(s.length());
        this.at=this.at.add(s);
        this.eye=this.eye.add(s);
    }

    right() {
        var f = this.at.sub(this.eye);
        f=f.div(3);
        var s=f.cross(this.up);
        s=s.div(s.length());
        this.at=this.at.add(s);
        this.eye=this.eye.add(s);
    }
}