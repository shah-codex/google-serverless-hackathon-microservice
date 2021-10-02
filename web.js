const express = require('express');
const app = express();
const bodyParser = require('body-parser');

let arenaX = undefined;
let arenaY = undefined;

const myService = 'https://foo.com';


function start(req) {
    arenaX = req.arena.dims[0];
    arenaY = req.arena.dims[1];

    let myMachine = req.arena.state[myService];
    let absPos = getPosition(myMachine.x, myMachine.y);
    let posX = absPos[0];
    let posY = absPos[1];

    console.log(myMachine);

    let currentDirection = myMachine.direction;

    for (let nodes in req.arena.state) {
        if (nodes === myService || nodes.wasHit) {
            continue;
        }

        let targetPosition = getPosition(nodes.x, nodes.y);
        let targetX = targetPosition[0];
        let targetY = targetPosition[1];

        let changeDirection = undefined;
        let count = 0;
        let intDirection = getDirection(currentDirection);
        let move = moveInDirection(intDirection, targetX, targetY);

        console.log(move);
        return move;
    }
}

function getPosition(x, y) {
	return [x, y - x + 1];
}

function moveInDirection(direction, targetX, targetY) {
	let closingDirection = (direction % 4) - 1;
	let skippingDirection = (direction + 2) % 4;
	let checkY = undefined; 
	let checkX = undefined;

	let count = 0;

	mainLoop:
	while ((direction % 4) != closingDirection) {
		if (direction == skippingDirection) {
			continue;
		}

		switch (direction) {
			case 0:
				checkY = targetY - 3;
				if (checkY <= posY && targetX == posX && inBounds(targetX, checkY)) {
					break mainLoop;
				}
				break;
			case 1:
				checkX = targetX + 3;
				if (checkX >= posX && targetY == posY && inBounds(checkX, targetY)) {
					break mainLoop;
				}
				break;
			case 2:
				checkY = targetY + 3;
				if (checkY >= posY && targetX == posX && inBounds(targetX, checkY)) {
					break mainLoop;
				}
				break;
			case 3:
				checkX = targetX - 3;
				if (checkX <= posX && targetY == posY && inBounds(checkX, targetY)) {
					break mainLoop;
				}
				break;
		}

		count = count + 1;
		direction = direction + 1;
	}

	return getAction(count);
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
			if (Math.random() * 10 >= 5) {
				return 'F';
			}
			return 'L';
	}
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
	return ((x >= 1 && x <= arenaX) && (y >= 1 && y <= arenaY))
}

app.use(bodyParser.json());

app.post('/', function (req, res) {

  res.send(start(req.body));
});

app.listen(process.env.PORT || 8080);
