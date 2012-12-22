(function() {
  var Foot, Key,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.SantaGame = (function() {

    function SantaGame(doc, win) {
      var _this = this;
      this.doc = doc;
      this.win = win;
      this.drawCircles = __bind(this.drawCircles, this);
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
      this.momentum = 100;
      this.leftFoot = new Foot('LEFT');
      this.rightFoot = new Foot('RIGHT');
    }

    SantaGame.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    SantaGame.prototype.drawFrame = function() {
      this.frame++;
      this.update();
      this.resetCanvas();
      this.drawCircles();
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
      var leftWasDown, rightWasDown;
      leftWasDown = this.leftFoot.down;
      rightWasDown = this.rightFoot.down;
      this.leftFoot.update(this.key);
      this.rightFoot.update(this.key);
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
      if (this.momentum > this.canvas.width) {
        return this.momentum = this.canvas.width;
      }
    };

    SantaGame.prototype.drawCircles = function() {
      var colorByRadius;
      colorByRadius = function(radius) {
        if (radius > 130) {
          return 'red';
        } else if (radius > 100) {
          return 'green';
        } else {
          return 'black';
        }
      };
      this.context.fillStyle = 'purple';
      this.context.fillRect(0, 30, this.momentum, 10);
      this.context.strokeStyle = 'black';
      this.context.beginPath();
      this.context.moveTo(200, 200);
      this.context.lineTo(475, 200);
      this.context.closePath();
      this.context.stroke();
      this.leftFoot.draw(this.context, 200, 200);
      return this.rightFoot.draw(this.context, 475, 200);
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
      'SPACE': 32
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

  Foot = (function() {

    function Foot(foot, position) {
      this.foot = foot;
      this.position = position != null ? position : 0;
      this.down = false;
      this.start = 0;
      this.radius = 5;
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

    Foot.prototype.addToStroke = function(length) {
      return this.radius = this.radius + length;
    };

    Foot.prototype.removeFromStroke = function(length) {
      return this.radius = this.radius - length;
    };

    Foot.prototype.finishStroke = function() {
      var strokeLength;
      strokeLength = this.endStroke();
      if (this.radius > 130) {
        strokeLength = 20;
      } else if (this.radius > 100) {
        strokeLength = strokeLength + 20;
      }
      return strokeLength;
    };

    Foot.prototype.colorByRadius = function(radius) {
      if (radius > 130) {
        return 'red';
      } else if (radius > 100) {
        return 'green';
      } else {
        return 'black';
      }
    };

    Foot.prototype.draw = function(context, x, y) {
      y = y + (this.position * -50);
      context.beginPath();
      context.arc(x, y, this.radius, 0, Math.PI * 2, false);
      context.closePath();
      context.fillStyle = this.colorByRadius(this.radius);
      context.stroke();
      context.fill();
      context.strokeStyle = 'gray';
      context.beginPath();
      context.arc(x, y, 100, 0, Math.PI * 2, false);
      context.closePath();
      context.stroke();
      context.strokeStyle = 'gray';
      context.beginPath();
      context.arc(x, y, 130, 0, Math.PI * 2, false);
      context.closePath();
      return context.stroke();
    };

    return Foot;

  })();

}).call(this);
