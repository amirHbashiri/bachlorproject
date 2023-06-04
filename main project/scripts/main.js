const canvas = document.getElementById("ufoCanvas");
canvas.width = 900;
canvas.height = 750;
const ctx = canvas.getContext("2d");

function resize() {
  const height = window.innerHeight - 20;

  const ratio = canvas.width / canvas.height;
  const width = height * ratio;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
}

window.addEventListener("load", resize, false);

function GameBasics(canvas) {
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;

  this.playBoundaries = {
    top: 150,
    bottom: 650,
    left: 100,
    right: 800,
  };

  this.level = 1;
  this.score = 0;
  this.sheilds = 2;

  this.settings = {
    updateSeconds: 1 / 60,
    spaceshipSpeed: 200,
    bulletSpeed: 130,
    bulletMaxFrequency: 500,

    ufoLines: 4,
    ufoColumns: 8,
    ufoSpeed: 35,
    ufoSinkingValue: 30,

    bombSpeed: 75,
    bombFrequency: 0.05,

    pointsPerUFO: 25,
  };

  this.positionContainer = [];

  this.pressedKeys = {};
}

GameBasics.prototype.presentPosition = function () {
  return this.positionContainer.length > 0
    ? this.positionContainer[this.positionContainer.length - 1]
    : null;
};

GameBasics.prototype.goToPosition = function (position) {
  if (this.presentPosition()) {
    this.positionContainer.length = 0;
  }

  if (position.entry) {
    position.entry(play);
  }

  this.positionContainer.push(position);
};

GameBasics.prototype.pushPosition = function (position) {
  this.positionContainer.push(position);
};

GameBasics.prototype.popPosition = function () {
  this.positionContainer.pop();
};

GameBasics.prototype.start = function () {
  setInterval(function () {
    gameLoop(play);
  }, this.settings.updateSeconds * 1000);
  this.goToPosition(new OpeningPosition());
};

GameBasics.prototype.keyDown = function (keyboardCode) {
  this.pressedKeys[keyboardCode] = true;
  if (this.presentPosition() && this.presentPosition().keyDown) {
    this.presentPosition().keyDown(this, keyboardCode);
  }
};

GameBasics.prototype.keyUp = function (keyboardCode) {
  delete this.pressedKeys[keyboardCode];
};

function gameLoop(play) {
  let presentPosition = play.presentPosition();

  if (presentPosition) {
    //update
    if (presentPosition.update) {
      presentPosition.update(play);
    }
    //draw
    if (presentPosition.draw) {
      presentPosition.draw(play);
    }
  }
}

window.addEventListener("keydown", function (e) {
  const keyboardCode = e.which || event.keyCode;
  if (keyboardCode == 65 || keyboardCode == 68 || keyboardCode == 13) {
    e.preventDefault();
  }
  play.keyDown(keyboardCode);
});

window.addEventListener("keyup", function (e) {
  const keyboardCode = e.which || event.keyCode;
  play.keyUp(keyboardCode);
});

const play = new GameBasics(canvas);
play.sounds = new Sounds();
play.sounds.init();
play.start();
