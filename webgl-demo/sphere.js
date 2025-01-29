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
//    Sphere generation help:
//    http://www.songho.ca/opengl/gl_sphere.html
//
//////////////////////////////////////////////////////

class sphere{


    constructor(radius, numSlices, numStacks, color) {
        this.radius = radius
        this.numSlices = numSlices
        this.numStacks = numStacks
        this.color = color
        this.combinedVertexIndices = []
        this.combinedVertexPositions = []
        this.combinedNormalPositions = []

        this.buildData()
    }

    get indices() {
        return this.combinedVertexIndices
    }

    get positions() {
        return this.combinedVertexPositions
    }
    
    get normals() {
        return this.combinedNormalPositions
    }

    addVertex(x, y, z) {
        this.combinedVertexPositions.push(x)
        this.combinedVertexPositions.push(y)
        this.combinedVertexPositions.push(z)

    }

    addIndices(a, b, c) {
        this.combinedVertexIndices.push(a)
        this.combinedVertexIndices.push(b)
        this.combinedVertexIndices.push(c)

    }

    addNormal(x, y, z) {
        this.combinedNormalPositions.push(x)
        this.combinedNormalPositions.push(y)
        this.combinedNormalPositions.push(z)

    }

    /*
    Ported from:
    http://www.songho.ca/opengl/gl_sphere.html
    */
    buildData() {

        let x, y, z, xy, nx, ny, nz, s, t, i, j, k, k1, k2, ii, jj, kk
        let sectorStep = 2 * Math.PI / this.numSlices
        let stackStep = Math.PI / this.numStacks
        let sectorAngle, stackAngle

        for (let i = 0; i <= this.numStacks; i++) {
            stackAngle = Math.PI / 2 - i * stackStep;   // starting from pi/2 to -pi/2
            xy = this.radius * Math.cos(stackAngle);    // r * cos(u)
            z = this.radius * Math.sin(stackAngle);     // r * sin(u)

            // add (sectorCount+1) vertices per stack
            // the first and last vertices have same position and normal, but different tex coords
            for(j=0; j <= this.numSlices; ++j)
            {
                sectorAngle = j * sectorStep;           // starting from 0 to 2pi

                // vertex position
                x = xy * Math.cos(sectorAngle);         // r * cos(u) * cos(v)
                y = xy * Math.sin(sectorAngle);         // r * cos(u) * sin(v)
                this.addVertex(x, y, z);
                this.addNormal(x, y, z);
            }
        }

        // indices
        //  k1--k1+1
        //  |  / |
        //  | /  |
        //  k2--k2+1
        for(i=0; i < this.numStacks; ++i)
        {
            k1 = i * (this.numSlices + 1);            // beginning of current stack
            k2 = k1 + this.numSlices + 1;             // beginning of next stack

            for(j=0; j < this.numSlices; ++j, ++k1, ++k2)
            {
                // 2 triangles per sector excluding 1st and last stacks
                if(i != 0)
                {
                    this.addIndices(k1, k2, k1+1);  // k1---k2---k1+1
                }

                if(i != (this.numStacks-1))
                {
                    this.addIndices(k1+1, k2, k2+1);// k1+1---k2---k2+1
                }
            }
        }



    }




}