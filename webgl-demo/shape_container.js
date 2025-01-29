//////////////////////////////////////////////////////
//
//    Lab 5
//    
//    Code authored by:
//    Will Altman (altman.120@osu.edu)
//
//    Some code is adapted from 3DCube.js in the example GitHub which is authored by:
//    Han-Wei Shen (shen.94@osu.edu)  
//
//    This class contains the marticies for each shape and other relevant information
//
//////////////////////////////////////////////////////

class shape_container {

    #shapes;
    moveableShapes;
    
    constructor() {
        this.#shapes = []
        this.moveableShapes = []

    }

    get shapes() {
        return this.#shapes;
    }

    get staticShapes() {
        return this.staticShapes
    }

    get mostRecent() {
        return this.#shapes[0];
    }

    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }



    buildShape(name, moveable) {

        var shape = {};
        var pMatrix = mat4.create();
        var vMatrix = mat4.create();
        var mMatrix = mat4.create();
        var mvMatrix = mat4.create();
        var nMatrix = mat4.create();
        //var v2wMatrix = mat4.create();  // eye space to world space matrix 


        //Calculate the mvMatrix
        mat4.perspective(60, 1.0, 0.1, 100, pMatrix);  // set up the projection matrix 

        mat4.identity(vMatrix);	
        vMatrix = mat4.lookAt([0,0,0], [0,0,0], [0,1,0], vMatrix);	// set up the view matrix, multiply into the modelview matrix

        mat4.identity(mMatrix);	
        // mMatrix = mat4.translate(mMatrix, translation);
        // mMatrix = mat4.rotate(mMatrix, this.degToRad(degrees), [0, 1, 1]);   // now set up the model matrix 


        mat4.multiply(vMatrix, mMatrix, mvMatrix);  // mvMatrix = vMatrix * mMatrix and is the modelview Matrix 

        shape.name = name;
        shape.vMatrix = vMatrix;
        shape.mMatrix = mMatrix;
        shape.mvMatrix = mvMatrix;
        shape.nMatrix = nMatrix;
        shape.pMatrix = pMatrix; //this should be located somewhere else
        shape.translation = [0, 0, 0];
        shape.scale = [1, 1, 1];
        shape.rotation = 0;
        shape.coi = [0, 0, 0]
        shape.up = [0, 1, 0]
        shape.roll = 90 //y = 1 x = 0
        shape.pitch = 0
        shape.yaw = 0
        shape.rotationAxis = [0, 1, 0]
        //unsure if z is needed

        if (moveable) {
            this.moveableShapes.push(shape);
        }
        else {
            this.#shapes.unshift(shape);
        }    

        return shape

    }



}
