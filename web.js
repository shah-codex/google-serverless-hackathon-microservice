const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const myService = 'https://nodejs-bot-mdwpwk4fwa-as.a.run.app';	// Your External URL for request and respone.

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
			if (Math.random() * 10 >= 2) {
				return 'F';
			}
			return 'L';
		}
	}
}

function getPosition(x, y) {
	return [y - x + 1, x];
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

	for (singleNode in nodes.state) {

		node = nodes.state[singleNode];
		if (!(node.wasHit)) {
			if (singleNode === myService) {
				continue;
			}
			
			let dimensions = getPosition(node.x, node.y);
			node.x = dimensions[0];
			node.y = dimensions[1];

			if (node.x == posX) {
				let distance = posY - node.y;
				if (distance > 0 && distance <= 3) {
					northNode.push(node);
					continue;
				}

				if (distance < 0 && distance >= -3) {
					southNode.push(node);
					continue;
				}
			}

			if (node.y == posY) {
				let distance = posX - node.x;
				if (distance > 0 && distance <= 3) {
					westNode.push(node);
					continue;
				}

				if (distance < 0 && distance >= -3) {
					eastNode.push(node);
					continue;
				}
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
