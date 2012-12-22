(function() {
  var Key,
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
      this.lRadius = 5;
      this.rRadius = 5;
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
      if (this.key.isDown(this.key.codes.LEFT)) {
        this.lRadius = this.lRadius + 2;
      } else if (this.lRadius > 5) {
        this.lRadius = this.lRadius - 1;
      }
      if (this.key.isDown(this.key.codes.RIGHT)) {
        return this.rRadius = this.rRadius + 2;
      } else if (this.rRadius > 5) {
        return this.rRadius = this.rRadius - 1;
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
      this.context.strokeStyle = 'black';
      this.context.beginPath();
      this.context.moveTo(200, 200);
      this.context.lineTo(475, 200);
      this.context.closePath();
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(200, 200, this.lRadius, 0, Math.PI * 2, false);
      this.context.closePath();
      this.context.fillStyle = colorByRadius(this.lRadius);
      this.context.stroke();
      this.context.fill();
      this.context.beginPath();
      this.context.arc(475, 200, this.rRadius, 0, Math.PI * 2, false);
      this.context.closePath();
      this.context.fillStyle = colorByRadius(this.rRadius);
      this.context.stroke();
      this.context.fill();
      this.context.strokeStyle = 'gray';
      this.context.beginPath();
      this.context.arc(200, 200, 100, 0, Math.PI * 2, false);
      this.context.closePath();
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(475, 200, 100, 0, Math.PI * 2, false);
      this.context.closePath();
      this.context.stroke();
      this.context.strokeStyle = 'gray';
      this.context.beginPath();
      this.context.arc(200, 200, 130, 0, Math.PI * 2, false);
      this.context.closePath();
      this.context.stroke();
      this.context.beginPath();
      this.context.arc(475, 200, 130, 0, Math.PI * 2, false);
      this.context.closePath();
      return this.context.stroke();
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

}).call(this);
