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
//    Code for teapot.json was taken from the example github: 
//    https://github.com/hguo/WebGL-tutorial
//
//    Help for writing JSON parsing code:
//    https://stackoverflow.com/questions/11116760/save-json-in-javascript-variable
//
//    Model face and vertex normal computation functions are from the example GitHub authored by:
//    Han-Wei Shen (shen.94@osu.edu) 
//
//    Texture stuff (rendering squares for the skybox, mapping texture to objects, cube mapping) 
//    and the teapot json is from the example GitHub authored by:
//    Han-Wei Shen (shen.94@osu.edu) 
//
//    Additional help from WebGLFundamentals:
//    https://webglfundamentals.org/webgl/lessons/webgl-skybox.html
//    https://webglfundamentals.org/webgl/lessons/webgl-environment-maps.html
//
//    Citations for the images and models used are in their respective folders in this directory
//
//    This class contains the VBOs for each shape used in the lab
//
//////////////////////////////////////////////////////

class shape_vbos {

    vboCache = {};
    gl = null;
    shaderProgram = null;
    cylinder = null;
    nullCount = 0
    teapotJSON = null

    //stuff for textures
    //this is really coupled lmao
    raygunTex = null
    cubemapTexture = null
    skyboxTex = null



    constructor(gl, shaderProgram, lightPos) {

        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.renderMode = gl.TRIANGLES;
        this.lightPos = lightPos

        this.initTextures()
        this.initCubeMap()

    }

    get cache() {
        return this.vboCache;
    }




    changeRenderMode(mode) {
        console.log("Changing mode...")

        if (mode == 0) {
            this.renderMode = gl.TRIANGLES
        } else if (mode == 1) {
            this.renderMode = gl.LINE_STRIP
        }
    }

    generateNewShape(shape, color, params) {
        let name = shape
        if (color == null) {
            name += ", " + this.nullCount
            this.nullCount++
        }
        else {
            name += "" + ", " + color[0] + ", " + color[1] + ", " + color[2]
        }

        if (shape == "CUBE") this.vboCache[name] = this.primeCube(...params, color)
        else if (shape == "CYLINDER") this.vboCache[name] = this.primeCylinder(...params, color)
        else if (shape == "SPHERE") this.vboCache[name] = this.primeSphere(...params, color)
        else if (shape == "TEAPOT") this.vboCache[name] = this.primeTeapot("teapot.json", color)
        else if (shape == "RAYGUN") this.vboCache[name] = this.primeRaygun("raygun/raygun.json", color)
        else if (shape == "SQUARE") this.vboCache[name] = this.primeSquare(...params, color)



        return name
    }


    setMatrixUniforms(mMatrix, vMatrix, pMatrix, nMatrix, v2wMatrix) {
        gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
        gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, nMatrix);

        gl.uniformMatrix4fv(shaderProgram.v2wMatrixUniform, false, v2wMatrix);

    }

    drawShape(shape) {

        if (shape.label == "RAYGUN") {
            // console.warn("Raygun detected")
            gl.uniform1i(shaderProgram.use_textureUniform, 1);

        } else if (shape.label == "CUBEMAP") {
            gl.uniform1i(shaderProgram.use_textureUniform, 2);

        } else if (shape.label == "SKYBOX") {
            gl.uniform1i(shaderProgram.use_textureUniform, 3);

        }
        else {
            gl.uniform1i(shaderProgram.use_textureUniform, 0);
        }

        // set up the parameters for lighting 
        var light_ambient = [.6, .6, .6, 1];
        var light_diffuse = [.8, .8, .8, 1];
        var light_specular = [1, 1, 1, 1];
        var light_pos = this.lightPos;   // eye space position 

        var mat_ambient = [.5, .5, .5, 1];
        var mat_diffuse = [1, 1, 1, 1];
        var mat_specular = [.9, .9, .9, 1];
        var mat_shine = [20];

        var currentShapeBuffer = this.vboCache[shape["name"]];
        var mvMatrix = shape["mvMatrix"];
        var pMatrix = shape["pMatrix"];
        var nMatrix = shape["nMatrix"];
        var mMatrix = shape["mMatrix"];
        var vMatrix = shape["vMatrix"];
        var v2wMatrix = mat4.create()


        var vertexPositionBuffer = currentShapeBuffer.vertexPositionBuffer;
        var vertexIndexBuffer = currentShapeBuffer.vertexIndexBuffer;
        var vertexColorBuffer = currentShapeBuffer.vertexColorBuffer;
        var vertexNormalBuffer = currentShapeBuffer.vertexNormalBuffer;
        var vertexTextureCoordBuffer = currentShapeBuffer.vertexTextureCoordBuffer




        shaderProgram.light_posUniform = gl.getUniformLocation(shaderProgram, "light_pos");


        gl.uniform4f(shaderProgram.light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);
        gl.uniform4f(shaderProgram.ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
        gl.uniform4f(shaderProgram.diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
        gl.uniform4f(shaderProgram.specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
        gl.uniform1f(shaderProgram.shininess_coefUniform, mat_shine[0]);

        gl.uniform4f(shaderProgram.light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
        gl.uniform4f(shaderProgram.light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
        gl.uniform4f(shaderProgram.light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);


        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if (vertexTextureCoordBuffer != null) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexTextureCoordAttribute, vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        if (shape.label != "SKYBOX") {
            gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
            gl.bindTexture(gl.TEXTURE_2D, this.raygunTex);    // bind the texture object to the texture unit 
        } else {
            gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 

            if (shape.sublabel === "neg-z") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexNegZ);
            }
            else if (shape.sublabel === "neg-x") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexNegX);
            }
            else if (shape.sublabel === "pos-z") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexPosZ);
            }
            else if (shape.sublabel === "pos-x") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexPosX);
            }
            else if (shape.sublabel === "neg-y") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexNegY);
            }
            else if (shape.sublabel === "pos-y") {
                gl.bindTexture(gl.TEXTURE_2D, this.skyboxTexPosY);
            }
        }

        //test
        // console.log("Rendering cubemap shape")
        mat4.identity(v2wMatrix);
        v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
        //    v2wMatrix = mat4.inverse(v2wMatrix);     
        v2wMatrix = mat4.transpose(v2wMatrix);

        // console.log("v2wmat is", v2wMatrix, vMatrix)

        gl.activeTexture(gl.TEXTURE1);   // set texture unit 1 to use 
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture);    // bind the texture object to the texture unit 
        gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader


        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)

        //     if (shape.label == "RAYGUN") {
        //         gl.activeTexture(gl.TEXTURE0);   // set texture unit 0 to use 
        //         gl.bindTexture(gl.TEXTURE_2D, this.raygunTex);    // bind the texture object to the texture unit 
        //     } else if (shape.label == "CUBEMAP") {
        //         console.log("Rendering cubemap shape")
        //         mat4.identity(v2wMatrix);
        //         v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
        // //        v2wMatrix = mat4.inverse(v2wMatrix);     
        //         v2wMatrix = mat4.transpose(v2wMatrix); 

        //         gl.activeTexture(gl.TEXTURE1);   // set texture unit 1 to use 
        //         gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture);    // bind the texture object to the texture unit 
        //         gl.uniform1i(shaderProgram.cube_map_textureUniform, 1);   // pass the texture unit to the shader


        //     }

        // else {
        //     gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        //     gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0)
        // }

        // draw elementary arrays - triangle indices 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);

        this.setMatrixUniforms(mMatrix, vMatrix, pMatrix, nMatrix, v2wMatrix);




        // gl.drawElements(gl.LINE_STRIP, vertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 
        gl.drawElements(this.renderMode, vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.POINTS, vertexIndexBuffer.numItems , gl.UNSIGNED_SHORT, 0); 




    }




    //https://stackoverflow.com/questions/11116760/save-json-in-javascript-variable
    primeTeapot(path, color) {
        let request = new XMLHttpRequest()
        request.open("GET", path, false) //false makes the request synchronous
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                console.log("state=" + request.readyState)

            }
        }
        request.send(null)

        var jsonObject = JSON.parse(request.responseText)
        console.log("yes!", jsonObject)

        return this.teapotBuilder(jsonObject, color)
    }






    initCubeMap() {
        console.log("initting the cube map")
        this.cubemapTexture = gl.createTexture();
        this.cubemapTexture.image = new Image();

        this.cubemapTexture.negx = new Image();
        this.cubemapTexture.negy = new Image();
        this.cubemapTexture.negz = new Image();
        this.cubemapTexture.posx = new Image();
        this.cubemapTexture.posy = new Image();
        this.cubemapTexture.posz = new Image();

        // var func = this.handleCubemapTextureLoaded
        // var cmt = this.cubemapTexture

        // this.cubemapTexture.image.onload = function() { 
        //     console.log("calling handlecubemap")
        //     func(cmt); }

        // this.cubemapTexture.negx.src = "yokohama3/negx.jpg";
        // this.cubemapTexture.negy.src = "yokohama3/negy.jpg";
        // this.cubemapTexture.negz.src = "yokohama3/negz.jpg";
        // this.cubemapTexture.posx.src = "yokohama3/posx.jpg";
        // this.cubemapTexture.posy.src = "yokohama3/posy.jpg";
        // this.cubemapTexture.posz.src = "yokohama3/posz.jpg";
        // this.cubemapTexture.negx.src = "map/neg-x.jpg";
        // this.cubemapTexture.negy.src = "map/neg-y.jpg";
        // this.cubemapTexture.negz.src = "map/neg-z.jpg";
        // this.cubemapTexture.posx.src = "map/pos-x.jpg";
        // this.cubemapTexture.posy.src = "map/pos-y.jpg";
        // this.cubemapTexture.posz.src = "map/pos-z.jpg";
        this.cubemapTexture.negx.src = "map2/neg-x.jpg";
        this.cubemapTexture.negy.src = "map2/neg-y-sky2.jpg";
        this.cubemapTexture.negz.src = "map2/neg-z.jpg";
        this.cubemapTexture.posx.src = "map2/pos-x.jpg";
        this.cubemapTexture.posy.src = "map2/pos-y-sky2.jpg";
        this.cubemapTexture.posz.src = "map2/pos-z-sky.jpg";

        /*
                this.skyboxTexNegZ = this.loadTexture("map/neg-z.jpg")
        this.skyboxTexNegX = this.loadTexture("map/pos-x-sky.jpg")
        this.skyboxTexPosZ = this.loadTexture("map/pos-z-sky.jpg")
        this.skyboxTexPosX = this.loadTexture("map/neg-x-sky.jpg")
        this.skyboxTexNegY = this.loadTexture("map/neg-y-sky.jpg")
        this.skyboxTexPosY = this.loadTexture("map/pos-y-sky.jpg")

        */
        // this.cubemapTexture.negx.src = "yokohama3/brick.png";
        // this.cubemapTexture.negy.src = "yokohama3/brick.png";
        // this.cubemapTexture.negz.src = "yokohama3/brick.png";
        // this.cubemapTexture.posx.src = "yokohama3/brick.png";
        // this.cubemapTexture.posy.src = "yokohama3/brick.png";
        // this.cubemapTexture.posz.src = "yokohama3/brick.png";

        this.handleCubemapTextureLoaded()

        console.log("loading cubemap texture....")
    }


    handleCubemapTextureLoaded() {
        console.warn("handling the cube map", this.cubemapTexture)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubemapTexture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.posx);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.negx);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.posy);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.negy);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.posz);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
            this.cubemapTexture.negz);

        console.log("done handling the cube map")
    }

    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    // SKYBOX STUFF
    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////





    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////
    // RAYGUN STUFF
    /////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////

    primeRaygun(path, color) {
        let request = new XMLHttpRequest()
        request.open("GET", path, false) //false makes the request synchronous
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                console.log("state=" + request.readyState)

            }
        }
        request.send(null)

        var jsonObject = JSON.parse(request.responseText)
        console.log("yes!", jsonObject)

        return this.raygunBuilder(jsonObject, color)
    }

    //from mario.js
    computeSurfaceNormals(verts, faces) {
        var surfaceNormals = new Float32Array(faces.length);
        const npts = verts.length / 3;
        const ntris = faces.length / 3;
        for (var i = 0; i < ntris; i++) {
            var tri = [faces[i * 3], faces[i * 3 + 1], faces[i * 3 + 2]];
            // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
            var p0 = [verts[tri[0] * 3], verts[tri[0] * 3 + 1], verts[tri[0] * 3 + 2]];
            var p1 = [verts[tri[1] * 3], verts[tri[1] * 3 + 1], verts[tri[1] * 3 + 2]];
            var p2 = [verts[tri[2] * 3], verts[tri[2] * 3 + 1], verts[tri[2] * 3 + 2]];

            var u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
            var v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

            surfaceNormals[i * 3] = u[1] * v[2] - u[2] * v[1];
            surfaceNormals[i * 3 + 1] = u[2] * v[0] - u[0] * v[2];
            surfaceNormals[i * 3 + 2] = u[0] * v[1] - u[1] * v[0];
        }
        return surfaceNormals;
    }

    computeVertexNormals(verts, faces, surfaceNormals) {
        var vertexNormals = new Float32Array(verts.length);
        const npts = verts.length / 3;
        const ntris = faces.length / 3;
        for (var i = 0; i < ntris; i++) {
            // var tri = [faces[i*11+1], faces[i*11+2], faces[i*11+3]];
            var tri = [faces[i * 3], faces[i * 3 + 1], faces[i * 3 + 2]];

            for (var t = 0; t < 3; t++) {
                for (var j = 0; j < 3; j++) {
                    vertexNormals[tri[t] * 3 + j] = vertexNormals[tri[t] * 3 + j] + surfaceNormals[i * 3 + j];
                }
            }
        }

        for (var i = 0; i < npts; i++) {
            var n = [vertexNormals[i * 3], vertexNormals[i * 3 + 1], vertexNormals[i * 3 + 2]];
            var mag = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
            for (var j = 0; j < 3; j++)
                vertexNormals[i * 3 + j] = vertexNormals[i * 3 + j] / mag;
        }
        return vertexNormals;
    }


    initTextures() {
        // sampleTexture = gl.createTexture();
        // sampleTexture.image = new Image();
        // sampleTexture.image.onload = function() { handleTextureLoaded(sampleTexture); }
        console.log("loading texture....")
        this.raygunTex = this.loadTexture("raygun/ray_gun.jpg")
        this.skyboxTexNegZ = this.loadTexture("map/neg-z-sky.jpg")
        this.skyboxTexNegX = this.loadTexture("map/pos-x-sky.jpg")
        this.skyboxTexPosZ = this.loadTexture("map/pos-z.jpg")
        this.skyboxTexPosX = this.loadTexture("map/neg-x-sky.jpg")
        this.skyboxTexNegY = this.loadTexture("map/neg-y-sky2.jpg")
        this.skyboxTexPosY = this.loadTexture("map/pos-y-sky2.jpg")






    }

    isPowerOf2(value) {

        return (value & (value - 1)) === 0;
    }

    loadTexture(url) { // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            );

            // WebGL1 has different requirements for power of 2 images
            // vs. non power of 2 images so check if the image is a
            // power of 2 in both dimensions.
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
                console.log("power of 2")
            } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        };
        image.src = url;

        return texture;
    }

    // handleTextureLoaded(texture) {
    //     gl.bindTexture(gl.TEXTURE_2D, texture);
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //     gl.bindTexture(gl.TEXTURE_2D, null);
    // }

    raygunBuilder(jsonData, color) {
        console.log("Trying to prime the raygun!")
        var currentShape = {}

        console.log("Raygun json is:", jsonData)



        var localVertexPositionBuffer;
        var localVertexNormalBuffer;
        var localVertexColorBuffer;
        var localVertexIndexBuffer;
        var localVertexTextureCoordBuffer;

        ///////////////////////
        // vertecies
        ///////////////////////

        localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(jsonData.vertices), gl.STATIC_DRAW)
        localVertexPositionBuffer.itemSize = 3
        localVertexPositionBuffer.numItems = jsonData.vertices.length / 3


        //////////////////////
        // faces
        //////////////////////

        var faces = new Uint16Array(jsonData.faces.length / 11 * 3);
        for (var i = 0; i < jsonData.faces.length / 11; i++) {
            faces[i * 3] = jsonData.faces[i * 11 + 1];
            faces[i * 3 + 1] = jsonData.faces[i * 11 + 2];
            faces[i * 3 + 2] = jsonData.faces[i * 11 + 3];
        }

        ///////////////////////
        // normals
        ///////////////////////


        var surfaceNormals = this.computeSurfaceNormals(jsonData.vertices, faces);
        var vertexNormals = this.computeVertexNormals(jsonData.vertices, faces, surfaceNormals);

        localVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
        localVertexNormalBuffer.itemSize = 3;
        localVertexNormalBuffer.numItems = vertexNormals.length / 3;

        ///////////////////////
        // indices
        ///////////////////////

        localVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faces, gl.STATIC_DRAW);
        localVertexIndexBuffer.itemSize = 1;
        localVertexIndexBuffer.numItems = faces.length;

        ///////////////////////
        // colors
        ///////////////////////

        localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);

        var colors = []
        if (color == null) {
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(Math.random())
                }
            }
        } else {
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(color[j])
                }
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 3;
        localVertexColorBuffer.numItems = localVertexPositionBuffer.numItems;

        ///////////////////////
        // texture
        ///////////////////////

        localVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(jsonData.uvs[0]),
            gl.STATIC_DRAW);
        localVertexTextureCoordBuffer.itemSize = 2;
        localVertexTextureCoordBuffer.numItems = jsonData.uvs[0].length / 2;


        // find_range(jsonData.vertices);




        currentShape.vertexTextureCoordBuffer = localVertexTextureCoordBuffer
        currentShape.vertexPositionBuffer = localVertexPositionBuffer
        currentShape.vertexIndexBuffer = localVertexIndexBuffer
        currentShape.vertexColorBuffer = localVertexColorBuffer
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "RAYGUN"


        return currentShape





    }



    teapotBuilder(jsonData, color) {
        console.log("Trying to prime the teapot!")
        var currentShape = {}

        console.log("Teapot json is:", jsonData)


        var localVertexPositionBuffer;
        var localVertexNormalBuffer;
        var localVertexColorBuffer;
        var localVertexIndexBuffer;

        ///////////////////////
        // vertecies
        ///////////////////////

        localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(jsonData.vertexPositions), gl.STATIC_DRAW)
        localVertexPositionBuffer.itemSize = 3
        localVertexPositionBuffer.numItems = jsonData.vertexPositions.length / 3

        ///////////////////////
        // normals
        ///////////////////////

        localVertexNormalBuffer = gl.createBuffer()
        this.gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer)
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(jsonData.vertexNormals), gl.STATIC_DRAW)
        localVertexNormalBuffer.itemSize = 3
        localVertexNormalBuffer.numItems = jsonData.vertexNormals.length / 3

        ///////////////////////
        // colors
        ///////////////////////

        localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);

        var colors = []
        if (color == null) {
            // colors = [
            //     1.0, 0.0, 0.0,
            //     0.0, 1.0, 0.0,
            //     0.0, 0.0, 1.0,
            //     1.0, 0.0, 0.0,
            //     1.0, 0.0, 0.0,
            //     0.0, 1.0, 0.0,
            //     0.0, 0.0, 1.0,
            //     1.0, 0.0, 0.0	    
            // ];
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(Math.random())
                }
            }
        } else {
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(color[j])
                }
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 3;
        localVertexColorBuffer.numItems = localVertexPositionBuffer.numItems;

        //////////////////////
        // indicies
        //////////////////////

        localVertexIndexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer)
        this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(jsonData.indices), gl.STATIC_DRAW)
        localVertexIndexBuffer.itemSize = 1
        localVertexIndexBuffer.numItems = jsonData.indices.length


        currentShape.vertexPositionBuffer = localVertexPositionBuffer
        currentShape.vertexIndexBuffer = localVertexIndexBuffer
        currentShape.vertexColorBuffer = localVertexColorBuffer
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "TEAPOT"


        return currentShape


    }







    primeSquare(size, color) {


        var sqvertices = [
            0.5, 0.5, 0,
            -0.5, 0.5, 0,
            - 0.5, -0.5, 0,
            0.5, -0.5, 0,
        ];

        var sqindices = [0, 1, 2, 0, 2, 3];

        var sqcolors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
        ];

        var sqnormals = [
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];

        var sqTexCoords = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];


        var currentShape = {}


        var localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqvertices), gl.STATIC_DRAW);
        localVertexPositionBuffer.itemSize = 3;
        localVertexPositionBuffer.numItems = 4;

        var localVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqnormals), gl.STATIC_DRAW);
        localVertexNormalBuffer.itemSize = 3;
        localVertexNormalBuffer.numItems = 4;

        var localVertexTexCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexTexCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqTexCoords), gl.STATIC_DRAW);
        localVertexTexCoordsBuffer.itemSize = 2;
        localVertexTexCoordsBuffer.numItems = 4;

        var localVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sqindices), gl.STATIC_DRAW);
        localVertexIndexBuffer.itemsize = 1;
        localVertexIndexBuffer.numItems = 6;

        var localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sqcolors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 4;
        localVertexColorBuffer.numItems = 4;

        currentShape.vertexTextureCoordBuffer = localVertexTexCoordsBuffer
        currentShape.vertexPositionBuffer = localVertexPositionBuffer
        currentShape.vertexIndexBuffer = localVertexIndexBuffer
        currentShape.vertexColorBuffer = localVertexColorBuffer
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "SKYBOX"

        return currentShape

    }




    /*

    primeCube code adapted from 3Dcube.js in the tutorial folder

    */
    primeCube(size, color) {


        var currentShape = {}

        var localVertexPositionBuffer;
        var localVertexColorBuffer;
        var localVertexIndexBuffer;
        var localVertexNormalBuffer

        //////////////////////////////
        //Set up local verticies
        //////////////////////////////
        localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);
        var vertices = [
            //set 1
            (size / 2), (size / 2), -(size / 2),
            -(size / 2), (size / 2), -(size / 2),
            -(size / 2), -(size / 2), -(size / 2),
            (size / 2), -(size / 2), -(size / 2),
            (size / 2), (size / 2), (size / 2),
            -(size / 2), (size / 2), (size / 2),
            -(size / 2), -(size / 2), (size / 2),
            (size / 2), -(size / 2), (size / 2),
            //set2
            (size / 2), (size / 2), -(size / 2),
            -(size / 2), (size / 2), -(size / 2),
            -(size / 2), -(size / 2), -(size / 2),
            (size / 2), -(size / 2), -(size / 2),
            (size / 2), (size / 2), (size / 2),
            -(size / 2), (size / 2), (size / 2),
            -(size / 2), -(size / 2), (size / 2),
            (size / 2), -(size / 2), (size / 2),
            //set3
            (size / 2), (size / 2), -(size / 2),
            -(size / 2), (size / 2), -(size / 2),
            -(size / 2), -(size / 2), -(size / 2),
            (size / 2), -(size / 2), -(size / 2),
            (size / 2), (size / 2), (size / 2),
            -(size / 2), (size / 2), (size / 2),
            -(size / 2), -(size / 2), (size / 2),
            (size / 2), -(size / 2), (size / 2)




        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        localVertexPositionBuffer.itemSize = 3;
        localVertexPositionBuffer.numItems = 24;

        //////////////////////////
        //Set up cube indicies
        //////////////////////////

        // var indices = [ 
        //                 0,1,2, 0,2,3, //back
        //                 0,3,7, 0,7,4, //right
        //                 6,2,3, 6,3,7, //bottom
        //                 5,1,2, 5,2,6, //right
        //                 5,1,0, 5,0,4, //top
        //                 5,6,7, 5,7,4  //front
        //             ];
        var indices = [
            0, 1, 2, 0, 2, 3,      //back
            8, 11, 15, 8, 15, 12,    //right
            22, 18, 19, 22, 19, 23,   //bottom
            13, 9, 10, 13, 10, 14,   //left
            21, 17, 16, 21, 16, 20,   //top
            5, 6, 7, 5, 7, 4       //front

        ]

        //the face names are not correct e.g. right face is bottom face
        var normals = [

            //back face: { 0, 1, 2, 0, 2, 3,} -> [0, 0, -1]
            //verified
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,

            //front face: {5, 6, 7, 5, 7, 4} -> [0, 0, 1]
            //verified
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,

            //right face: {8, 11, 15, 12} -> [1, 0, 0]
            //left face: {13, 9, 10, 13, 10, 14,} -> [-1, 0, 0]
            1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0,
            1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0,


            //bottom face: {22, 18, 19, 22, 19, 23,} -> [0, -1, 0]
            //top face: {21, 17, 16, 21, 16, 20,} -> [0, 1, 0]
            0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0,
            0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0,





        ]







        localVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        localVertexIndexBuffer.itemsize = 1;
        localVertexIndexBuffer.numItems = 36;   //36 indices, 3 per triangle, so 12 triangles 

        localVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        localVertexNormalBuffer.itemSize = 3
        localVertexNormalBuffer.numItems = 24






        ////////////////////////////
        //Set up cube colors
        ////////////////////////////

        localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);

        var colors = []
        if (color == null) {
            // colors = [
            //     1.0, 0.0, 0.0,
            //     0.0, 1.0, 0.0,
            //     0.0, 0.0, 1.0,
            //     1.0, 0.0, 0.0,
            //     1.0, 0.0, 0.0,
            //     0.0, 1.0, 0.0,
            //     0.0, 0.0, 1.0,
            //     1.0, 0.0, 0.0	    
            // ];
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(Math.random())
                }
            }
        } else {
            for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
                for (let j = 0; j < 3; j++) {
                    colors.push(color[j])
                }
            }
        }

        console.log("Cube color!", color)

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 3;
        localVertexColorBuffer.numItems = 8;

        currentShape.vertexPositionBuffer = localVertexPositionBuffer;
        currentShape.vertexIndexBuffer = localVertexIndexBuffer;
        currentShape.vertexColorBuffer = localVertexColorBuffer;
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "CUBE"

        return currentShape

    }


    primeCylinder(radBase, radTop, height, numSlices, numStacks, color) {


        var data = new cylinder(radBase, radTop, height, numSlices, numStacks, color)
        var combinedVertexIndices = data.indices
        var combinedVertexPositions = data.positions
        var combinedVertexNormals = data.normals


        var currentShape = {}
        var localVertexPositionBuffer;
        var localVertexColorBuffer;
        var localVertexIndexBuffer;
        var localVertexNormalBuffer

        //////////////////////////////
        //Set up local verticies
        //////////////////////////////
        localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(combinedVertexPositions), gl.STATIC_DRAW);
        localVertexPositionBuffer.itemSize = 3;
        localVertexPositionBuffer.numItems = combinedVertexPositions.length;

        //////////////////////////
        //Set up local indicies
        //////////////////////////


        // for (let i = 0; i < topCircle.indicies.length; i++) {
        //     indices.push(topCircle.indicies[i] + bottomCircle.indicies.length - 1)
        // }


        localVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(combinedVertexIndices), gl.STATIC_DRAW);
        localVertexIndexBuffer.itemsize = 1;
        localVertexIndexBuffer.numItems = combinedVertexIndices.length;// + bottomCircle.indicies.length;   //36 indices, 3 per triangle, so 12 triangles 

        ///////////////////////
        // normals
        ///////////////////////

        localVertexNormalBuffer = gl.createBuffer()
        this.gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer)
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(combinedVertexNormals), gl.STATIC_DRAW)
        localVertexNormalBuffer.itemSize = 3
        localVertexNormalBuffer.numItems = combinedVertexNormals.length / 3

        ////////////////////////////
        //Set up cube colors
        ////////////////////////////

        localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);
        var colors = []

        for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {

            if (color == null) {
                for (let j = 0; j < 3; j++) {
                    colors.push(Math.random())
                }
            } else {
                for (let j = 0; j < 3; j++) {
                    colors.push(color[j])
                }
            }
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 3;
        localVertexColorBuffer.numItems = localVertexPositionBuffer.numItems;

        currentShape.vertexPositionBuffer = localVertexPositionBuffer;
        currentShape.vertexIndexBuffer = localVertexIndexBuffer;
        currentShape.vertexColorBuffer = localVertexColorBuffer;
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "CYLINDER"

        return currentShape


    }

    primeSphere(radius, numSlices, numStacks, color) {


        var data = new sphere(radius, numSlices, numStacks, color)
        var combinedVertexIndices = data.indices
        var combinedVertexPositions = data.positions
        var combinedVertexNormals = data.normals


        var currentShape = {}
        var localVertexPositionBuffer;
        var localVertexColorBuffer;
        var localVertexIndexBuffer;
        var localVertexNormalBuffer;

        //////////////////////////////
        //Set up local verticies
        //////////////////////////////
        localVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(combinedVertexPositions), gl.STATIC_DRAW);
        localVertexPositionBuffer.itemSize = 3;
        localVertexPositionBuffer.numItems = combinedVertexPositions.length / 3;

        ///////////////////////
        // normals
        ///////////////////////

        localVertexNormalBuffer = gl.createBuffer()
        this.gl.bindBuffer(gl.ARRAY_BUFFER, localVertexNormalBuffer)
        this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(combinedVertexNormals), gl.STATIC_DRAW)
        localVertexNormalBuffer.itemSize = 3
        localVertexNormalBuffer.numItems = combinedVertexNormals.length / 3

        //////////////////////////
        //Set up local indicies
        //////////////////////////


        // for (let i = 0; i < topCircle.indicies.length; i++) {
        //     indices.push(topCircle.indicies[i] + bottomCircle.indicies.length - 1)
        // }


        localVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, localVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(combinedVertexIndices), gl.STATIC_DRAW);
        localVertexIndexBuffer.itemsize = 1;
        localVertexIndexBuffer.numItems = combinedVertexIndices.length;// + bottomCircle.indicies.length;   //36 indices, 3 per triangle, so 12 triangles 


        ////////////////////////////
        //Set up cube colors
        ////////////////////////////

        localVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, localVertexColorBuffer);
        var colors = []

        for (let i = 0; i < localVertexPositionBuffer.numItems; i++) {
            if (color == null) {
                for (let j = 0; j < 3; j++) {
                    colors.push(Math.random())
                }
            } else {
                for (let j = 0; j < 3; j++) {
                    colors.push(color[j])
                }
            }

        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        localVertexColorBuffer.itemSize = 3;
        localVertexColorBuffer.numItems = localVertexPositionBuffer.numItems;

        currentShape.vertexPositionBuffer = localVertexPositionBuffer;
        currentShape.vertexIndexBuffer = localVertexIndexBuffer;
        currentShape.vertexColorBuffer = localVertexColorBuffer;
        currentShape.vertexNormalBuffer = localVertexNormalBuffer

        currentShape.label = "SPHERE"


        return currentShape


    }

}