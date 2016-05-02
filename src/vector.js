/* eslint-disable no-multi-spaces, array-bracket-spacing */

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

export class Matrix {
    constructor(arr) {
        this.mat = arr;
    }

    get(i, j) {
        return this.mat[i][j];
    }

    /**
     * return [Other] x [this]
     */
    _transformMatrix(other) {
        const rtn = [];

        for (let row = 0; row < 4; row += 1) {
            rtn[row] = [0, 0, 0, 0];

            for (let i = 0; i < 4; i += 1) {
                for (let j = 0; j < 4; j += 1) {
                    rtn[row][i] += other.get(row, j) * this.get(j, i);
                }
            }
        }

        return new Matrix(rtn);
    }

    /**
     * apply the matrix to whatever is passed in (Matrix, Vector, or Array)
     */
    transform(vecListOrMatrix) {
        if (Array.isArray(vecListOrMatrix)) {
            return vecListOrMatrix.map(vec => this.transform(vec));
        } else if (vecListOrMatrix instanceof Matrix) {
            return this._transformMatrix(vecListOrMatrix);
        }

        // else this is a vector
        return vecListOrMatrix.transform(this);
    }

    translate(x, y, z) {
        if (x instanceof Vector) {
            return this.transform(Matrix.translate(x.x, x.y, x.z));
        }
        return this.transform(Matrix.translate(x, y, z));
    }

    rotateX(degrees) {
        return this.transform(Matrix.rotateX(degrees));
    }

    rotateZ(degrees) {
        return this.transform(Matrix.rotateZ(degrees));
    }


    scale(sx, sy, sz) {
        return this.transform(Matrix.scale(sx, sy, sz));
    }

    static rotateZ(degrees) {
        const radians = toRadians(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return new Matrix([
            [cos, -sin, 0, 0],
            [sin,  cos, 0, 0],
            [  0,    0, 1, 0],
            [  0,    0, 0, 1],
        ]);
    }

    static rotateX(degrees) {
        const radians = toRadians(degrees);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return new Matrix([
            [1,   0,    0, 0],
            [0, cos, -sin, 0],
            [0, sin,  cos, 0],
            [0,   0,    0, 1],
        ]);
    }

    static translate(x, y, z) {
        if (x instanceof Vector) {
            return Matrix.translate(x.x, x.y, x.z);
        }

        return new Matrix([
            [1, 0, 0, x],
            [0, 1, 0, y],
            [0, 0, 1, z],
            [0, 0, 0, 1],
        ]);
    }

    static scale(sx, sy, sz) {
        if (sx instanceof Vector) {
            return Matrix.scale(sx.x, sx.y, sx.z);
        }

        return new Matrix([
            [sx,  0,  0, 0],
            [ 0, sy,  0, 0],
            [ 0,  0, sz, 0],
            [ 0,  0,  0, 1],
        ]);
    }
}

export class Vector {
    constructor(x, y, z = 0) {
        if (x instanceof Object) {
            this.x = x.x;
            this.y = x.y;
            this.z = (x.z || 0);
        } else {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    add(vec) {
        if (isNaN(vec)) {
            return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
        }

        return new Vector(this.x + vec, this.y + vec, this.z + vec);
    }

    subtract(vec) {
        if (isNaN(vec)) {
            return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
        }

        return new Vector(this.x - vec, this.y - vec, this.z - vec);
    }

    scale(x, optionalY, optionalZ) {
        if (optionalY !== undefined && optionalZ !== undefined) {
            return new Vector(this.x * x, this.y * optionalY, this.z * optionalZ);
        }
        return new Vector(this.x * x, this.y * x, this.z * x);
    }

    multiply(vec) {
        return new Vector(this.x * vec.x, this.y * vec.y, this.z * vec.z);
    }

    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    cross(vec) {
        const x = this.y * vec.z - this.z * vec.y;
        const y = this.z * vec.x - this.x * vec.z;
        const z = this.x * vec.y - this.y * vec.x;

        return new Vector(x, y, z);
    }

    distance(vec) {
        const x = this.x - vec.x;
        const y = this.y - vec.y;
        const z = this.z - vec.z;

        return Math.sqrt(x * x + y * y + z * z);
    }


    distance2d(vec) {
        const x = this.x - vec.x;
        const y = this.y - vec.y;

        return Math.sqrt(x * x + y * y);
    }

    /**
     * rotate around the Z-axis
     */
    rotate(degrees, origin = new Vector(0, 0, 0)) {
        return this.rotateZ(degrees, origin);
    }

    /**
     * rotate around the Z-axis
     */
    rotateZ(degrees, origin = new Vector(0, 0, 0)) {
        const matrix = Matrix.rotateZ(degrees);
        return this.subtract(origin).transform(matrix).add(origin);
    }


    /**
     * rotate around the X-axis
     */
    rotateX(degrees, origin = new Vector(0, 0, 0)) {
        const matrix = Matrix.rotateX(degrees);
        return this.subtract(origin).transform(matrix).add(origin);
    }


    transform(matrix) {
        return new Vector(
            this.x * matrix.get(0, 0) + this.y * matrix.get(0, 1) + this.z * matrix.get(0, 2) + 1 * matrix.get(0, 3),
            this.x * matrix.get(1, 0) + this.y * matrix.get(1, 1) + this.z * matrix.get(1, 2) + 1 * matrix.get(1, 3),
            this.x * matrix.get(2, 0) + this.y * matrix.get(2, 1) + this.z * matrix.get(2, 2) + 1 * matrix.get(2, 3)
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(scaleFactor = 1) {
        return this.scale(scaleFactor / this.length());
    }


    toArray() {
        return [this.x, this.y, this.z];
    }

    static fromObject(obj) {
        return new Vector(obj.x, obj.y, (obj.z || 0));
    }

    equals(other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    }

    getCopy() {
        return new Vector(this.x, this.y, this.z);
    }
}
