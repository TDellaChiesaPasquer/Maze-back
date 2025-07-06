const Maze = require('../models/mazes');

async function getNextMaxId() {
    const data = await Maze.find().select('idCustom');
    idList = data.map(element => element.idCustom);
    idList.sort((a,b) => a - b);
    return [idList.reduce((acc, cur) => acc === cur ? acc + 1 : acc, 1), idList[idList.length - 1]]
}

async function getRandomId(num, alreadyList) { //Returns num different idCustoms not in the alreadyList, assuming all alreadyList ids are real
    const data = await Maze.find().select('idCustom');
    idList = data.map(element => element.idCustom);
    idList.sort();
    const n = idList.length - alreadyList.length;
    alreadyList = alreadyList.sort();
    const randomList = getRandomNums(n, num);
    getFirstWithoutSecond(idList, alreadyList);
    console.log(idList, randomList, alreadyList)
    return randomList.map(element => idList[element]);
}

function getFirstWithoutSecond(array1, array2) {//Assuming array1 is sorted, return a new array with the values of array1 - those of array2
    for (const element of array2) {
        array1.splice(findFast(element, array1, 0, array1.length), 1);
    }
}

function random(n) { //Returns a random integer between 0 and n - 1
    return Math.floor(Math.random() * n);
}

function insertFast(m, numberList, a, b) {
    if (b === a) {
        numberList.splice(a, 0, m);
        return;
    }
    const c = Math.floor((b - a) / 2) + a;
    return numberList[c] < m ? insertFast(m, numberList, c + 1, b) : insertFast(m, numberList, a, c);
}

function findFast(m, numberList, a, b) {
    if (b - a === 1) {
        return a;
    }
    const c = Math.floor((b - a) / 2) + a;
    return numberList[c] <= m ? findFast(m, numberList, c, b) : insertFast(m, numberList, a, c);
}

function getRandomNums(n, m) {//Return m different random integer between 0 and n-1
    m = Math.min(n, m);
    const firstArray = Array.from(Array(m).keys(), x => random(n - x));
    const secondArray = [];
    for (let i = 0; i < m; i++) {
        const intermediaryArray = secondArray.map((element, index) => index ? element - secondArray[index - 1] - 1 : element);
        let current = 0;
        let index = 0;
        while (current <= firstArray[i]) {
            if (index >= secondArray.length) {
                current = firstArray[i] + 1;
                continue;
            }
            if (secondArray[index] === current + index) {
                index++;
            } else {
                current = Math.min(firstArray[i] + 1, secondArray[index] - index);
            }
        }
        insertFast(current + index - 1, secondArray, 0, secondArray.length);
    }
    return secondArray;
}

module.exports = {getNextMaxId, getRandomId};