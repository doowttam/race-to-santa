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

  resetCanvas: ->
    @canvas.width = @canvas.width

  drawFrame: =>
    @frame++

    # Update objects that interact with the controls
    @update()

    # Wipe canvas so we can draw on it
    @resetCanvas()

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
    if @key.isDown @key.codes.LEFT
      @leftFoot.addToStroke(2)
    else if @leftFoot.radius > 5
      @leftFoot.removeFromStroke(1)

    if ( @key.isDown @key.codes.RIGHT )
      @rightFoot.addToStroke(2)
    else if @rightFoot.radius > 5
      @rightFoot.removeFromStroke(1)

    leftWasDown  = @leftFoot.down
    rightWasDown = @rightFoot.down

    @leftFoot.update @key
    @rightFoot.update @key

    if leftWasDown and !@leftFoot.down
      strokeLength = @leftFoot.endStroke()

      # Too long!
      if @leftFoot.radius > 130
        strokeLength = 20
      else if @leftFoot.radius > 100
        strokeLength = strokeLength + 20

      @momentum = @momentum + strokeLength
    else if !leftWasDown and @leftFoot.down
      # Stumble!
      @momentum = 20 if @leftFoot.position != 0
      @leftFoot.startStroke()
      @rightFoot.reposition()

    if rightWasDown and !@rightFoot.down
      strokeLength = @rightFoot.endStroke()

      # Too long!
      if @rightFoot.radius > 130
        strokeLength = 20
      else if @rightFoot.radius > 100
        strokeLength = strokeLength + 20

      @momentum = @momentum + strokeLength
    else if !rightWasDown and @rightFoot.down
      # Stumble!
      @momentum = 20 if @rightFoot.position != 0
      @rightFoot.startStroke()
      @leftFoot.reposition()

    # Normal slow down
    if @momentum > 0
      @momentum = @momentum - 0.5

  drawCircles: =>
    colorByRadius = (radius) ->
      if radius > 130
        'red'
      else if radius > 100
        'green'
      else
        'black'

    @context.fillStyle = 'purple'
    @context.fillRect 0, 30, @momentum, 10
    @context.strokeStyle = 'black'

    @context.beginPath()
    @context.moveTo 200, 200
    @context.lineTo 475, 200
    @context.closePath()

    @context.stroke()

    @leftFoot.draw @context, 200, 200
    @rightFoot.draw @context, 475, 200

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
    @down   = false
    @start  = 0
    @radius = 5

  update: (key) ->
    @down = key.isDown key.codes[@foot]

  startStroke: ->
    @start    = @radius
    @position = 1

  endStroke: ->
    @position = -1
    @radius - @start

  reposition: -> @position = 0

  addToStroke:      (length) -> @radius = @radius + length
  removeFromStroke: (length) -> @radius = @radius - length

  colorByRadius: (radius) ->
    if radius > 130
      'red'
    else if radius > 100
      'green'
    else
      'black'

  draw: (context, x, y) ->
    y = y + (@position * -50)

    context.beginPath()
    context.arc x, y, @radius, 0, Math.PI * 2, false
    context.closePath()

    context.fillStyle = @colorByRadius @radius

    context.stroke()
    context.fill()

    context.strokeStyle = 'gray'

    context.beginPath()
    context.arc x, y, 100, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()

    context.strokeStyle = 'gray'

    context.beginPath()
    context.arc x, y, 130, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()


