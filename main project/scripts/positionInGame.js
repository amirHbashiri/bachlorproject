function InGamePosition(settings, level) {
  this.settings = settings;
  this.level = level;
  this.upSec = this.settings.updateSeconds;
  this.spaceshipSpeed = this.settings.spaceshipSpeed;
  this.object = null;
  this.spaceship = null;
  this.bullets = [];
  this.lastBulletTime = null;
  this.ufos = [];
  this.bombs = [];
}

InGamePosition.prototype.update = function (play) {
  if (play.pressedKeys[65]) {
    this.spaceship.x -= this.spaceshipSpeed * this.upSec;
  }
  if (play.pressedKeys[68]) {
    this.spaceship.x += this.spaceshipSpeed * this.upSec;
  }

  if (play.pressedKeys[87]) {
    this.shoot();
  }

  if (this.spaceship.x < play.playBoundaries.left) {
    this.spaceship.x = play.playBoundaries.left;
  }
  if (this.spaceship.x > play.playBoundaries.right) {
    this.spaceship.x = play.playBoundaries.right;
  }

  for (let i = 0; i < this.bullets.length; i++) {
    let bullet = this.bullets[i];
    bullet.y -= this.upSec * this.settings.bulletSpeed;
    if (bullet.y < 0) {
      this.bullets.splice(i--, 1);
    }
  }

  let reachedSide = false;

  for (let i = 0; i < this.ufos.length; i++) {
    let ufo = this.ufos[i];
    let fresh_x =
      ufo.x +
      this.ufoSpeed * this.upSec * this.turnAround * this.horizentalMoving;
    let fresh_y = ufo.y + this.ufoSpeed * this.upSec * this.verticalMoving;

    if (
      fresh_x > play.playBoundaries.right ||
      fresh_x < play.playBoundaries.left
    ) {
      this.turnAround *= -1;
      reachedSide = true;
      this.horizentalMoving = 0;
      this.verticalMoving = 1;
      this.ufosAreSinking = true;
    }

    if (reachedSide !== true) {
      ufo.x = fresh_x;
      ufo.y = fresh_y;
    }
  }

  if (this.ufosAreSinking == true) {
    this.ufoPresentSinkingValue += this.ufoSpeed * this.upSec;
    if (this.ufoPresentSinkingValue >= this.settings.ufoSinkingValue) {
      this.ufosAreSinking = false;
      this.verticalMoving = 0;
      this.horizentalMoving = 1;
      this.ufoPresentSinkingValue = 0;
    }
  }

  const frontLineUFOs = [];
  for (let i = 0; i < this.ufos.length; i++) {
    let ufo = this.ufos[i];
    if (
      !frontLineUFOs[ufo.column] ||
      frontLineUFOs[ufo.column].line < ufo.line
    ) {
      frontLineUFOs[ufo.column] = ufo;
    }
  }

  for (let i = 0; i < this.settings.ufoColumns; i++) {
    let ufo = frontLineUFOs[i];
    if (!ufo) continue;
    let chance = this.bombFrequency * this.upSec;
    this.object = new Objects();
    if (chance > Math.random()) {
      this.bombs.push(this.object.bomb(ufo.x, ufo.y + ufo.height / 2));
    }
  }

  for (let i = 0; i < this.bombs.length; i++) {
    let bomb = this.bombs[i];
    bomb.y += this.upSec * this.bombSpeed;
    if (bomb.y > this.height) {
      this.bombs.splice(i--, 1);
    }
  }

  for (let i = 0; i < this.ufos.length; i++) {
    let ufo = this.ufos[i];
    let collision = false;
    for (let j = 0; j < this.bullets.length; j++) {
      let bullet = this.bullets[j];
      if (
        bullet.x >= ufo.x - ufo.width / 2 &&
        bullet.x <= ufo.x + ufo.width / 2 &&
        bullet.y >= ufo.y - ufo.height / 2 &&
        bullet.y <= ufo.y + ufo.height / 2
      ) {
        this.bullets.splice(j--, 1);
        collision = true;
        play.score += this.settings.pointsPerUFO;
      }
    }
    if (collision == true) {
      this.ufos.splice(i--, 1);
      play.sounds.playSound("ufoDeath");
    }
  }

  for (let i = 0; i < this.bombs.length; i++) {
    let bomb = this.bombs[i];
    if (
      bomb.x + 2 >= this.spaceship.x - this.spaceship.width / 2 &&
      bomb.x - 2 <= this.spaceship.x + this.spaceship.width / 2 &&
      bomb.y + 6 >= this.spaceship.y - this.spaceship.height / 2 &&
      bomb.y <= this.spaceship.y + this.spaceship.height / 2
    ) {
      this.bombs.splice(i--, 1);
      play.sounds.playSound("explosion");
      play.shields--;
    }
  }
  for (let i = 0; i < this.ufos.length; i++) {
    let ufo = this.ufos[i];
    if (
      ufo.x + ufo.width / 2 > this.spaceship.x - this.spaceship.width / 2 &&
      ufo.x - ufo.width / 2 < this.spaceship.x + this.spaceship.width / 2 &&
      ufo.y + ufo.height > this.spaceship.y - this.spaceship.height / 2 &&
      ufo.y - ufo.height / 2 < this.spaceship.y + this.spaceship.height / 2
    ) {
      play.sounds.playSound("explosion");
      play.shields = -1;
    }
  }

  if (play.shields < 0) {
    play.goToPosition(new GameOverPosition());
  }

  if (this.ufos.length == 0) {
    play.level += 1;
    play.goToPosition(new TransferPosition(play.level));
  }
};
InGamePosition.prototype.shoot = function () {
  if (
    this.lastBulletTime === null ||
    new Date().getTime() - this.lastBulletTime >
      this.settings.bulletMaxFrequency
  ) {
    this.object = new Objects();
    this.bullets.push(
      this.object.bullet(
        this.spaceship.x,
        this.spaceship.y - this.spaceship.height / 2,
        this.settings.bulletSpeed
      )
    );
    this.lastBulletTime = new Date().getTime();
  }
};

InGamePosition.prototype.entry = function (play) {
  this.horizentalMoving = 1;
  this.verticalMoving = 0;
  this.ufosAreSinking = false;
  this.ufoPresentSinkingValue = 0;
  this.turnAround = 1;
  this.ufo_image = new Image();
  this.spaceship_image = new Image();
  this.object = new Objects();
  this.spaceship = this.object.spaceship(
    play.width / 2,
    play.playBoundaries.bottom,
    this.spaceship_image
  );

  let presentLevel = this.level;
  this.ufoSpeed = this.settings.ufoSpeed + presentLevel * 7;

  this.bombSpeed = this.settings.bombSpeed + presentLevel * 10;
  this.bombFrequency = this.settings.bombFrequency + presentLevel * 0.05;

  let line, column;

  for (line = 0; line < this.settings.ufoLines; line++) {
    for (column = 0; column < this.settings.ufoColumns; column++) {
      this.object = new Objects();
      let x, y;
      x = play.width / 2 + column * 50 - (this.settings.ufoColumns - 1) * 25;
      y = play.playBoundaries.top + 30 + line * 30;
      this.ufos.push(this.object.ufo(x, y, line, column, this.ufo_image));
    }
  }
};

InGamePosition.prototype.keyDown = function (play, keyboardCode) {
  if (keyboardCode == 83) {
    play.sounds.mute();
  }

  if (keyboardCode == 80) {
    play.pushPosition(new PausePosition());
  }
};

InGamePosition.prototype.draw = function (play) {
  ctx.clearRect(0, 0, play.width, play.height);
  ctx.drawImage(
    this.spaceship_image,
    this.spaceship.x - this.spaceship.width / 2,
    this.spaceship.y - this.spaceship.height / 2
  );

  ctx.fillStyle = "#ff7300";
  for (let i = 0; i < this.bullets.length; i++) {
    let bullet = this.bullets[i];
    ctx.fillRect(bullet.x + 12, bullet.y - 9, 3, 7);
  }

  for (let i = 0; i < this.ufos.length; i++) {
    let ufo = this.ufos[i];
    ctx.drawImage(
      this.ufo_image,
      ufo.x - ufo.width / 2,
      ufo.y - ufo.height / 2
    );
  }

  ctx.fillStyle = "#FE2EF7";
  for (let i = 0; i < this.bombs.length; i++) {
    let bomb = this.bombs[i];
    ctx.fillRect(bomb.x - 2, bomb.y, 4, 6);
  }

  ctx.font = "16px Comic Sans MS";

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(
    "Press S to switch sound effects ON/OFF.",
    play.playBoundaries.left - 50,
    play.playBoundaries.bottom + 80
  );

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText(
    "Press P to Pause.",
    play.playBoundaries.right - 50,
    play.playBoundaries.bottom + 80
  );

  ctx.textAlign = "center";
  ctx.fillStyle = "BDBDBD";

  ctx.font = "bold 24px Comic Sans MS";
  ctx.fillText(
    "Score",
    play.playBoundaries.right,
    play.playBoundaries.top - 75
  );
  ctx.font = "bold 30px Comic Sans MS";
  ctx.fillText(
    play.score,
    play.playBoundaries.right,
    play.playBoundaries.top - 25
  );

  ctx.font = "bold 24px Comic Sans MS";
  ctx.fillText("Level", play.playBoundaries.left, play.playBoundaries.top - 75);
  ctx.font = "bold 30px Comic Sans MS";
  ctx.fillText(
    play.level,
    play.playBoundaries.left,
    play.playBoundaries.top - 25
  );

  ctx.textAlign = "center";
  if (play.shields > 0) {
    ctx.fillStyle = "#BDBDBD";
    ctx.font = "bold 24px Comic Sans MS";
    ctx.fillText("Shiedls", play.width / 2, play.playBoundaries.top - 75);
    ctx.font = "bold 30px Comic Sans MS";
    ctx.fillText(play.shields, play.width / 2, play.playBoundaries.top - 25);
  } else {
    ctx.fillStyle = "#ff4d4d";
    ctx.font = "bold 24px Comic Sans MS";
    ctx.fillText("WARRNING", play.width / 2, play.playBoundaries.top - 75);
    ctx.fillStyle = "#BDBDBD";
    ctx.fillText(
      "No Shields left!",
      play.width / 2,
      play.playBoundaries.top - 25
    );
  }
};
