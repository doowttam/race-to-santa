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

    @momentum = 100

    @leftFoot  = new Foot 'LEFT'
    @rightFoot = new Foot 'RIGHT'

    @course = new Course @canvas.width

  resetCanvas: ->
    @canvas.width = @canvas.width

  drawFrame: =>
    @frame++

    # Update objects that interact with the controls
    @update()

    # Wipe canvas so we can draw on it
    @resetCanvas()

    @course.draw @context, @canvas, 0

    # Draw main parts of UI
    @drawCircles()

    # Continue running if we should
    requestAnimationFrame @drawFrame if @running

  play: =>
    return if @running

    @running = true
    requestAnimationFrame @drawFrame

  pause: =>
    @running = !@running
    requestAnimationFrame @drawFrame if @running

  update: ->
    leftWasDown  = @leftFoot.down
    rightWasDown = @rightFoot.down

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
    @course.x = @course.x + speed

    @course.update()

  drawCircles: =>
    @context.fillStyle = 'purple'
    @context.fillRect 0, 30, @momentum, 10
    @context.strokeStyle = 'black'

    @leftFoot.draw @context, 475, 75
    @rightFoot.draw @context, 575, 75

# Inspired by http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
class Key
  pressed: {}

  codes:
    'LEFT': 37
    'UP': 38
    'RIGHT': 39
    'DOWN': 40
    'SPACE': 32

  isDown: (keyCode) =>
    return @pressed[keyCode]

  onKeyDown: (event) =>
    @pressed[event.keyCode] = true

  onKeyUp: (event) =>
    delete @pressed[event.keyCode]

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
    @x     = 0
    @items = {}
    @edge  = @x + @width

  update: ->
    if @x + @width > @edge
      @edge = @x + @width
      if Math.random() < 0.01
        @items[@edge] = true

  draw: (context, canvas) ->
    start = @x % 100
    context.strokeStyle = 'black'

    for drawX in [0..canvas.width] by 100
      context.beginPath()
      context.moveTo drawX - start, 0
      context.lineTo drawX - start, canvas.height
      context.closePath()

      context.stroke()

    for drawX in [@x..@x + @width]
      @drawItem(context, drawX - @x) if @items[drawX]

  drawItem: (context, drawX) ->
    context.fillStyle = 'black'
    context.fillRect drawX, 350, 30, 30
