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

    @lRadius = 5
    @rRadius = 5

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
      @lRadius = @lRadius + 2
    else if @lRadius > 5
      @lRadius = @lRadius - 1

    if ( @key.isDown @key.codes.RIGHT )
      @rRadius = @rRadius + 2
    else if @rRadius > 5
      @rRadius = @rRadius - 1

  drawCircles: =>
    colorByRadius = (radius) ->
      if radius > 130
        'red'
      else if radius > 100
        'green'
      else
        'black'

    @context.strokeStyle = 'black'

    @context.beginPath()
    @context.moveTo 200, 200
    @context.lineTo 475, 200
    @context.closePath()

    @context.stroke()

    @context.beginPath()
    @context.arc 200, 200, @lRadius, 0, Math.PI * 2, false
    @context.closePath();

    @context.fillStyle = colorByRadius @lRadius

    @context.stroke()
    @context.fill()

    @context.beginPath()
    @context.arc 475, 200, @rRadius, 0, Math.PI * 2, false
    @context.closePath()

    @context.fillStyle = colorByRadius @rRadius

    @context.stroke()
    @context.fill()

    @context.strokeStyle = 'gray'

    @context.beginPath()
    @context.arc 200, 200, 100, 0, Math.PI * 2, false
    @context.closePath()

    @context.stroke()

    @context.beginPath()
    @context.arc 475, 200, 100, 0, Math.PI * 2, false
    @context.closePath()

    @context.stroke()

    @context.strokeStyle = 'gray'

    @context.beginPath()
    @context.arc 200, 200, 130, 0, Math.PI * 2, false
    @context.closePath()

    @context.stroke()

    @context.beginPath()
    @context.arc 475, 200, 130, 0, Math.PI * 2, false
    @context.closePath()

    @context.stroke()

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
