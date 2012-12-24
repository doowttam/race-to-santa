class window.SantaGame
  constructor: (@doc, @win) ->
    @canvas  = @doc.getElementById 'game_canvas'
    @context = @canvas.getContext '2d'
    @buttons =
      start: @doc.getElementById 'start'
      pause: @doc.getElementById 'pause'

    @buttons.start.onclick = @play
    @buttons.pause.onclick = @pause

    @key = new Key
    @win.onkeyup = (e) =>
      @key.onKeyUp e
    @win.onkeydown = (e) =>
      @key.onKeyDown e

    @course  = new Course @canvas.width

    @player1 = new Player 'LEFT', 'RIGHT', 'DOWN', 0, 200, @canvas, @key, 100, @course
    @player2 = new Player 'A', 'D', 'S', 200, @canvas.height, @canvas, @key, 100, @course

    @player1.watchPlayer @player2
    @player2.watchPlayer @player1

    @drawOpener()

  drawOpener: ->
    @context.fillStyle = 'rgba(0,0,0,.7)'
    @context.fillRect 0, 0, @canvas.width, @canvas.height

    @context.fillStyle = 'white'
    @context.font = 'bold 48px sans-serif'
    @context.textAlign = 'center'
    @context.fillText 'Race to Santa', @canvas.width / 2, 200

  resetCanvas: ->
    @canvas.width = @canvas.width

  drawFrame: =>
    @frame++

    # Update objects that interact with the controls
    @update()

    # Wipe canvas so we can draw on it
    @resetCanvas()

    @player1.draw @context, @canvas
    @player2.draw @context, @canvas

    @drawHud()

    if !@running
      @drawPause()
    else
      @checkWin()

    # Continue running if we should
    requestAnimationFrame @drawFrame if @running

  drawHud: ->
    @context.beginPath()
    @context.moveTo 0, 200
    @context.lineTo @canvas.width, 200
    @context.closePath()

    @context.stroke()

    player1Pos = @player1.x / (@course.end / (@canvas.width - 60))
    player2Pos = @player2.x / (@course.end / (@canvas.width - 60))

    @context.fillStyle = 'blue'
    @context.fillRect player1Pos, 190, 10, 10

    @context.fillStyle = 'orange'
    @context.fillRect player2Pos, 200, 10, 10

    @context.fillStyle = 'red'
    @context.fillRect @canvas.width - 50, 190, 50, 20

    @context.fillStyle = 'white'
    @context.font = 'bold 12px sans-serif'
    @context.textAlign = 'left'
    @context.fillText 'SANTA', @canvas.width - 46, 205

  play: =>
    return if @running

    @buttons.start.disabled = true

    that = @
    countdown = (count) ->
      that.resetCanvas()

      that.context.fillStyle = 'rgba(0,0,0,.7)'
      that.context.fillRect 0, 0, that.canvas.width, that.canvas.height
      that.context
      that.context.fillStyle = 'white'
      that.context.font = 'bold 48px sans-serif'
      that.context.textAlign = 'center'
      that.context.fillText "#{count}...", that.canvas.width / 2, 200

      if count == 0
        that.running = true
        requestAnimationFrame that.drawFrame
      else
        setTimeout ->
          countdown --count
        , 1000

    countdown(3)

  drawPause: ->
    @context.fillStyle = 'rgba(0,0,0,.7)'
    @context.fillRect 0, 0, @canvas.width, @canvas.height

    @context.fillStyle = 'white'
    @context.font = 'bold 48px sans-serif'
    @context.textAlign = 'center'
    @context.fillText 'Paused', @canvas.width / 2, 200

  pause: =>
    @running = !@running
    requestAnimationFrame @drawFrame if @running

  winGame: (player) ->
    @running = false

    @context.fillStyle = 'rgba(0,0,0,.7)'
    @context.fillRect 0, 0, @canvas.width, @canvas.height

    @context.fillStyle = 'white'
    @context.font = 'bold 48px sans-serif'
    @context.textAlign = 'center'
    @context.fillText player + " wins!", @canvas.width / 2, 125

  update: ->
    @player1.update()
    @player2.update()

  checkWin: ->
    # No ties, sorry
    if @course.checkWin @player1.x
      @winGame 'Player 1'

    if @course.checkWin @player2.x
      @winGame 'Player 2'

# Inspired by http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
class Key
  pressed: {}

  codes:
    'LEFT': 37
    'UP': 38
    'RIGHT': 39
    'DOWN': 40
    'SPACE': 32
    'A': 65
    'D': 68
    'S': 83

  isDown: (keyCode) =>
    return @pressed[keyCode]

  onKeyDown: (event) =>
    @pressed[event.keyCode] = true

  onKeyUp: (event) =>
    delete @pressed[event.keyCode]

class Player
  constructor: (@leftKey, @rightKey, @jumpKey, @top, @bottom, @canvas, @key, @momentum, @course) ->
    @leftFoot   = new Foot @leftKey
    @rightFoot  = new Foot @rightKey
    @x          = 0
    @body       = new PlayerBody 40, 5, 20
    @padding    = 50
    @jumping    = false
    @elevation  = 0
    @jumpHeight = 50

  watchPlayer: (@otherPlayer) ->

  update: ->
    leftWasDown  = @leftFoot.down
    rightWasDown = @rightFoot.down

    if @key.isDown(@key.codes[@jumpKey]) and !@jumping and !(@elevation > 0)
      @jumping = true
      @leftFoot.reset()
      @rightFoot.reset()

    if @jumping
      if @elevation < @jumpHeight
        @elevation = @elevation + 3
      else
        @jumping = false
    else if @elevation > 0
      @elevation = @elevation - 3

    if !(@elevation > 0)
      @leftFoot.update @key
      @rightFoot.update @key

    if leftWasDown and !@leftFoot.down
      @momentum = @momentum + @leftFoot.finishStroke()
    else if !leftWasDown and @leftFoot.down
      # Stumble!
      @momentum = 20 if @leftFoot.position != 0
      @leftFoot.startStroke()
      @rightFoot.reposition()

    if rightWasDown and !@rightFoot.down
      @momentum = @momentum + @rightFoot.finishStroke()
    else if !rightWasDown and @rightFoot.down
      # Stumble!
      @momentum = 20 if @rightFoot.position != 0
      @rightFoot.startStroke()
      @leftFoot.reposition()

    # Normal slow down
    if @momentum > 0
      @momentum = @momentum - 0.5

    if @momentum > @canvas.width
      @momentum = @canvas.width

    speed = Math.ceil( @momentum / 40)

    if !(@elevation > 0)
      collideAt = @course.checkCollision @x, speed

      if collideAt > 0
        @momentum = 0
        speed = collideAt

    @x = @x + speed

    @course.update @x

  draw: (context, canvas) ->
    @course.draw context, canvas, @top, @bottom, @x, @otherPlayer, @padding
    @leftFoot.draw context, canvas.width - 200, @top + 75
    @rightFoot.draw context, canvas.width - 100, @top + 75
    @body.draw context, @padding, @bottom - 20 - @elevation, 1.5

class Foot
  constructor: (@foot, @position = 0) ->
    @down        = false
    @start       = 0
    @radius      = 5
    @maxRadius   = 130
    @greatRadius = 100
    @scale       = 0.3

  update: (key) ->
    if key.isDown key.codes[@foot]
      @addToStroke(2)
      @down = true
    else if @radius > 5
      @removeFromStroke(1)
      @down = false

  startStroke: ->
    @start    = @radius
    @position = 1

  endStroke: ->
    @position = -1
    @radius - @start

  reposition: -> @position = 0
  reset: ->
    @reposition()
    @down   = false
    @start  = 0
    @radius = 5

  addToStroke:      (length) -> @radius = @radius + length
  removeFromStroke: (length) -> @radius = @radius - length

  finishStroke: ->
    strokeLength = @endStroke()

    # Too long!
    if @radius > @maxRadius
      strokeLength = 20
    else if @radius > @greatRadius
      strokeLength = strokeLength + 20

    return strokeLength

  colorByRadius: (radius) ->
    if radius > @maxRadius
      'red'
    else if radius > @greatRadius
      'green'
    else
      'black'

  draw: (context, x, y) ->
    y = y + (@position * (-50 * @scale))

    context.beginPath()
    context.arc x, y, @radius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.fillStyle = @colorByRadius @radius

    context.stroke()
    context.fill()

    context.strokeStyle = 'gray'

    context.beginPath()
    context.arc x, y, @greatRadius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()

    context.strokeStyle = 'gray'

    context.beginPath()
    context.arc x, y, @maxRadius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()

class Course
  constructor: (@width) ->
    @items    = {}
    @edge     = @width
    @slope    = 1.5
    @end      = 100000
    @lastItem = 0

  update: (x) ->
    if x + @width > @edge
      @edge = x + @width

      return if @lastItem > @edge - 100

      if Math.random() < 0.005
        @items[@edge] = new Tree 70, 8, 22
        @lastItem     = @edge
      else if Math.random() < 0.005
        @items[@edge] = new RoughPatch 0, 5, 20, true
        @lastItem     = @edge

  checkCollision: (x, speed) ->
    for collisionX in [x..x + speed]
      return collisionX - x if @items[collisionX] and @items[collisionX].canCollide
    return 0

  checkWin: (x) -> x > @end

  draw: (context, canvas, top, bottom, xOffset, otherPlayer, padding) ->
    horizon = bottom - 50

    context.strokeStyle = 'black'

    context.beginPath()
    context.moveTo 0, horizon
    context.lineTo canvas.width, horizon
    context.closePath()

    context.stroke()

    start = xOffset % 100
    for drawX in [0..canvas.width + 100] by 100
      context.beginPath()
      context.moveTo drawX - start, top
      context.lineTo drawX - start, horizon
      context.moveTo drawX - start, horizon
      context.lineTo drawX - start + ((bottom - horizon) * @slope), bottom
      context.closePath()

      context.stroke()

    for drawX in [(xOffset - 100)..xOffset + @width]
      @items[drawX].draw(context, drawX - xOffset + padding, bottom - 20, @slope) if @items[drawX]

    if otherPlayer and otherPlayer.x >= xOffset - otherPlayer.padding and otherPlayer.x <= xOffset + @width
      otherPlayer.body.draw context, otherPlayer.x - xOffset + otherPlayer.padding, bottom - 20 - otherPlayer.elevation, 1.5

class Entity
  constructor: (@height, @width, @depth, @canCollide = false) ->

  draw: (context, drawX, drawY, slope) ->
    x1 = drawX
    y1 = drawY
    x2 = drawX + @width * slope
    y2 = drawY + @width

    context.fillStyle = 'white'

    context.beginPath()

    context.moveTo x1, y1 - @height
    context.lineTo x2, y2 - @height
    context.lineTo x2, y2
    context.lineTo x1, y1
    context.lineTo x1, y1 - @height

    context.moveTo x1, y1 - @height
    context.lineTo x1 + @depth, y1 - @height
    context.lineTo x2 + @depth, y2 - @height
    context.lineTo x2 + @depth, y2
    context.lineTo x2, y2
    context.moveTo x2, y2 - @height
    context.lineTo x2 + @depth, y2 - @height
    context.moveTo x1, y1 - @height

    context.closePath()

    context.fill()
    context.stroke()

class Tree extends Entity
  draw: (context, drawX, drawY, slope) ->
    shiftBack = 30
    yShift = shiftBack
    xShift = shiftBack * slope

    drawX = drawX - xShift
    drawY = drawY - yShift

    context.strokeStyle = 'saddlebrown'

    super context, drawX, drawY, slope

    # Draw leaves
    drawX = drawX - 25

    depth = 60
    width = 15

    x1 = drawX
    y1 = drawY - @height
    x2 = drawX + width * slope
    y2 = drawY + width - @height

    context.strokeStyle = 'green'
    context.fillStyle = 'white'

    context.beginPath()

    context.moveTo x1, y1 - @height
    context.lineTo x2, y2 - @height
    context.lineTo x2, y2
    context.lineTo x1, y1
    context.lineTo x1, y1 - @height

    context.moveTo x1, y1 - @height
    context.lineTo x1 + depth, y1 - @height
    context.lineTo x2 + depth, y2 - @height
    context.lineTo x2 + depth, y2
    context.lineTo x2, y2
    context.moveTo x2, y2 - @height
    context.lineTo x2 + depth, y2 - @height
    context.moveTo x1, y1 - @height

    context.closePath()

    context.fill()
    context.stroke()

class PlayerBody extends Entity
  # Draw the player with x being their front, rather than back
  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'black'
    super context, drawX - @depth, drawY, slope

class RoughPatch extends Entity
  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'black'
    super context, drawX, drawY, slope

