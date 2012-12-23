(function() {
  var Course, Foot, Key,
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
      this.course = new Course(this.canvas.width);
    }

    SantaGame.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    SantaGame.prototype.drawFrame = function() {
      this.frame++;
      this.update();
      this.resetCanvas();
      this.course.draw(this.context, this.canvas, 0);
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
      var leftWasDown, rightWasDown, speed;
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
      if (this.momentum > this.canvas.width) this.momentum = this.canvas.width;
      speed = Math.ceil(this.momentum / 40);
      this.course.x = this.course.x + speed;
      return this.course.update();
    };

    SantaGame.prototype.drawCircles = function() {
      this.context.fillStyle = 'purple';
      this.context.fillRect(0, 30, this.momentum, 10);
      this.context.strokeStyle = 'black';
      this.leftFoot.draw(this.context, 475, 75);
      return this.rightFoot.draw(this.context, 575, 75);
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
      this.x = 0;
      this.items = {};
      this.edge = this.x + this.width;
    }

    Course.prototype.update = function() {
      if (this.x + this.width > this.edge) {
        this.edge = this.x + this.width;
        if (Math.random() < 0.01) return this.items[this.edge] = true;
      }
    };

    Course.prototype.draw = function(context, canvas) {
      var drawX, start, _ref, _ref2, _ref3, _results;
      start = this.x % 100;
      context.strokeStyle = 'black';
      for (drawX = 0, _ref = canvas.width; drawX <= _ref; drawX += 100) {
        context.beginPath();
        context.moveTo(drawX - start, 0);
        context.lineTo(drawX - start, canvas.height);
        context.closePath();
        context.stroke();
      }
      _results = [];
      for (drawX = _ref2 = this.x, _ref3 = this.x + this.width; _ref2 <= _ref3 ? drawX <= _ref3 : drawX >= _ref3; _ref2 <= _ref3 ? drawX++ : drawX--) {
        if (this.items[drawX]) {
          _results.push(this.drawItem(context, drawX - this.x));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Course.prototype.drawItem = function(context, drawX) {
      context.fillStyle = 'black';
      return context.fillRect(drawX, 350, 30, 30);
    };

    return Course;

  })();

}).call(this);
