//////////////////////////////////////////////////////
//
//    Lab 5
//    
//    Code authored by:
//    Will Altman (altman.120@osu.edu)
//
//    Contains high level code for building the scene
//
//////////////////////////////////////////////////////



class scene_builder {

    nameToIndex = {}
    generics = null;
    lightbulb = null;
    man = null;
    manPos = null


    constructor(shapeContainer, shapeVBOs, lightPos) {
        this.shapeContainer = shapeContainer
        this.shapeVBOs = shapeVBOs
        // this.generics = null
        this.lightPos = lightPos
        this.manPos = [0, 0, 0]
        console.log("Manpos in constructior", this.manPos)

    }

    get generics() {
        return this.generics
    }

    get lightbulb() {
        return this.lightbulb
    }

    get man() {
        return this.man
    }

    set setManPos(pos) {
        console.warn("trying to set manpos")
        this.manPos = pos
        console.warn("manPos set to", pos, this.manPos)
    }

    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////


    primeScene(skybox) {
        console.log("DOING BOX SKY RECIEVED", skybox)

        let shapeCollection = []

        shapeCollection = shapeCollection.concat(this.generateGround())
        shapeCollection = shapeCollection.concat(this.generateTrees())

        this.man = this.generateMan()
        shapeCollection = shapeCollection.concat(this.man)

        this.generics = this.generateGenerics()
        shapeCollection = shapeCollection.concat(this.generics)

        this.lightbulb = this.generateLightbulb()
        shapeCollection = shapeCollection.concat(this.lightbulb)


        this.skybox = this.generateSkybox()


        shapeCollection = shapeCollection.concat(this.skybox)

        shapeCollection.forEach(function (shape) {
            matrix_ops.translateMatrix(shape, [0, 0, -5])
        });

        return shapeCollection, this.skybox
    }



    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////

    generateRaygun() {
        let shapeCollection = []

        shapeCollection = shapeCollection.concat(this.placeRaygun(0, 1, -2))

        return shapeCollection
    }

    generateTeapot() {
        let shapeCollection = []

        shapeCollection = shapeCollection.concat(this.placeTeapot(-2, 1, -5))

        return shapeCollection
    }

    generateLightbulb() {
        let shapeCollection = []

        shapeCollection = shapeCollection.concat(this.placeLightbulb(this.lightPos[0], this.lightPos[1], this.lightPos[2] + 5))

        return shapeCollection
    }

    generateSkybox() {

        let shapeCollection = []

        let dist = 100

        // shapeCollection = shapeCollection.concat(this.placeSquare(0, 0, -dist / 2, "neg-z", dist))
        // shapeCollection = shapeCollection.concat(this.placeSquare(-dist / 2, 0, 0, "neg-x", dist))
        // shapeCollection = shapeCollection.concat(this.placeSquare(0, 0, dist / 2, "pos-z", dist))
        // shapeCollection = shapeCollection.concat(this.placeSquare(dist / 2, 0, 0, "pos-x", dist))
        // shapeCollection = shapeCollection.concat(this.placeSquare(0, -dist / 2, 0, "neg-y", dist))
        // shapeCollection = shapeCollection.concat(this.placeSquare(0, dist / 2, 0, "pos-y", dist))


        shapeCollection = shapeCollection.concat(this.placeSquare(0, 0, -dist / 2, "neg-z", dist))
        shapeCollection = shapeCollection.concat(this.placeSquare(-dist / 2, 0, 0, "pos-x", dist))
        shapeCollection = shapeCollection.concat(this.placeSquare(0, 0, dist / 2, "pos-z", dist))
        shapeCollection = shapeCollection.concat(this.placeSquare(dist / 2, 0, 0, "neg-x", dist))
        shapeCollection = shapeCollection.concat(this.placeSquare(0, -dist / 2, 0, "neg-y", dist))
        shapeCollection = shapeCollection.concat(this.placeSquare(0, dist / 2, 0, "pos-y", dist))


        //not skybox oh well
        shapeCollection = shapeCollection.concat(this.placeSphereCubeMap(0, 0, 15))







        return shapeCollection


    }

    generateGenerics() {
        let shapeCollection = []

        // shapeCollection = shapeCollection.concat(this.placeGenericCube(-2, -1.4, -3))
        // shapeCollection = shapeCollection.concat(this.placeGenericSphere(2, -1.4, -3))
        // shapeCollection = shapeCollection.concat(this.placeGenericCylinder(0, -1, -5))


        shapeCollection = shapeCollection.concat(this.placeGenericCube(3, 2, -2))
        shapeCollection = shapeCollection.concat(this.placeGenericSphere(-3, 2, -2))
        shapeCollection = shapeCollection.concat(this.placeGenericCylinder(1, 1.75, -2))
        shapeCollection = shapeCollection.concat(this.placeTeapot(-1, 2, -2))
        shapeCollection = shapeCollection.concat(this.placeRaygun(-1, 0, -2))
        shapeCollection = shapeCollection.concat(this.placeCubeMap(5, 0, -5))





        return shapeCollection
    }

    generateMan() {
        let shapeCollection = []

        shapeCollection = shapeCollection.concat(this.generateHead())
        shapeCollection = shapeCollection.concat(this.generateEyeballs())
        shapeCollection = shapeCollection.concat(this.generateBody())

        console.log("Generating the man...", this.manPos)
        let x = this.manPos[0]
        let y = this.manPos[1]
        let z = this.manPos[2]

        shapeCollection.forEach(function (shape) {
            matrix_ops.translateMatrix(shape, [x, y, z])
        });

        return shapeCollection
    }

    generateHead() {
        let shape = null
        let shapeCollection = []

        shape = this.placeHead(0, 1, 0)
        shapeCollection.push(shape)

        return shapeCollection
    }

    generateEyeballs() {
        let shape = null
        let shapeCollection = []

        shape = this.placeEyeball(-0.1, 1, 0.25)
        shapeCollection.push(shape)

        shape = this.placeEyeball(0.1, 1, 0.25)
        shapeCollection.push(shape)

        return shapeCollection
    }

    generateBody() {
        let shape = null;
        let shapeCollection = []

        //torso
        shape = this.placeRainbowBodyPart(0, 0.5, 0)
        matrix_ops.scaleTo(shape, [0.15, 0.35, 0.15])
        matrix_ops.rotateMatrix(shape, 90, [0, 1, 0])
        shapeCollection.push(shape)

        //legs
        shape = this.placeBodyPart(0.125, 0.1, 0)
        matrix_ops.scaleTo(shape, [0.05, 0.2, 0.05])
        matrix_ops.rotateMatrix(shape, 20, [0, 0, 1])
        shapeCollection.push(shape)

        shape = this.placeBodyPart(-0.125, 0.1, 0)
        matrix_ops.scaleTo(shape, [0.05, 0.2, 0.05])
        matrix_ops.rotateMatrix(shape, -20, [0, 0, 1])
        shapeCollection.push(shape)

        //arms
        shape = this.placeBodyPart(0.25, 0.65, 0)
        matrix_ops.scaleTo(shape, [0.05, 0.2, 0.05])
        matrix_ops.rotateMatrix(shape, 110, [0, 0, 1])
        shapeCollection.push(shape)

        shape = this.placeBodyPart(-0.25, 0.725, 0)
        matrix_ops.scaleTo(shape, [0.05, 0.2, 0.05])
        matrix_ops.rotateMatrix(shape, 40, [0, 0, 1])
        shapeCollection.push(shape)


        return shapeCollection

    }


    generateGround() {
        let shapeCollection = []

        for (let x = -2; x <= 2; x++) {
            for (let z = -6; z <= 0; z++) {
                shapeCollection.push(this.placeGrassTile(x, -1.9, z))
            }
        }

        return shapeCollection
    }

    generateTrees() {
        let shapeCollection = []
        let shape = null

        shapeCollection.push(this.placeTreeLeaves(-2, -0.5, -6))
        shapeCollection.push(this.placeTreeTrunks(-2, -1.9, -6))

        shapeCollection.push(this.placeTreeLeaves(2, -0.5, -6))
        shapeCollection.push(this.placeTreeTrunks(2, -1.9, -6))

        shapeCollection.push(this.placeTreeLeaves(-2, -0.5, 0))
        shapeCollection.push(this.placeTreeTrunks(-2, -1.9, 0))

        shape = this.placeTreeLeaves(3, -1.9, 1)
        matrix_ops.rotateMatrix(shape, 90, [1, 0, -1])
        matrix_ops.translateMatrix(shape, [0, 0.25, 0])
        shapeCollection.push(shape)


        shape = this.placeTreeTrunks(2, -1.9, 0)
        matrix_ops.rotateMatrix(shape, 90, [1, 0, -1])
        matrix_ops.translateMatrix(shape, [0, 0.2, 0])
        shapeCollection.push(shape)

        return shapeCollection


    }




    ////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////



    colorConverter(r, g, b) {
        return [r / 255, g / 255, b / 255]
    }


    placeTeapot(x, y, z) {
        if (!("teapot" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("TEAPOT", this.colorConverter(200, 100, 255))
            this.nameToIndex["teapot"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["teapot"], false)
        matrix_ops.scaleTo(shape, [0.05, 0.05, 0.05])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "TEAPOT"

        return shape
    }


    placeRaygun(x, y, z) {
        console.log("Placing the RAYGUN")
        if (!("raygun" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("RAYGUN", this.colorConverter(66, 135, 245))
            this.nameToIndex["raygun"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["raygun"], false)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.rotateMatrix(shape, 90, [0, 1, 0])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "RAYGUN"

        return shape
    }

    placeSquare(x, y, z, sublabel, dist) {
        if (!("skysquare" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("SQUARE", this.colorConverter(200, 100, 255), [0.5])
            this.nameToIndex["skysquare"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["skysquare"], false)
        matrix_ops.scaleTo(shape, [dist, dist, dist])

        if (sublabel === "neg-z") {
            matrix_ops.rotateMatrix(shape, 180, [0, 0, 1])
        }
        else if (sublabel === "neg-x") {
            matrix_ops.rotateMatrix(shape, 90, [0, 1, 0])
        }
        else if (sublabel === "pos-z") {
            matrix_ops.rotateMatrix(shape, 180, [0, 0, 1])
        }
        else if (sublabel === "pos-x") {
            matrix_ops.rotateMatrix(shape, 90, [0, 1, 0])
        }
        else if (sublabel === "neg-y") {
            matrix_ops.rotateMatrix(shape, 90, [1, 0, 0])
        }
        else if (sublabel === "pos-y") {
            matrix_ops.rotateMatrix(shape, -90, [1, 0, 0])
        }



        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SKYBOX"
        shape.sublabel = sublabel

        return shape
    }

    placeGenericCube(x, y, z) {
        if (!("genericcube" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("CUBE", this.colorConverter(200, 100, 255), [0.5])
            this.nameToIndex["genericcube"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["genericcube"], false)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CUBE"

        return shape
    }


    placeCubeMap(x, y, z) {
        if (!("cmap" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("CUBE", this.colorConverter(200, 100, 255), [0.5])
            this.nameToIndex["cmap"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["cmap"], false)
        matrix_ops.scaleTo(shape, [5, 5, 5])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CUBEMAP"

        return shape
    }

    placeSphereCubeMap(x, y, z) {
        if (!("bigcmap" in this.nameToIndex)) {
            //size, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(200, 100, 255), [0.5, 30, 30])
            this.nameToIndex["bigcmap"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["bigcmap"], false)
        matrix_ops.scaleTo(shape, [5, 5, 5])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CUBEMAP"

        return shape
    }

    placeLightbulb(x, y, z) {
        if (!("lightbulb" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(255, 255, 255), [0.5, 12, 12])
            this.nameToIndex["lightbulb"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["lightbulb"], false)
        matrix_ops.scaleTo(shape, [0.33334, 0.33334, 0.33334])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeGenericCylinder(x, y, z) {
        if (!("genericcylinder" in this.nameToIndex)) {
            //radBase, radTop, height, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("CYLINDER", this.colorConverter(200, 100, 255), [0.5, 0.2, 0.5, 8, 4])
            this.nameToIndex["genericcylinder"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["genericcylinder"], false)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CYLINDER"

        return shape
    }

    placeGenericSphere(x, y, z) {
        if (!("genericsphere" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(200, 100, 255), [0.5, 12, 12])
            this.nameToIndex["genericsphere"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["genericsphere"], false)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeRainbowBodyPart(x, y, z) {
        if (!("rainbowbodypart" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", null, [1, 8, 8])
            this.nameToIndex["rainbowbodypart"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["rainbowbodypart"], true)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeBodyPart(x, y, z) {
        if (!("bodypart" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(23, 96, 232), [1, 8, 8])
            this.nameToIndex["bodypart"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["bodypart"], true)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeEyeball(x, y, z) {
        if (!("eyeball" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(130, 33, 119), [0.05, 4, 4])
            this.nameToIndex["eyeball"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["eyeball"], true)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeHead(x, y, z) {
        if (!("head" in this.nameToIndex)) {
            //radius, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(52, 229, 235), [0.25, 16, 16])
            this.nameToIndex["head"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["head"], true)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape
    }

    placeTreeTrunks(x, y, z) {
        if (!("tree_trunks" in this.nameToIndex)) {
            //radBase, radTop, height, numSlices, numStacks, color
            let name = this.shapeVBOs.generateNewShape("CYLINDER", this.colorConverter(143, 88, 0), [0.05, 0.2, 0.5, 6, 3])
            this.nameToIndex["tree_trunks"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["tree_trunks"], false)
        matrix_ops.scaleTo(shape, [1, 1, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CYLINDER"

        return shape
    }

    placeTreeLeaves(x, y, z) {
        if (!("tree_leaves" in this.nameToIndex)) {
            let name = this.shapeVBOs.generateNewShape("SPHERE", this.colorConverter(51, 204, 112), [1, 8, 8])
            this.nameToIndex["tree_leaves"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["tree_leaves"], false)
        matrix_ops.scaleTo(shape, [0.4, 1, 0.4])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "SPHERE"

        return shape


    }


    placeGrassTile(x, y, z) {
        if (!("grass_tile" in this.nameToIndex)) {
            let name = this.shapeVBOs.generateNewShape("CUBE", this.colorConverter(29, 143, 0), [1])
            this.nameToIndex["grass_tile"] = name
        }

        let shape = shapeContainer.buildShape(this.nameToIndex["grass_tile"], false)
        matrix_ops.scaleTo(shape, [1, 0.2, 1])
        matrix_ops.translateMatrix(shape, [x, y, z])

        shape.label = "CUBE"

        return shape


    }





}


