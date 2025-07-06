const Maze = require('../models/mazes');

async function getNextMaxId() {
    const data = await Maze.find().select('idCustom');
    idList = data.map(element => element.idCustom);
    idList.sort();
    return [idList.reduce((acc, cur) => acc === cur ? acc + 1 : acc, 1), idList[idList.length - 1]]
}

module.exports = {getNextMaxId};