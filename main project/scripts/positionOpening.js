//---- positionOpening ----//
function OpeningPosition() {}

OpeningPosition.prototype.draw = function (play) {
  ctx.clearRect(0, 0, play.width, play.height);
  ctx.font = "80px Comic Sans MS";
  ctx.textAlign = "center";
  const gradient = ctx.createLinearGradient(
    play.width / 2 - 180,
    play.height / 2,
    play.width / 2 + 180,
    play.height / 2
  );
  gradient.addColorStop("0", "yellow");
  gradient.addColorStop("0.5", "red");
  gradient.addColorStop("1.0", "yellow");
  ctx.fillStyle = gradient;
  ctx.fillText("UFO GAME", play.width / 2, play.height / 2 - 70);

  ctx.font = "40px Comic Sans MS";
  ctx.fillStyle = "#D7DF01";
  ctx.fillText("Press 'Enter' to start.", play.width / 2, play.height / 2);

  ctx.fillStyle = "#ff0000";
  ctx.fillText("Game Controls", play.width / 2, play.height / 2 + 210);
  ctx.fillText("A Key : Move Left", play.width / 2, play.height / 2 + 260);
  ctx.fillText("D Key : Move Right", play.width / 2, play.height / 2 + 300);
  ctx.fillText("W Key : Fire", play.width / 2, play.height / 2 + 340);
};

OpeningPosition.prototype.keyDown = function (play, keyboardCode) {
  if (keyboardCode == 13) {
    play.level = 1;
    play.score = 0;
    play.shields = 2;
    play.goToPosition(new TransferPosition(play.level));
  }
};
