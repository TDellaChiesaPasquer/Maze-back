//The file contains simple algorithms to verify that the grid that are being posted are really mazes

function verifyBasic(grid) {        //Verifies if the grid is in the good format, and return the entrance if it is
    let entrance = 0;
    let entranceCoords;
    let exit = 0;
    const n = grid.length;
    const m = grid[0].length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grid[i][j] !== '0' && grid[i][j] !== '1' && grid[i][j] !== '2' && grid[i][j] !== '3') { //verify if it is a correct tile
                return false;
            }
            if (grid[i][j] === '2') { //Verify if there are one entrance and one exit exactly
                exit++;
            }
            if (grid[i][j] === '3') {
                entrance++;
                entranceCoords = [i,j];
            }
        }
    }
    if (exit !== 1 || entrance !== 1) {
        return false;
    }
    return entranceCoords;
}

function isInGrid(grid, a) {        //Returns true if a is in the grid
    return a[0] >= 0 && a[1] >= 0 && a[0] < grid.length && a[1] < grid[0].length;
}

function getNeighboursCoords(grid, a) {         //Returns the coordonates of the tiles directly around a that are in the maze
    const neighbours = [];
    const x = a[0];
    const y = a[1];
    if (isInGrid(grid, [x, y - 1])) {
        neighbours.push([x, y - 1])
    }
    if (isInGrid(grid, [x, y + 1])) {
        neighbours.push([x, y + 1])
    }
    if (isInGrid(grid, [x - 1, y])) {
        neighbours.push([x - 1, y])
    }
    if (isInGrid(grid, [x + 1, y])) {
        neighbours.push([x + 1, y])
    }
    return neighbours;
}

function findUnexploredNext(grid, point, precedent, currentList) {      //Find the next unexplored tiles around the current tile, and returns the exit if it is one of those tiles
    const x = point[0];
    const y = point[1];
    const neighbours = getNeighboursCoords(grid, point); //All the neighbours in the maze
    for (const element of neighbours) {
        const a = element[0];
        const b = element[1];
        if (grid[a][b] !== '1') {   //Verify that the neighbour is not a wall
            if (!precedent[a][b]) {
                precedent[a][b] = point;
                currentList.push([a, b]);
            }
            if (grid[a][b] === '2') {   //The exit was found, so it returns its coordinates
                return [a, b];
            }
        }
    }
    return null;
}

function isSolvable(grid) {         //Returns whether the argument is a maze (a double array with tiles, one entrance and one exit), and that it possesses a solution
    if (!Array.isArray(grid)) {     //The argument is an array
        return false;
    }
    if (grid.length < 3 || grid.length > 50) {      //The argument has a good amount of rows
        return false;
    }
    for (let i = 0; i < grid.length; i++) {
        if (!Array.isArray(grid[i])) {      //The rows are arrays
            return false;
        }
        if (grid[i].length !== grid[0].length) { //The rows all have the same sizes
            return false;
        }
        if (grid[i].length < 3 || grid[i].length > 50) {    //The rows have a good number of tiles  
            return false;
        }
    }
    const entrance = verifyBasic(grid); //Verify the contents of tiles (one entrance, one exit, ...)
    if (!entrance) {
        return false;
    }
    const n = grid.length;
    const m = grid[0].length;
    const precedent = Array.from(Array(n), () => Array.from(Array(m), () => null));
    const toVisit = [entrance];
    precedent[entrance[0]][entrance[1]] = 1;
    let currentTile;
    while (toVisit.length > 0) {        //A simple algorithm to find a solution if it exists, by visiting all possible tiles
        currentTile = toVisit.shift();
        const possibleExit = findUnexploredNext(grid, currentTile, precedent, toVisit);
        if (possibleExit) {
            return true;
        }
    }
    return false;
}

function isGrid(value) {    //Same function as isSolvable, but it throws an error in the case the grid is wrong
    const valid = isSolvable(value);
    if (!valid) {
        throw new Error('The maze is invalid');
    }
    return true;
}

const paramList = ['hideWalls', 'hidePath', 'hideExit'];    //The list of extra-options

function paramsValid(value) {   //Verify that the argument is an object with the paramList as keys, and boolean values
    if (!(value instanceof Object)) {
        throw new Error('Parameters invalid');
    }
    const keys = Object.keys(value);
    if (keys.length !== 3) {
        throw new Error('Parameters invalid');
    }
    if (keys.some(element => !paramList.some(e => e === element))) {
        throw new Error('Parameters invalid');
    }
    if (keys.some(element => typeof value[element] !== 'boolean')) {
        throw new Error('Parameters invalid');
    }
    return true;
}

module.exports = {isSolvable, isGrid, paramsValid};