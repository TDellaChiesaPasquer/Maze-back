const Maze = require('../models/mazes');

//Contains the functions related to idCustom

async function getNextMaxId() {         //Gets the first integer not currently representing a maze (with idCustom), and the biggest idCustom currently given
    const data = await Maze.find().select('idCustom');
    idList = data.map(element => element.idCustom);
    idList.sort((a,b) => a - b);
    return [idList.reduce((acc, cur) => acc === cur ? acc + 1 : acc, 1), idList[idList.length - 1]]
}

async function getRandomId(num, alreadyList) {      //Returns num different idCustoms not in the alreadyList, assuming all given ids are real
    const data = await Maze.find().select('idCustom');
    idList = data.map(element => element.idCustom);
    idList.sort((a,b) => a - b);
    const n = idList.length - alreadyList.length;   //Represents the number of idCustoms still not given to the user
    alreadyList = alreadyList.sort();
    getFirstWithoutSecond(idList, alreadyList); //Filter the element of idList fast, excluding the ones present in alreadylist
    const randomList = getRandomNums(n, num);
    return randomList.map(element => idList[element]);
}

function getFirstWithoutSecond(array1, array2) {    //Assuming array1 is sorted, excludes from it the elements of array2 fast
    for (const element of array2) {
        array1.splice(findFast(element, array1, 0, array1.length), 1);
    }
}

function random(n) {    //Returns a random integer between 0 and n - 1
    return Math.floor(Math.random() * n);
}

function insertFast(m, numberList, a, b) {      //Inserts by dichotomy an element into a sorted array
    if (b === a) {
        numberList.splice(a, 0, m);
        return;
    }
    const c = Math.floor((b - a) / 2) + a;
    return numberList[c] < m ? insertFast(m, numberList, c + 1, b) : insertFast(m, numberList, a, c);
}

function findFast(m, numberList, a, b) {        //Finds by dichotomy an element in a sorted array
    if (b - a === 1) {
        return a;
    }
    const c = Math.floor((b - a) / 2) + a;
    return numberList[c] <= m ? findFast(m, numberList, c, b) : findFast(m, numberList, a, c);
}

function getRandomNums(n, m) {      //Return m different random integer between 0 and n-1
    m = Math.min(n, m);
    const firstArray = Array.from(Array(m).keys(), x => random(n - x));     //generate the placement of the randoms numbers (the first is one between 0, n - 1, the second between 0, n-2, ...)
    const secondArray = [];
    for (let i = 0; i < m; i++) {
        let current = 0;
        let index = 0;
        while (current <= firstArray[i]) {      //Counts the number of already placed number before under the new one
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