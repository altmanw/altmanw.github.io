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
//    Circle generation help:
//    https://stackoverflow.com/questions/14829621/
//
//    Contains helper methods for performing operations on the matricies
//
//////////////////////////////////////////////////////


class cylinder {

    constructor(radBase, radTop, height, numSlices, numStacks, color) {
        this.angle = this.generateAngle(radBase, radTop, height)
        let init = this.generateCylinderData(radBase, radTop, height, numSlices, numStacks, color)
        this.combinedVertexIndices = init.combinedVertexIndices
        this.combinedVertexPositions = init.combinedVertexPositions
        this.combinedVertexNormals = init.combinedVertexNormals 
    }

    get indices() {
        return this.combinedVertexIndices
    }

    get positions() {
        return this.combinedVertexPositions
    }

    get normals() {
        return this.combinedVertexNormals
    }

    generateCircle(radius, numPoints, y, offset, centerNormalY) {

        var ret = {}
        
        var positions = []
        var indices = []
        var normals = []
    
        //init origin at the start
        positions.push(0)
        positions.push(y)
        positions.push(0)

        normals.push(0)
        normals.push(centerNormalY != null ? centerNormalY : 0)
        normals.push(0)


        //init circle points
        for(let i = 0; i < numPoints; i++) {

            let rad = i * ((2 * (Math.PI)) / (numPoints)) //in radians

            let x = radius * Math.cos(rad)
            let z = radius * Math.sin(rad)

            let dist = Math.sqrt(x * x + z * z)
            let yOffset = dist * Math.tan(this.angle)


            positions.push(x) //x
            positions.push(y) //y
            positions.push(z) //z

            normals.push(x)
            normals.push(centerNormalY != null ? centerNormalY + y : y + yOffset)
            normals.push(z)


        }

        if (offset != -1) {
            for (let i = 1; i < numPoints; i++) {
                indices.push(0) //midpoint
                indices.push(0 + i) 
                indices.push(0 + i + 1)

            }

            //last triangle
            indices.push(0)
            indices.push(0 + numPoints)
            indices.push(0 + 1)
        }
    
        ret.positions = positions
        ret.indices = indices
        ret.normals = normals

        return ret


    }

    //bottomPos and topPos are the index in the combined array that each respective element starts at
    //len is the length of each list
    //list is the combined list with all the positions
    connectCirclesTriangle(bottomPos, topPos, len) {
        var ret = [];

        for (let i = 1; i < len - 1; i++) {
            let triangleOne = [bottomPos + i, topPos + i, topPos + i + 1]
            let triangleTwo = [bottomPos + i, bottomPos + i + 1, topPos + i + 1]

            ret = ret.concat(triangleOne)
            ret = ret.concat(triangleTwo)

        }

        //last triangle
        let triangleOne = [bottomPos + len - 1, topPos + len - 1, topPos + 1]
        let triangleTwo = [bottomPos + len - 1, bottomPos + 1, topPos + 1]

        ret = ret.concat(triangleOne)
        ret = ret.concat(triangleTwo)


        return ret

    }


    generateAngle(radBase, radTop, height) {
        let biggerRad = radBase > radTop ? radBase : radTop
        let smallerRad =  radBase > radTop ? radTop : radBase

        let triangleBase = biggerRad - smallerRad

        let angle = Math.atan(height / triangleBase)

        if (radTop > radBase) {
            return angle * -1
        } else {
            return angle
        }

    }


    generateCylinderData(radBase, radTop, height, numSlices, numStacks) {

        //prime deltas
        var radDelta= (radBase - radTop) / (numStacks - 1)
        var workingRad = radBase
        var heightDelta = height / (numStacks - 1) 
        var workingHeight = 0 


        //create the base
        var bottomCircle = this.generateCircle(radBase, numSlices, 0, 0)
        var bottomCircleDuplicate = this.generateCircle(radBase, numSlices, 0, 0, -1)

        var combinedVertexPositions = bottomCircle.positions
        var combinedVertexNormals = bottomCircle.normals

        //create the top
        var topCircle = this.generateCircle(radTop, numSlices, height, bottomCircle.indices.length / 3)
        var topCircleDuplicate = this.generateCircle(radTop, numSlices, height, bottomCircle.indices.length / 3, 1)


        //create stacks
        for (let i = 1; i < numStacks - 1; i++) {
            workingRad -= radDelta
            workingHeight += heightDelta

            let tempCircle = this.generateCircle(workingRad, numSlices, workingHeight, -1)
            combinedVertexPositions = combinedVertexPositions.concat(tempCircle.positions)
            combinedVertexNormals = combinedVertexNormals.concat(tempCircle.normals)
        }

        combinedVertexPositions = combinedVertexPositions.concat(topCircle.positions)
        combinedVertexNormals = combinedVertexNormals.concat(topCircle.normals)

        var start = combinedVertexPositions.length / 3

        combinedVertexPositions = combinedVertexPositions.concat(topCircleDuplicate.positions)
        combinedVertexNormals = combinedVertexNormals.concat(topCircleDuplicate.normals)
        // combinedVertexIndices = combinedVertexIndices.concat(topCircleDuplicate.indices)

        var nextStart = combinedVertexPositions.length / 3

        combinedVertexPositions = combinedVertexPositions.concat(bottomCircleDuplicate.positions)
        combinedVertexNormals = combinedVertexNormals.concat(bottomCircleDuplicate.normals)
        // combinedVertexIndices = combinedVertexIndices.concat(bottomCircleDuplicate.indices)




        /////////////////////////////////////////////////////////

        //offset the top indices
        // for (let i = start; i < topCircle.indices.length + start; i++) {
        //     topCircle.indices[i] += (bottomCircle.indices.length / 3 + 1) * (numStacks - 1)
        // }

        for (let i = 0; i < topCircleDuplicate.indices.length; i++) {
            topCircleDuplicate.indices[i] += start
            bottomCircleDuplicate.indices[i] += nextStart
        }

        //create top and bottom face triangles
        var combinedVertexIndices = bottomCircleDuplicate.indices.concat(topCircleDuplicate.indices)

        //Connect all of the slices together
        for (let i = 0; i < numStacks; i++) {
            var offset = i * (numSlices - 1)
            var len = numSlices + 1
            let result = this.connectCirclesTriangle(offset, offset + len, len)
            combinedVertexIndices = combinedVertexIndices.concat(result)
        }

        var ret = {}
        ret.combinedVertexIndices = combinedVertexIndices
        ret.combinedVertexPositions = combinedVertexPositions
        ret.combinedVertexNormals = combinedVertexNormals


        return ret


    }

}