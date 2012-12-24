(function() {
  var Course, Entity, Foot, Key, Player, PlayerBody, RoughPatch, Tree,
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
      this.player1 = new Player('LEFT', 'RIGHT', 'DOWN', 0, 200, this.canvas, this.key, 100, this.course);
      this.player2 = new Player('A', 'D', 'S', 200, this.canvas.height, this.canvas, this.key, 100, this.course);
      this.player1.watchPlayer(this.player2);
      this.player2.watchPlayer(this.player1);
    }

    SantaGame.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    SantaGame.prototype.drawFrame = function() {
      this.frame++;
      this.update();
      this.resetCanvas();
      this.context.beginPath();
      this.context.moveTo(0, 200);
      this.context.lineTo(this.canvas.width, 200);
      this.context.closePath();
      this.context.stroke();
      this.player1.draw(this.context, this.canvas);
      this.player2.draw(this.context, this.canvas);
      if (this.running) return requestAnimationFrame(this.drawFrame);
    };

    SantaGame.prototype.play = function() {
      if (this.running) return;
      this.running = true;
      return requestAnimationFrame(this.drawFrame);
    };

    SantaGame.prototype.pause = function() {
      this.running = !this.running;
      if (this.running) return requestAnimationFrame(this.drawFrame);
    };

    SantaGame.prototype.update = function() {
      this.player1.update();
      return this.player2.update();
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

    function Player(leftKey, rightKey, jumpKey, top, bottom, canvas, key, momentum, course) {
      this.leftKey = leftKey;
      this.rightKey = rightKey;
      this.jumpKey = jumpKey;
      this.top = top;
      this.bottom = bottom;
      this.canvas = canvas;
      this.key = key;
      this.momentum = momentum;
      this.course = course;
      this.leftFoot = new Foot(this.leftKey);
      this.rightFoot = new Foot(this.rightKey);
      this.x = 0;
      this.body = new PlayerBody(40, 5, 20);
      this.padding = 50;
      this.jumping = false;
      this.elevation = 0;
      this.jumpHeight = 50;
    }

    Player.prototype.watchPlayer = function(otherPlayer) {
      this.otherPlayer = otherPlayer;
    };

    Player.prototype.update = function() {
      var collideAt, leftWasDown, rightWasDown, speed;
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
      if (leftWasDown && !this.leftFoot.down) {
        this.momentum = this.momentum + this.leftFoot.finishStroke();
      } else if (!leftWasDown && this.leftFoot.down) {
        if (this.leftFoot.position !== 0) this.momentum = 20;
        this.leftFoot.startStroke();
        this.rightFoot.reposition();
      }
      if (rightWasDown && !this.rightFoot.down) {
        this.momentum = this.momentum + this.rightFoot.finishStroke();
      } else if (!rightWasDown && this.rightFoot.down) {
        if (this.rightFoot.position !== 0) this.momentum = 20;
        this.rightFoot.startStroke();
        this.leftFoot.reposition();
      }
      if (this.momentum > 0) this.momentum = this.momentum - 0.5;
      if (this.momentum > this.canvas.width) this.momentum = this.canvas.width;
      speed = Math.ceil(this.momentum / 40);
      if (!(this.elevation > 0)) {
        collideAt = this.course.checkCollision(this.x, speed);
        if (collideAt > 0) {
          this.momentum = 0;
          speed = collideAt;
        }
      }
      this.x = this.x + speed;
      return this.course.update(this.x);
    };

    Player.prototype.draw = function(context, canvas) {
      this.course.draw(context, canvas, this.top, this.bottom, this.x, this.otherPlayer, this.padding);
      this.leftFoot.draw(context, canvas.width - 200, this.top + 75);
      this.rightFoot.draw(context, canvas.width - 100, this.top + 75);
      this.body.draw(context, this.padding, this.bottom - 20 - this.elevation, 1.5);
      context.fillStyle = 'purple';
      return context.fillRect(0, this.top + 30, this.momentum, 10);
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
        return 'black';
      }
    };

    Foot.prototype.draw = function(context, x, y) {
      y = y + (this.position * (-50 * this.scale));
      context.beginPath();
      context.arc(x, y, this.radius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      context.fillStyle = this.colorByRadius(this.radius);
      context.stroke();
      context.fill();
      context.strokeStyle = 'gray';
      context.beginPath();
      context.arc(x, y, this.greatRadius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      context.stroke();
      context.strokeStyle = 'gray';
      context.beginPath();
      context.arc(x, y, this.maxRadius * this.scale, 0, Math.PI * 2, false);
      context.closePath();
      return context.stroke();
    };

    return Foot;

  })();

  Course = (function() {

    function Course(width) {
      this.width = width;
      this.items = {};
      this.edge = this.width;
      this.slope = 1.5;
    }

    Course.prototype.update = function(x) {
      if (x + this.width > this.edge) {
        this.edge = x + this.width;
        if (Math.random() < 0.005) {
          return this.items[this.edge] = new Tree(70, 10, 20);
        } else if (Math.random() < 0.005) {
          return this.items[this.edge] = new RoughPatch(0, 35, 30);
        }
      }
    };

    Course.prototype.checkCollision = function(x, speed) {
      var collisionX, _ref;
      for (collisionX = x, _ref = x + speed; x <= _ref ? collisionX <= _ref : collisionX >= _ref; x <= _ref ? collisionX++ : collisionX--) {
        if (this.items[collisionX]) return collisionX - x;
      }
      return 0;
    };

    Course.prototype.draw = function(context, canvas, top, bottom, xOffset, otherPlayer, padding) {
      var drawX, horizon, start, _ref, _ref2, _ref3;
      horizon = bottom - 50;
      context.strokeStyle = 'black';
      context.beginPath();
      context.moveTo(0, horizon);
      context.lineTo(canvas.width, horizon);
      context.closePath();
      context.stroke();
      start = xOffset % 100;
      for (drawX = 0, _ref = canvas.width + 100; drawX <= _ref; drawX += 100) {
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
          this.items[drawX].draw(context, drawX - xOffset + padding, bottom - 45, this.slope);
        }
      }
      if (otherPlayer && otherPlayer.x >= xOffset - otherPlayer.padding && otherPlayer.x <= xOffset + this.width) {
        return otherPlayer.body.draw(context, otherPlayer.x - xOffset + otherPlayer.padding, bottom - 20 - otherPlayer.elevation, 1.5);
      }
    };

    return Course;

  })();

  Entity = (function() {

    function Entity(height, width, depth) {
      this.height = height;
      this.width = width;
      this.depth = depth;
    }

    Entity.prototype.draw = function(context, drawX, drawY, slope) {
      var x1, x2, y1, y2;
      x1 = drawX;
      y1 = drawY;
      x2 = drawX + this.width * slope;
      y2 = drawY + this.width;
      context.strokeStyle = 'black';
      context.fillStyle = 'black';
      context.beginPath();
      context.moveTo(x1, y1 - this.height);
      context.lineTo(x2, y2 - this.height);
      context.lineTo(x2, y2);
      context.lineTo(x1, y1);
      context.lineTo(x1, y1 - this.height);
      context.moveTo(x1, y1 - this.height);
      context.lineTo(x1 + this.depth, y1 - this.height);
      context.lineTo(x2 + this.depth, y2 - this.height);
      context.lineTo(x2 + this.depth, y2);
      context.lineTo(x2, y2);
      context.moveTo(x2, y2 - this.height);
      context.lineTo(x2 + this.depth, y2 - this.height);
      context.moveTo(x1, y1 - this.height);
      context.closePath();
      return context.stroke();
    };

    return Entity;

  })();

  Tree = (function(_super) {

    __extends(Tree, _super);

    function Tree() {
      Tree.__super__.constructor.apply(this, arguments);
    }

    return Tree;

  })(Entity);

  PlayerBody = (function(_super) {

    __extends(PlayerBody, _super);

    function PlayerBody() {
      PlayerBody.__super__.constructor.apply(this, arguments);
    }

    PlayerBody.prototype.draw = function(context, drawX, drawY, slope) {
      return PlayerBody.__super__.draw.call(this, context, drawX - this.depth, drawY, slope);
    };

    return PlayerBody;

  })(Entity);

  RoughPatch = (function(_super) {

    __extends(RoughPatch, _super);

    function RoughPatch() {
      RoughPatch.__super__.constructor.apply(this, arguments);
    }

    return RoughPatch;

  })(Entity);

}).call(this);
