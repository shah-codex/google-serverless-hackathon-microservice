const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const myService = 'https://nodejs-bot-mdwpwk4fwa-as.a.run.app';

let arenaX = undefined;
let arenaY = undefined;

let filteredNodes = {};
let myMachine = undefined;
let absPos = undefined;
let posX = undefined;
let posY = undefined;

let currentDirection = undefined;

const Directions = {
	'E': [],
	'N': [],
	'W': [],
	'S': []
};


function start(req) {
	filteredNodes = filterNodes(req.arena);
	let intDirection = getDirection(currentDirection);

	console.log(filteredNodes);

	if (filteredNodes[currentDirection.toString()].length != 0) {
		return 'T';
	} else {
		let nextDirections = getNextDirection(intDirection);

		if (filteredNodes[nextDirections[0].toString()].length != 0) {
			return 'L';
		} else if(filteredNodes[nextDirections[1].toString()].length != 0) {
			return 'R';
		} else {	
			if (Math.random() * 10 >= 5) {
				return 'F';
			}
			return 'L';
		}
	}
}

function getPosition(x, y) {
	return [y - x + 1, x];
}

function arrayHasElements(a) {
	return a.length != 0;
}

function getAction(count) {
	switch (count) {
		case 0:
			return 'T';
		case 1:
			return 'L';
		case 2:
			return 'R';
		default:
	}
}

function getNextDirection(direction) {
	directions = [];

	directions.push(getDirectionsChar((direction + 1) % 4));
	directions.push(getDirectionsChar((direction + 3) % 4));

	return directions;
}

function getDirectionsChar(direction) {
	switch (direction) {
		case 0:
			return 'E';
		case 1:
			return 'N';
		case 2:
			return 'W';
		case 3:
			return 'S';
	}

	return 'F';
}

function getDirection(direction) {
	switch (direction) {
		case 'E':
			return 0;
		case 'N':
			return 1;
		case 'W':
			return 2;
		case 'S':
			return 3;
		default:
			return 3; 
	}
}

function inBounds(x, y) {
	return ((x >= 1 && x <= arenaX) && (y >= 1 && y <= arenaY));
}

function filterNodes(nodes) {
	let eastNode = [];
	let westNode = [];
	let northNode = [];
	let southNode = [];

	let checkX = undefined;
	let checkY = undefined;

	for (singleNode in nodes.state) {

		node = nodes.state[singleNode];
		if (!(node.wasHit)) {
			if (singleNode === myService) {
				continue;
			}
			
			let dimensions = getPosition(node.x, node.y);
			node.x = dimensions[0];
			node.y = dimensions[1];

			checkY = node.y - 3;
			if (checkY <= posY && node.x == posX && inBounds(node.x, checkY)) {
				eastNode.push(node);
				continue;
			}

			checkX = node.x + 3;
			if (checkX >= posX && node.y == posY && inBounds(checkX, node.y)) {
				northNode.push(node);
				continue;
			}

			checkY = node.y + 3;
			if (checkY >= posY && node.x == posX && inBounds(node.x, checkY)) {
				westNode.push(node);
				continue;
			}

			checkX = node.x - 3;
			if (checkX <= posX && node.y == posY && inBounds(checkX, node.y)) {
				southNode.push(node);
				continue;
			}
		}
	}	

	direction = Object.create(Directions);


	direction.E = eastNode;
	direction.N = northNode;
	direction.W = westNode;
	direction.S = southNode;

	return direction;
}


app.use(bodyParser.json());

app.post('/', function (req, res) {
	arenaX = req.body.arena.dims[0];
	arenaY = req.body.arena.dims[1];

	myMachine = req.body.arena.state[myService];
	absPos = getPosition(myMachine.x, myMachine.y);
	posX = absPos[0];
	posY = absPos[1];

	console.log(posX + " " + posY);

	currentDirection = myMachine.direction.toString();

	let ans = start(req.body);
	console.log(ans);
	res.send(ans);
});

app.listen(process.env.PORT || 8080);
