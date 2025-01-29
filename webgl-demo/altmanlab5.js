//////////////////////////////////////////////////////
//
//    Lab 5
//    
//    Code authored by:
//    Will Altman (altman.120@osu.edu)
//
//    Boiler plate code provided from the example GitHub which is authored by:
//    Han-Wei Shen (shen.94@osu.edu)  
//
//    Some code is adapted from 3DCube.js in the example GitHub which is authored by:
//    Han-Wei Shen (shen.94@osu.edu)  
//
//    Object animation help from WebGLFundamentals:
//    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
//
//    Additional references:
//    https://webglfundamentals.org/
//
//////////////////////////////////////////////////////

var gl;
var shaderProgram;
var resolutionUniformLocation;
var moveKeyDown = null;
var rotateKeyDown = null;
var scaleKeyDown = null;
var cameraKeyDown = null;
var cycleKeyDown = null;
var genericKeyDown = null;
var lightbulbKeyDown = null;


var uColor;

var shapeVbos = null;
var shapeContainer = null
var scene = null;
var generics = null;
var lightbulb = null;
var lightPos = [0, 1.5, -3];
var manPos = [0, -1.75, -3]
var renderState = 0
var genericDegrees = 0
var cameraOps = []

var debug = false;


// ************** Init OpenGL Context etc. ************* 

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
    console.log(gl);

}

function webGLStart() {
    //event listeners
    document.addEventListener('keydown', onKeyDown);

    var canvas = document.getElementById("code00-canvas");
    initGL(canvas);
    initShaders();



    gl.enable(gl.DEPTH_TEST);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);


    shaderProgram.vertexTextureCoordAttribute = gl.getAttribLocation(shaderProgram, "aVertexTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTextureCoordAttribute);

    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.v2wMatrixUniform = gl.getUniformLocation(shaderProgram, "uV2WMatrix");


    shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");
    shaderProgram.ambient_coefUniform = gl.getUniformLocation(shaderProgram, "ambient_coef");
    shaderProgram.diffuse_coefUniform = gl.getUniformLocation(shaderProgram, "diffuse_coef");
    shaderProgram.specular_coefUniform = gl.getUniformLocation(shaderProgram, "specular_coef");
    shaderProgram.shininess_coefUniform = gl.getUniformLocation(shaderProgram, "mat_shininess");

    shaderProgram.light_ambientUniform = gl.getUniformLocation(shaderProgram, "light_ambient");
    shaderProgram.light_diffuseUniform = gl.getUniformLocation(shaderProgram, "light_diffuse");
    shaderProgram.light_specularUniform = gl.getUniformLocation(shaderProgram, "light_specular");

    shaderProgram.textureUniform = gl.getUniformLocation(shaderProgram, "myTexture");
    shaderProgram.use_textureUniform = gl.getUniformLocation(shaderProgram, "use_texture");
    shaderProgram.cube_map_textureUniform = gl.getUniformLocation(shaderProgram, "cubeMap");

    gl.uniform1i(shaderProgram.use_textureUniform, 1);


    console.log("Uniforms loaded...")


    gl.clearColor(0, 1, 1, 0.5);



    renderLighting()





    cameraKeyDown = 'p';
    updateCamera("pitch");
    cameraKeyDown = 'P';
    updateCamera("pitch");
    cameraKeyDown = null

    // moveKeyDown = 'w'
    // moveObject();
    // moveKeyDown = 's'
    // moveObject();
    // moveKeyDown = null
    drawScene()

}





function drawScene() {
    console.log("Drawing scene");

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let shapes = shapeContainer.shapes;


    shapes.forEach(function (shape) {
        shapeVbos.drawShape(shape);
    });

    let moveableShapes = shapeContainer.moveableShapes;

    moveableShapes.forEach(function (shape) {
        shapeVbos.drawShape(shape);
    });

    genericRotationAnimation()
    requestAnimationFrame(drawScene)


}

function renderLighting() {
    shapeVbos = new shape_vbos(gl, shaderProgram, lightPos);
    shapeContainer = new shape_container();
    scene = new scene_builder(shapeContainer, shapeVbos, lightPos);

    scene.setManPos = this.manPos
    shapeVbos.changeRenderMode(renderState)

    scene.primeScene()

    generics = scene.generics
    genericRotation(true)

    lightbulb = scene.lightbulb

    restoreCamera()

}


//  ************** User Input Functions *************** 

function onKeyDown(event) {
    var key = event.key;
    console.log("Detected:" + key);

    if (key == 'w' || key == 'a' || key == 's' || key == 'd') {
        moveKeyDown = key
        moveObject();
        // drawScene();
    } else if ((key == ',' || key == ".") && debug) {
        rotateKeyDown = key;
        rotateObject();
        // drawScene();
    } else if ((key == 'b' || key == 'B') && debug) {
        scaleKeyDown = key;
        scaleObject();
        // drawScene();
    } else if (key == 'p' || key == 'P') {
        cameraKeyDown = key;
        updateCamera("pitch");
        // drawScene();
    } else if (key == 'y' || key == 'Y') {
        cameraKeyDown = key;
        updateCamera("yaw");
        // drawScene();
    } else if (key == 'r' || key == 'R') {
        cameraKeyDown = key;
        updateCamera("roll");
        // drawScene();
    } else if (key == 'c') {
        cycleKeyDown = 'c';
        cycleRendering();
        // drawScene()
    } else if (key == '`') {
        genericKeyDown = key
        genericRotation()
        // drawScene()
    } else if (key == 'ArrowUp' || key == 'ArrowDown' || key == 'ArrowLeft' || key == 'ArrowRight' || key == '-' || key == '=') {
        lightbulbKeyDown = key
        // lightbulbTranslation()
        // drawScene()
    }


}

function lightbulbTranslation() {
    let translateMatrix = [0, 0, 0]

    if (lightbulbKeyDown == 'ArrowUp') {
        translateMatrix = [0, 0, 0.5]
    } else if (lightbulbKeyDown == 'ArrowDown') {
        translateMatrix = [0, 0, -0.5]
    } else if (lightbulbKeyDown == 'ArrowLeft') {
        translateMatrix = [-0.5, 0, 0]
    } else if (lightbulbKeyDown == 'ArrowRight') {
        translateMatrix = [0.5, 0, 0]
    } else if (lightbulbKeyDown == '-') {
        translateMatrix = [0, -0.5, 0]
    } else if (lightbulbKeyDown == '=') {
        translateMatrix = [0, 0.5, 0]
    }

    // lightbulb.forEach(function(shape) {
    //     matrix_ops.translateMatrix(shape, translateMatrix)
    // });

    // console.warn("Attempting to chagne lightniing.. ")

    // shapeVbos.lightbulb = lightbulb[0].translation

    lightPos[0] = translateMatrix[0] + lightPos[0]
    lightPos[1] = translateMatrix[1] + lightPos[1]
    lightPos[2] = translateMatrix[2] + lightPos[2]


    renderLighting()



}

function genericRotation(savedPos) {
    if (savedPos == null) {
        genericDegrees += 15
        if (genericKeyDown == '`') {
            generics.forEach(function (shape) {
                matrix_ops.rotateMatrix(shape, 15, [1, 1, 0])
            });

        }
    } else {

        generics.forEach(function (shape) {
            matrix_ops.rotateMatrix(shape, genericDegrees, [1, 1, 0])
        });
    }
}

function genericRotationAnimation() {
    genericDegrees += 0.1
    generics.forEach(function (shape) {
        matrix_ops.rotateMatrix(shape, 0.15, [1, 1, 0])
    });


}


function cycleRendering() {
    renderState += 1
    if (renderState == 2) {
        renderState = 0
    }
    if (cycleKeyDown == 'c') {
        shapeVbos.changeRenderMode(renderState)
    }


}

function moveObject() {

    let moveableShapes = shapeContainer.moveableShapes;
    let translateMatrix = [0, 0, 0]

    if (moveKeyDown == 'w') {
        translateMatrix = [0, 0, 0.5]
    } else if (moveKeyDown == 'a') {
        translateMatrix = [-0.5, 0, 0]
    } else if (moveKeyDown == 's') {
        translateMatrix = [0, 0, -0.5]
    } else if (moveKeyDown == 'd') {
        translateMatrix = [0.5, 0, 0]
    }


    //move the object 
    moveableShapes.forEach(function (shape) {
        matrix_ops.translateMatrix(shape, translateMatrix)
    });

    manPos[0] = manPos[0] + translateMatrix[0]
    manPos[1] = manPos[1] + translateMatrix[1]
    manPos[2] = manPos[2] + translateMatrix[2]


}

function rotateObject() {
    let moveableShapes = shapeContainer.moveableShapes;
    let angle = 0

    if (rotateKeyDown == ',') {
        angle = 15
    } else if (rotateKeyDown == '.') {
        angle = -15
    }

    moveableShapes.forEach(function (shape) {
        matrix_ops.rotateMatrix(shape, angle, [0, 1, 0])
    });

}

function scaleObject() {
    let moveableShapes = shapeContainer.moveableShapes;

    moveableShapes.forEach(function (shape) {
        matrix_ops.scaleMatrix(shape, scaleKeyDown)
    });

}

function updateCamera(axis) {
    let moveableShapes = shapeContainer.moveableShapes
    let staticShapes = shapeContainer.shapes

    moveableShapes.forEach(function (shape) {
        matrix_ops.updateCamera(shape, cameraKeyDown, axis)
    });

    staticShapes.forEach(function (shape) {
        matrix_ops.updateCamera(shape, cameraKeyDown, axis)
    });

    cameraOps.push([cameraKeyDown, axis])

}

/*
Yes storing the operations is bad and inefficient... 
TODO: if time later just store one matrix for all the math
*/
function restoreCamera() {
    let moveableShapes = shapeContainer.moveableShapes
    let staticShapes = shapeContainer.shapes



    for (let i = 0; i < cameraOps.length; i++) {
        let currentKeyDown = cameraOps[i][0]
        let currentAxis = cameraOps[i][1]

        moveableShapes.forEach(function (shape) {
            matrix_ops.updateCamera(shape, currentKeyDown, currentAxis)
        });

        staticShapes.forEach(function (shape) {
            matrix_ops.updateCamera(shape, currentKeyDown, currentAxis)
        });
    }

}












