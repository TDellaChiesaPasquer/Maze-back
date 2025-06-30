
function verifyBasic(grid) { //Returns false if there isn't exactly one entrance and one exit, and if there is one tile that is not valid, and returns the entrance coords if the maze is valid
    let entrance = 0;
    let entranceCoords;
    let exit = 0;
    const n = grid.length;
    const m = grid[0].length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grid[i][j] !== '0' && grid[i][j] !== '1' && grid[i][j] !== '2' && grid[i][j] !== '3') {
                return false;
            }
            if (grid[i][j] === '2') {
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

function isInGrid(grid, a) { //Returns true if a is in the grid
    return a[0] >= 0 && a[1] >= 0 && a[0] < grid.length && a[1] < grid[0].length;
}

function getNeighboursCoords(grid, a) {
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

function findUnexploredNext(grid, point, precedent, currentList) { //Adds all the unexplored tiles next to the point, adding them to currentList and adding point in their position in precedent, returns the exit if it was found, null if not
    const x = point[0];
    const y = point[1];
    const neighbours = getNeighboursCoords(grid, point);
    for (const element of neighbours) {
        const a = element[0];
        const b = element[1];
        if (grid[a][b] !== '1') {
            if (!precedent[a][b]) {
                precedent[a][b] = point;
                currentList.push([a, b]);
            }
            if (grid[a][b] === '2') {
                return [a, b];
            }
        }
    }
    return null;
}

function isSolvable(grid) {
    if (!Array.isArray(grid)) {
        return false;
    }
    for (let element of grid) {
        if (!Array.isArray(element)) {
            return false;
        }
    }
    const entrance = verifyBasic(grid);
    if (!entrance) {
        return false;
    }
    const n = grid.length;
    const m = grid[0].length;
    const precedent = Array.from(Array(n), () => Array.from(Array(m), () => null));
    const toVisit = [entrance];
    precedent[entrance[0]][entrance[1]] = 1;
    let currentTile;
    while (toVisit.length > 0) {
        currentTile = toVisit.shift();
        const possibleExit = findUnexploredNext(grid, currentTile, precedent, toVisit);
        if (possibleExit) {
            return true;
        }
    }
    return false;
}

module.exports = {isSolvable};