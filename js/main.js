// HackExeter
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.originalHeight = canvas.height;
canvas.originalWidth = canvas.width;
if (window.devicePixelRatio) {
    canvas.width *= window.devicePixelRatio;
    canvas.height *= window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

var gameState = 0; // 0 - start, 1 - playing, 2 - end
var framerate = 60;

var score = 0;
var scoreScalar = 1;

ct = 0;

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / framerate);
    };
})();


var blocks = [];
var MainClock;
var iter;
var lastGen;
var prevScore;
var nextGen;

function init() {
    score = 0;
    scoreScalar = 1;
    gameState = 1;
    ct = 0;
    blocks = [];
    MainClock = new Clock(65);
    iter = 1;
    lastGen = Date.now();
    prevScore = Date.now();
    nextGen = 1000;
    requestAnimFrame(animloop);
}

var colors = ["#e74c3c", "#f1c40f", "#3498db"];
var hexagonBackgroundColor = 'rgb(236, 240, 241)';
var hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
var swegBlue = '#2c3e50'; //tumblr?
var scoreAdditionCoeff = 1;

function render() {
    document.getElementById("score").innerHTML = score + " (x" + scoreScalar * scoreAdditionCoeff + ")";
    var now = Date.now();
    if (now - lastGen > nextGen) {
        blocks.push(new Block(randInt(0, 6), colors[randInt(0, colors.length)]));
        lastGen = Date.now();
        var minTime = 500 / iter;
        if (minTime < 100) {
            minTime = 100;
        }
        nextGen = randInt(minTime, 1500 / iter);
    }
    if (now - prevScore > 1000) {
        score += 5 * (scoreScalar * scoreAdditionCoeff);
        prevScore = now;
        iter += 0.1;
    }
    ctx.clearRect(0, 0, canvas.originalWidth, canvas.originalHeight);
    drawPolygon(canvas.originalWidth / 2, canvas.originalHeight / 2, 6, canvas.originalWidth / 2, 30, hexagonBackgroundColor);
    var objectsToRemove = [];
    var i;
    for (i in MainClock.blocks) {
        for (var j = 0; j < MainClock.blocks[i].length; j++) {
            var block = MainClock.blocks[i][j];
            MainClock.doesBlockCollide(block, iter, j, MainClock.blocks[i]);
            if (!MainClock.blocks[i][j].settled) {
                MainClock.blocks[i][j].distFromHex -= iter;
            }
            block.draw();
        }
    }

    for (i in blocks) {
        MainClock.doesBlockCollide(blocks[i], iter);
        if (!blocks[i].settled) {
            blocks[i].distFromHex -= iter;
        } else {
            objectsToRemove.push(i);
        }
        blocks[i].draw();
    }

    objectsToRemove.forEach(function(o) {
        blocks.splice(o, 1);
    });
    MainClock.draw();
    drawPolygon(canvas.originalWidth / 2, canvas.originalHeight / 2, 6, 270, 30, "gray", false);
}

function animloop() {
    if (gameState == 0) {
        showModal('Start!', 'Press enter to start!');
    } else if (gameState == 1) {
        requestAnimFrame(animloop);
        render();
        checkGameOver();
    } else if (gameState == 2) {
        showModal('Game over: ' + score + ' pts!', 'Press enter to restart!');

    }
}
requestAnimFrame(animloop);


function drawPolygon(x, y, sides, radius, theta, color, fill) { // can make more elegant, reduce redundancy, fix readability
    if (fill == undefined) {
        fill = true;
    }
    if (fill) {
        ctx.fillStyle = color;
    } else {
        ctx.strokeStyle = color;
    }

    ctx.beginPath();
    var coords = rotatePoint(0, radius, theta);
    ctx.moveTo(coords.x + x, coords.y + y);
    var oldX = coords.x;
    var oldY = coords.y;
    for (var i = 0; i < sides; i++) {
        coords = rotatePoint(oldX, oldY, 360 / sides);
        ctx.lineTo(coords.x + x, coords.y + y);
        // ctx.moveTo(coords.x + x, coords.y + y);
        oldX = coords.x;
        oldY = coords.y;
    }
    ctx.closePath();
    if (fill) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

function checkGameOver() { // fix font, fix size of hex
    for (var i = 0; i < MainClock.sides; i++) {
        if (MainClock.blocks[i].length > 8) {
            gameState = 2;
        }
    }
}

function showModal(text, secondaryText) {
    var buttonSize = 150;
    var fontSizeLarge = 50;
    var fontSizeSmall = 25;
    drawPolygon(canvas.originalWidth / 2, canvas.originalHeight / 2, 6, canvas.originalWidth / 2, 30, hexagonBackgroundColorClear);
    ctx.fillStyle = swegBlue;
    // drawPolygon(canvas.originalWidth / 2, canvas.originalHeight / 2, 6, buttonSize, 30, swegBlue);
    ctx.font = fontSizeLarge + 'px "Roboto"';
    ctx.textAlign = 'center';
    // ctx.fillStyle = hexagonBackgroundColor;
    ctx.fillText(text, canvas.originalWidth / 2, canvas.originalHeight / 2 + (fontSizeLarge / 4));
    ctx.font = fontSizeSmall + 'px "Roboto"';
    ctx.fillText(secondaryText, canvas.originalWidth / 2, canvas.originalHeight / 2 + fontSizeLarge / 4 + fontSizeSmall / 4 + 30);
}
