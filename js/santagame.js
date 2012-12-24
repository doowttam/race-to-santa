(function() {
  var Course, End, Entity, Foot, Key, Player, PlayerBody, RoughPatch, Santa, Tree,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.SantaGame = (function() {

    function SantaGame(doc, win) {
      var _this = this;
      this.doc = doc;
      this.win = win;
      this.pause = __bind(this.pause, this);
      this.play = __bind(this.play, this);
      this.drawFrame = __bind(this.drawFrame, this);
      this.canvas = this.doc.getElementById('game_canvas');
      this.context = this.canvas.getContext('2d');
      this.buttons = {
        start: this.doc.getElementById('start'),
        pause: this.doc.getElementById('pause')
      };
      this.buttons.start.onclick = this.play;
      this.buttons.pause.onclick = this.pause;
      this.key = new Key;
      this.win.onkeyup = function(e) {
        return _this.key.onKeyUp(e);
      };
      this.win.onkeydown = function(e) {
        return _this.key.onKeyDown(e);
      };
      this.course = new Course(this.canvas.width);
      this.player1 = new Player('LEFT', 'RIGHT', 'DOWN', 0, 200, this.key, this.course, 1);
      this.player2 = new Player('A', 'D', 'S', 200, this.canvas.height, this.key, this.course, 0);
      this.player1.watchPlayer(this.player2);
      this.player2.watchPlayer(this.player1);
      this.msg = {
        1: [],
        0: []
      };
      this.drawOpener();
    }

    SantaGame.prototype.drawOpener = function() {
      this.context.fillStyle = 'red';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      this.context.fillText('Race to Santa', this.canvas.width / 2, 80);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 24px sans-serif';
      this.context.textAlign = 'center';
      this.context.fillStyle = 'blue';
      this.context.fillText('Player 1', this.canvas.width / 4, 130);
      this.context.fillStyle = 'orange';
      this.context.fillText('Player 2', (this.canvas.width / 4) * 3, 130);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 20px sans-serif';
      this.context.textAlign = 'center';
      this.context.fillText('Feet - Left/Right Arrows', this.canvas.width / 4, 170);
      this.context.fillText('Jump - Down Arrow', this.canvas.width / 4, 210);
      this.context.fillText('Feet - A/D', (this.canvas.width / 4) * 3, 170);
      this.context.fillText('Jump - S', (this.canvas.width / 4) * 3, 210);
      this.player1.body.draw(this.context, this.canvas.width / 4, 300, 1.5, this.player1.lane);
      this.player2.body.draw(this.context, (this.canvas.width / 4) * 3, 280, 1.5, this.player2.lane);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 18px sans-serif';
      this.context.fillText('Ice skate to Santa! Use long smooth movements for the most speed.', this.canvas.width / 2, 330);
      return this.context.fillText('Jump over speed bumps and always push with your forward foot!', this.canvas.width / 2, 355);
    };

    SantaGame.prototype.addStumbleMessage = function(lane) {
      var that;
      this.msg[lane].push("You stumbled! Push with your forward foot!");
      that = this;
      return setTimeout(function() {
        return that.msg[lane].shift();
      }, 3000);
    };

    SantaGame.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    SantaGame.prototype.drawFrame = function() {
      this.frame++;
      this.update();
      this.resetCanvas();
      this.player1.draw(this.context, this.canvas);
      this.player2.draw(this.context, this.canvas);
      this.drawHud();
      if (!this.running) {
        this.drawPause();
      } else {
        this.checkWin();
      }
      if (this.running) return requestAnimationFrame(this.drawFrame);
    };

    SantaGame.prototype.drawHud = function() {
      var player1Pos, player2Pos;
      this.context.strokeStyle = 'white';
      this.context.beginPath();
      this.context.moveTo(0, 200);
      this.context.lineTo(this.canvas.width, 200);
      this.context.closePath();
      this.context.stroke();
      player1Pos = this.player1.x / (this.course.end / (this.canvas.width - 60));
      player2Pos = this.player2.x / (this.course.end / (this.canvas.width - 60));
      this.context.fillStyle = 'blue';
      this.context.fillRect(player1Pos, 190, 10, 10);
      this.context.fillStyle = 'orange';
      this.context.fillRect(player2Pos, 200, 10, 10);
      this.context.fillStyle = 'red';
      this.context.fillRect(this.canvas.width - 50, 190, 50, 20);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 12px sans-serif';
      this.context.textAlign = 'left';
      this.context.fillText('SANTA', this.canvas.width - 46, 205);
      return this.checkMessages();
    };

    SantaGame.prototype.checkMessages = function() {
      var drawMessage, that;
      that = this;
      drawMessage = function(player) {
        var mostRecent, msgArray, yPos;
        msgArray = that.msg[player.lane];
        mostRecent = msgArray[msgArray.length - 1];
        if (mostRecent) {
          that.context.fillStyle = 'red';
          that.context.font = 'bold 16px sans-serif';
          that.context.textAlign = 'center';
          yPos = player.lane === 1 ? 50 : 250;
          return that.context.fillText(mostRecent, that.canvas.width / 2, yPos);
        }
      };
      drawMessage(this.player1);
      return drawMessage(this.player2);
    };

    SantaGame.prototype.play = function() {
      var countdown, that;
      if (this.running) return;
      this.buttons.start.disabled = true;
      that = this;
      countdown = function(count) {
        that.resetCanvas();
        that.context.fillStyle = 'rgba(0,0,0,.7)';
        that.context.fillRect(0, 0, that.canvas.width, that.canvas.height);
        that.context.fillStyle = 'white';
        that.context.font = 'bold 48px sans-serif';
        that.context.textAlign = 'center';
        that.context.fillText("" + count + "...", that.canvas.width / 2, 200);
        if (count === 0) {
          that.running = true;
          return requestAnimationFrame(that.drawFrame);
        } else {
          return setTimeout(function() {
            return countdown(--count);
          }, 1000);
        }
      };
      return countdown(3);
    };

    SantaGame.prototype.drawPause = function() {
      this.context.fillStyle = 'rgba(0,0,0,.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      return this.context.fillText('Paused', this.canvas.width / 2, 200);
    };

    SantaGame.prototype.pause = function() {
      this.running = !this.running;
      if (this.running) return requestAnimationFrame(this.drawFrame);
    };

    SantaGame.prototype.winGame = function(player) {
      this.running = false;
      this.context.fillStyle = 'rgba(0,0,0,.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      return this.context.fillText(player + " wins!", this.canvas.width / 2, 125);
    };

    SantaGame.prototype.update = function() {
      this.player1.update();
      this.player2.update();
      this.checkStumble(this.player1);
      return this.checkStumble(this.player2);
    };

    SantaGame.prototype.checkStumble = function(player) {
      if (player.stumbled) {
        player.stumbled = false;
        return this.addStumbleMessage(player.lane);
      }
    };

    SantaGame.prototype.checkWin = function() {
      if (this.course.checkWin(this.player1.x)) this.winGame('Player 1');
      if (this.course.checkWin(this.player2.x)) return this.winGame('Player 2');
    };

    return SantaGame;

  })();

  Key = (function() {

    function Key() {
      this.onKeyUp = __bind(this.onKeyUp, this);
      this.onKeyDown = __bind(this.onKeyDown, this);
      this.isDown = __bind(this.isDown, this);
    }

    Key.prototype.pressed = {};

    Key.prototype.codes = {
      'LEFT': 37,
      'UP': 38,
      'RIGHT': 39,
      'DOWN': 40,
      'SPACE': 32,
      'A': 65,
      'D': 68,
      'S': 83
    };

    Key.prototype.isDown = function(keyCode) {
      return this.pressed[keyCode];
    };

    Key.prototype.onKeyDown = function(event) {
      return this.pressed[event.keyCode] = true;
    };

    Key.prototype.onKeyUp = function(event) {
      return delete this.pressed[event.keyCode];
    };

    return Key;

  })();

  Player = (function() {

    function Player(leftKey, rightKey, jumpKey, top, bottom, key, course, lane) {
      this.leftKey = leftKey;
      this.rightKey = rightKey;
      this.jumpKey = jumpKey;
      this.top = top;
      this.bottom = bottom;
      this.key = key;
      this.course = course;
      this.lane = lane;
      this.leftFoot = new Foot(this.leftKey);
      this.rightFoot = new Foot(this.rightKey);
      this.x = 0;
      this.body = new PlayerBody(40, 5, 20);
      this.padding = 100;
      this.jumping = false;
      this.elevation = 0;
      this.jumpHeight = 50;
      this.momentum = 100;
    }

    Player.prototype.watchPlayer = function(otherPlayer) {
      this.otherPlayer = otherPlayer;
    };

    Player.prototype.update = function() {
      var checkStroke, collideAt, leftWasDown, rightWasDown, speed, that;
      leftWasDown = this.leftFoot.down;
      rightWasDown = this.rightFoot.down;
      if (this.key.isDown(this.key.codes[this.jumpKey]) && !this.jumping && !(this.elevation > 0)) {
        this.jumping = true;
        this.leftFoot.reset();
        this.rightFoot.reset();
      }
      if (this.jumping) {
        if (this.elevation < this.jumpHeight) {
          this.elevation = this.elevation + 3;
        } else {
          this.jumping = false;
        }
      } else if (this.elevation > 0) {
        this.elevation = this.elevation - 3;
      }
      if (!(this.elevation > 0)) {
        this.leftFoot.update(this.key);
        this.rightFoot.update(this.key);
      }
      that = this;
      checkStroke = function(foot, wasDown, otherFoot) {
        if (wasDown && !foot.down) {
          return that.momentum = that.momentum + foot.finishStroke();
        } else if (!wasDown && foot.down) {
          if (foot.position !== 0) {
            that.momentum = 20;
            that.stumbled = true;
          }
          foot.startStroke();
          return otherFoot.reposition();
        }
      };
      checkStroke(this.leftFoot, leftWasDown, this.rightFoot);
      checkStroke(this.rightFoot, rightWasDown, this.leftFoot);
      if (this.momentum > 0) this.momentum = this.momentum - 0.5;
      if (this.momentum > 600) this.momentum = 600;
      speed = Math.ceil(this.momentum / 40);
      if (!(this.elevation > 0)) {
        collideAt = this.course.checkCollision(this.x, speed);
        if (collideAt > 0) {
          this.momentum = this.momentum / 3;
          speed = collideAt;
        }
      }
      this.x = this.x + speed;
      return this.course.update(this.x);
    };

    Player.prototype.draw = function(context, canvas) {
      var drawOtherPlayer;
      drawOtherPlayer = this.course.draw(context, canvas, this.top, this.bottom, this.x, this.otherPlayer, this.padding);
      this.leftFoot.draw(context, canvas.width - 200, this.top + 75);
      this.rightFoot.draw(context, canvas.width - 100, this.top + 75);
      if (this.lane === 1) {
        this.body.draw(context, this.padding, this.bottom - 20 - this.elevation, 1.5, this.lane);
        return drawOtherPlayer();
      } else {
        drawOtherPlayer();
        return this.body.draw(context, this.padding, this.bottom - 20 - this.elevation, 1.5, this.lane);
      }
    };

    return Player;

  })();

  Foot = (function() {

    function Foot(foot, position) {
      this.foot = foot;
      this.position = position != null ? position : 0;
      this.down = false;
      this.start = 0;
      this.radius = 5;
      this.maxRadius = 130;
      this.greatRadius = 100;
      this.scale = 0.3;
    }

    Foot.prototype.update = function(key) {
      if (key.isDown(key.codes[this.foot])) {
        this.addToStroke(2);
        return this.down = true;
      } else if (this.radius > 5) {
        this.removeFromStroke(1);
        return this.down = false;
      }
    };

    Foot.prototype.startStroke = function() {
      this.start = this.radius;
      return this.position = 1;
    };

    Foot.prototype.endStroke = function() {
      this.position = -1;
      return this.radius - this.start;
    };

    Foot.prototype.reposition = function() {
      return this.position = 0;
    };

    Foot.prototype.reset = function() {
      this.reposition();
      this.down = false;
      this.start = 0;
      return this.radius = 5;
    };

    Foot.prototype.addToStroke = function(length) {
      return this.radius = this.radius + length;
    };

    Foot.prototype.removeFromStroke = function(length) {
      return this.radius = this.radius - length;
    };

    Foot.prototype.finishStroke = function() {
      var strokeLength;
      strokeLength = this.endStroke();
      if (this.radius > this.maxRadius) {
        strokeLength = 20;
      } else if (this.radius > this.greatRadius) {
        strokeLength = strokeLength + 20;
      }
      return strokeLength;
    };

    Foot.prototype.colorByRadius = function(radius) {
      if (radius > this.maxRadius) {
        return 'red';
      } else if (radius > this.greatRadius) {
        return 'green';
      } else {
        return 'gray';
      }
    };

    Foot.prototype.draw = function(context, x, y) {
      context.strokeStyle = 'gray';
      context.lineWidth = 1;
      y = y + (this.position * (-50 * this.scale));
      context.beginPath();
      context.arc(x, y, this.radius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      context.fillStyle = this.colorByRadius(this.radius);
      context.stroke();
      context.fill();
      context.beginPath();
      context.arc(x, y, this.greatRadius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      context.stroke();
      context.beginPath();
      context.arc(x, y, this.maxRadius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      return context.stroke();
    };

    return Foot;

  })();

  Course = (function() {

    function Course(width) {
      var end;
      this.width = width;
      this.edge = this.width;
      this.slope = 1.5;
      this.lastItem = 0;
      end = 60000;
      this.end = end;
      this.items = {};
      this.items[end] = new End(0, 70, 1);
      this.items[end + 50] = new Santa(70, 8, 22);
    }

    Course.prototype.update = function(x) {
      if (x + this.width > this.edge) {
        this.edge = x + this.width;
        if (this.edge > this.end || this.lastItem > this.edge - 100) return;
        if (Math.random() < 0.005) {
          this.items[this.edge] = new Tree(70, 8, 22);
          return this.lastItem = this.edge;
        } else if (Math.random() < 0.005) {
          this.items[this.edge] = new RoughPatch(0, 50, 20, true);
          return this.lastItem = this.edge;
        }
      }
    };

    Course.prototype.checkCollision = function(x, speed) {
      var collisionX, _ref;
      for (collisionX = x, _ref = x + speed; x <= _ref ? collisionX <= _ref : collisionX >= _ref; x <= _ref ? collisionX++ : collisionX--) {
        if (this.items[collisionX] && this.items[collisionX].canCollide) {
          return collisionX - x;
        }
      }
      return 0;
    };

    Course.prototype.checkWin = function(x) {
      return x > this.end;
    };

    Course.prototype.draw = function(context, canvas, top, bottom, xOffset, otherPlayer, padding) {
      var drawX, horizon, otherDrawX, otherDrawY, start, _ref, _ref2, _ref3;
      horizon = bottom - 70;
      context.strokeStyle = 'white';
      context.beginPath();
      context.moveTo(0, horizon);
      context.lineTo(canvas.width, horizon);
      context.closePath();
      context.stroke();
      start = xOffset % 150;
      for (drawX = 0, _ref = canvas.width + 150; drawX <= _ref; drawX += 150) {
        context.beginPath();
        context.moveTo(drawX - start, top);
        context.lineTo(drawX - start, horizon);
        context.moveTo(drawX - start, horizon);
        context.lineTo(drawX - start + ((bottom - horizon) * this.slope), bottom);
        context.closePath();
        context.stroke();
      }
      for (drawX = _ref2 = xOffset - 100, _ref3 = xOffset + this.width; _ref2 <= _ref3 ? drawX <= _ref3 : drawX >= _ref3; _ref2 <= _ref3 ? drawX++ : drawX--) {
        if (this.items[drawX]) {
          this.items[drawX].draw(context, drawX - xOffset + padding, bottom - 20, this.slope);
        }
      }
      if (otherPlayer && otherPlayer.x >= xOffset - otherPlayer.padding && otherPlayer.x <= xOffset + this.width) {
        otherDrawX = otherPlayer.x - xOffset + otherPlayer.padding;
        otherDrawY = bottom - 20 - otherPlayer.elevation;
        return function() {
          return otherPlayer.body.draw(context, otherDrawX, otherDrawY, 1.5, otherPlayer.lane);
        };
      }
      return function() {};
    };

    return Course;

  })();

  Entity = (function() {

    function Entity(height, width, depth, canCollide) {
      this.height = height;
      this.width = width;
      this.depth = depth;
      this.canCollide = canCollide != null ? canCollide : false;
    }

    Entity.prototype.shift = function(shiftBack, drawX, drawY, slope) {
      var xShift, yShift;
      yShift = shiftBack;
      xShift = shiftBack * slope;
      drawX = drawX - xShift;
      drawY = drawY - yShift;
      return [drawX, drawY];
    };

    Entity.prototype.draw = function(context, drawX, drawY, slope, slant) {
      var x1, x2, y1, y2;
      if (slant == null) slant = 0;
      x1 = drawX;
      y1 = drawY;
      x2 = drawX + this.width * slope;
      y2 = drawY + this.width;
      context.fillStyle = 'black';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x1 + slant, y1 - this.height);
      context.lineTo(x2 + slant, y2 - this.height);
      context.lineTo(x2, y2);
      context.lineTo(x1, y1);
      context.lineTo(x1 + slant, y1 - this.height);
      context.moveTo(x1 + slant, y1 - this.height);
      context.lineTo(x1 + this.depth + slant, y1 - this.height);
      context.lineTo(x2 + this.depth + slant, y2 - this.height);
      context.lineTo(x2 + this.depth, y2);
      context.lineTo(x2, y2);
      context.moveTo(x2 + slant, y2 - this.height);
      context.lineTo(x2 + this.depth + slant, y2 - this.height);
      context.moveTo(x1 + slant, y1 - this.height);
      context.closePath();
      context.fill();
      return context.stroke();
    };

    return Entity;

  })();

  Tree = (function(_super) {

    __extends(Tree, _super);

    function Tree(height, width, depth, canCollide) {
      this.height = height;
      this.width = width;
      this.depth = depth;
      this.canCollide = canCollide != null ? canCollide : false;
      Tree.__super__.constructor.call(this, this.height, this.width, this.depth, this.canCollide);
      this.leaves = new Entity(this.height, 15, 60);
    }

    Tree.prototype.draw = function(context, drawX, drawY, slope) {
      var _ref;
      context.strokeStyle = 'saddlebrown';
      _ref = this.shift(40, drawX, drawY, slope), drawX = _ref[0], drawY = _ref[1];
      Tree.__super__.draw.call(this, context, drawX, drawY, slope);
      context.strokeStyle = 'green';
      context.fillStyle = 'white';
      return this.leaves.draw(context, drawX - 25, drawY - this.height, slope);
    };

    return Tree;

  })(Entity);

  PlayerBody = (function(_super) {

    __extends(PlayerBody, _super);

    function PlayerBody() {
      PlayerBody.__super__.constructor.apply(this, arguments);
    }

    PlayerBody.prototype.draw = function(context, drawX, drawY, slope, lane) {
      var _ref;
      context.strokeStyle = lane === 1 ? 'blue' : 'orange';
      _ref = this.shift(lane * 20, drawX, drawY, slope), drawX = _ref[0], drawY = _ref[1];
      drawX = drawX - this.depth;
      return PlayerBody.__super__.draw.call(this, context, drawX, drawY, slope, 25);
    };

    return PlayerBody;

  })(Entity);

  RoughPatch = (function(_super) {

    __extends(RoughPatch, _super);

    function RoughPatch() {
      RoughPatch.__super__.constructor.apply(this, arguments);
    }

    RoughPatch.prototype.draw = function(context, drawX, drawY, slope) {
      var _ref;
      context.strokeStyle = 'yellow';
      _ref = this.shift(40, drawX, drawY, slope), drawX = _ref[0], drawY = _ref[1];
      return RoughPatch.__super__.draw.call(this, context, drawX, drawY, slope);
    };

    return RoughPatch;

  })(Entity);

  Santa = (function(_super) {

    __extends(Santa, _super);

    function Santa() {
      Santa.__super__.constructor.apply(this, arguments);
    }

    Santa.prototype.draw = function(context, drawX, drawY, slope) {
      var _ref;
      context.strokeStyle = 'red';
      _ref = this.shift(10, drawX, drawY, slope), drawX = _ref[0], drawY = _ref[1];
      return Santa.__super__.draw.call(this, context, drawX, drawY, slope);
    };

    return Santa;

  })(Entity);

  End = (function(_super) {

    __extends(End, _super);

    function End() {
      End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.draw = function(context, drawX, drawY, slope) {
      var _ref;
      context.strokeStyle = 'red';
      _ref = this.shift(50, drawX, drawY, slope), drawX = _ref[0], drawY = _ref[1];
      return End.__super__.draw.call(this, context, drawX, drawY, slope);
    };

    return End;

  })(Entity);

}).call(this);
