//////////////////////////////////////////////////////
//
//    Lab 5
//    
//    Code authored by:
//    Will Altman (altman.120@osu.edu)
//
//    View matrix help from:
//    https://www.geertarien.com/blog/2017/07/30/breakdown-of-the-lookAt-function-in-OpenGL/
//
//    Calculating pitch and yaw help from:
//    https://www.youtube.com/watch?v=zZM2uUkEoFw&list=LL&index=1&t=336s
//
//    Contains helper methods for performing operations on the matricies
//
//////////////////////////////////////////////////////

var matrix_ops = {};

matrix_ops.degToRad = function(degrees) {
    return degrees * Math.PI / 180;
};


matrix_ops.radToDeg = function(rad) {
    // return degrees * Math.PI / 180;
    return rad * 180 / Math.PI
};


matrix_ops.scaleHelper = function(currentShape, factor) {

    for (let i = 0; i < currentShape["scale"].length; i++) {
    
        currentShape["scale"][i] += factor;
    }

};

matrix_ops.scaleMatrix = function(shape, scale) {//myShapeContainer, space, scale) {
    // let len = 1; //local space, only rotate the most recent matrix (front of array)

    // if (space == "W") len = myShapeContainer.shapes.length; //world space, rotate every matrix

    // for (let i = 0; i < len; i++) {

    if (scale == "b") matrix_ops.scaleHelper(shape, (-0.2))
    else if (scale == "B") matrix_ops.scaleHelper(shape, 0.2);

    matrix_ops.updateShape(shape);

}

matrix_ops.scaleTo = function(shape, vec) {


    shape.scale[0] = vec[0]
    shape.scale[1] = vec[1]
    shape.scale[2] = vec[2]

    matrix_ops.updateShape(shape)


}

matrix_ops.translateMatrix = function(shape, translation) {
    let newTranslation = shape.translation
    newTranslation[0] = shape.translation[0] + translation[0]
    newTranslation[1] = shape.translation[1] + translation[1]
    newTranslation[2] = shape.translation[2] + translation[2]


    matrix_ops.updateShape(shape)
}


matrix_ops.rotateMatrix = function(shape, angle, axis) {

       
    shape.rotation += angle;
    shape.rotationAxis = axis
    
    matrix_ops.updateShape(shape)
    

};

matrix_ops.updateCamera = function(shape, key, axis) {

    let delta = 0
    if (key < 'a') delta = 1 //capital
    else delta = -1 //lowercase

    let vMatrix = shape.vMatrix

    //Pitch and yaw help from: https://www.youtube.com/watch?v=zZM2uUkEoFw&list=LL&index=1&t=336s
    if (axis == "pitch" || axis == "yaw") { //y and z

        if (axis == "pitch") shape.pitch += 15 * delta
        else shape.yaw += 15 * delta

        x = Math.cos(matrix_ops.degToRad(shape.pitch)) * Math.cos(matrix_ops.degToRad(shape.yaw - 90))
        y = Math.sin(matrix_ops.degToRad(shape.pitch)) 
        z = Math.cos(matrix_ops.degToRad(shape.pitch)) * Math.sin(matrix_ops.degToRad(shape.yaw - 90))

        
        shape.coi[0] = x 
        shape.coi[1] = y 
        shape.coi[2] = z 
         
    }
    else if (axis == "roll") {
        shape.roll += 15 * delta
        let deg = shape.roll

        let x = -1 * Math.cos(matrix_ops.degToRad(deg))
        let y = Math.sin(matrix_ops.degToRad(deg))

        shape.up[0] = x
        shape.up[1] = y
        
    }

    

    mat4.identity(vMatrix)

    vMatrix = mat4.lookAt([0,0,0], shape.coi, shape.up, vMatrix)	// set up the view matrix, multiply into the modelview matrix

    shape.vMatrix = vMatrix

    matrix_ops.updateShape(shape)

}




matrix_ops.updateShape = function(myShape) {

    let mMatrix = mat4.create();
    let vMatrix = myShape.vMatrix;
    let mvMatrix = mat4.create();

    mMatrix = mat4.identity(mMatrix)
    mMatrix = mat4.translate(mMatrix, myShape["translation"] );
    mMatrix = mat4.rotate(mMatrix, matrix_ops.degToRad(myShape["rotation"]), myShape["rotationAxis"]); 
    mMatrix = mat4.scale(mMatrix, myShape["scale"]);

    myShape["mMatrix"] = mMatrix
    myShape["vMatrix"] = vMatrix

    mat4.multiply(vMatrix, mMatrix, mvMatrix); 
      
    myShape["mvMatrix"] = mvMatrix;


    let nMatrix = mat4.create()

	mat4.identity(nMatrix); 
	nMatrix = mat4.multiply(nMatrix, vMatrix);
	nMatrix = mat4.multiply(nMatrix, mMatrix); 	
	nMatrix = mat4.inverse(nMatrix);
	nMatrix = mat4.transpose(nMatrix); 

    myShape["nMatrix"] = nMatrix


 }