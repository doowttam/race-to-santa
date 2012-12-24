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

    @player1 = new Player 'LEFT', 'RIGHT', 'DOWN', 0, 200, @key, @course, 1
    @player2 = new Player 'A', 'D', 'S', 200, @canvas.height, @key, @course, 0

    @player1.watchPlayer @player2
    @player2.watchPlayer @player1

    # Initialize messages
    @msg =
      1: []
      0: []

    @drawOpener()

  drawOpener: ->
    @context.fillStyle = 'red'
    @context.font = 'bold 48px sans-serif'
    @context.textAlign = 'center'
    @context.fillText 'Race to Santa', @canvas.width / 2, 80

    @context.fillStyle = 'white'
    @context.font = 'bold 24px sans-serif'
    @context.textAlign = 'center'

    @context.fillStyle = 'blue'
    @context.fillText 'Player 1', @canvas.width / 4, 130

    @context.fillStyle = 'orange'
    @context.fillText 'Player 2', (@canvas.width / 4) * 3, 130

    @context.fillStyle = 'white'
    @context.font = 'bold 20px sans-serif'
    @context.textAlign = 'center'
    @context.fillText 'Feet - Left/Right Arrows', @canvas.width / 4, 170
    @context.fillText 'Jump - Down Arrow', @canvas.width / 4, 210
    @context.fillText 'Feet - A/D Keys', (@canvas.width / 4) * 3, 170
    @context.fillText 'Jump - S Key', (@canvas.width / 4) * 3, 210

    @player1.body.draw @context, @canvas.width / 4, 300, 1.5, @player1.lane
    @player2.body.draw @context, (@canvas.width / 4) * 3, 280, 1.5, @player2.lane

    @context.fillStyle = 'white'
    @context.font = 'bold 18px sans-serif'
    @context.fillText 'Ice skate to Santa! Use long smooth movements for the most speed.', @canvas.width / 2, 330
    @context.fillText 'Jump over speed bumps and always push with your forward foot!', @canvas.width / 2, 355


  # Could be refactored into general messaging, if we had more messages
  addStumbleMessage: (lane) ->
    @msg[lane].push "You stumbled! Push with your forward foot!"

    that = @
    setTimeout ->
      that.msg[lane].shift()
    , 3000

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
    @context.strokeStyle = 'white'

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

    @checkMessages()

  checkMessages: ->
    that = @
    drawMessage = (player) ->
      msgArray   = that.msg[player.lane]
      mostRecent = msgArray[msgArray.length - 1]

      if mostRecent
        that.context.fillStyle = 'red'
        that.context.font = 'bold 16px sans-serif'
        that.context.textAlign = 'center'
        yPos = if player.lane == 1 then 50 else 250
        that.context.fillText mostRecent, that.canvas.width / 2, yPos

    drawMessage @player1
    drawMessage @player2

  play: =>
    return if @running

    @buttons.start.disabled = true

    that = @
    countdown = (count) ->
      that.resetCanvas()

      that.context.fillStyle = 'rgba(0,0,0,.7)'
      that.context.fillRect 0, 0, that.canvas.width, that.canvas.height

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

    @context.fillStyle = 'white'
    @context.font = 'bold 18px sans-serif'
    @context.textAlign = 'center'
    @context.fillText 'Refresh the page to play again.', @canvas.width / 2, 200

    @buttons.pause.disabled = true

  update: ->
    @player1.update()
    @player2.update()

    @checkStumble @player1
    @checkStumble @player2

  checkStumble: (player) ->
    if player.stumbled
      player.stumbled = false
      @addStumbleMessage player.lane

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
  constructor: (@leftKey, @rightKey, @jumpKey, @top, @bottom, @key, @course, @lane) ->
    @leftFoot   = new Foot @leftKey
    @rightFoot  = new Foot @rightKey
    @x          = 0
    @body       = new PlayerBody 40, 5, 20
    @padding    = 100
    @jumping    = false
    @elevation  = 0
    @jumpHeight = 50
    @momentum   = 100

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

    that = @
    checkStroke = (foot, wasDown, otherFoot) ->
      if wasDown and !foot.down
        that.momentum = that.momentum + foot.finishStroke()
      else if !wasDown and foot.down
        # Stumble!
        if foot.position != 0
          that.momentum = 20
          that.stumbled = true

        foot.startStroke()
        otherFoot.reposition()

    checkStroke @leftFoot, leftWasDown, @rightFoot
    checkStroke @rightFoot, rightWasDown, @leftFoot

    # Normal slow down
    if @momentum > 0 then @momentum = @momentum - 0.5

    # Max momentum
    if @momentum > 600 then @momentum = 600

    speed = Math.ceil( @momentum / 40)

    if !(@elevation > 0)
      collideAt = @course.checkCollision @x, speed

      if collideAt > 0
        @momentum = @momentum / 3
        speed = collideAt

    @x = @x + speed

    @course.update @x

  draw: (context, canvas) ->
    drawOtherPlayer = @course.draw context, canvas, @top, @bottom, @x, @otherPlayer, @padding
    @leftFoot.draw context, canvas.width - 200, @top + 75
    @rightFoot.draw context, canvas.width - 100, @top + 75

    if @lane == 1
      @body.draw context, @padding, @bottom - 20 - @elevation, 1.5, @lane
      drawOtherPlayer()
    else
      drawOtherPlayer()
      @body.draw context, @padding, @bottom - 20 - @elevation, 1.5, @lane

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
      'gray'

  draw: (context, x, y) ->
    context.strokeStyle = 'gray'
    context.lineWidth   = 1

    y = y + (@position * (-50 * @scale))

    context.beginPath()
    context.arc x, y, @radius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.fillStyle = @colorByRadius @radius

    context.stroke()
    context.fill()

    context.beginPath()
    context.arc x, y, @greatRadius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()

    context.beginPath()
    context.arc x, y, @maxRadius * @scale, 0, Math.PI * 2, false
    context.closePath()

    context.stroke()

class Course
  constructor: (@width) ->
    @edge     = @width
    @slope    = 1.5
    @lastItem = 0

    end    = 50000
    @end   = end
    @items = {}
    @items[end]      = new End 0, 70, 1
    @items[end + 50] = new Santa 70, 8, 22

  update: (x) ->
    if x + @width > @edge
      @edge = x + @width

      return if @edge > @end or @lastItem > @edge - 100

      if Math.random() < 0.005
        @items[@edge] = new Tree 70, 8, 22
        @lastItem     = @edge
      else if Math.random() < 0.005
        @items[@edge] = new RoughPatch 0, 50, 20, true
        @lastItem     = @edge

  checkCollision: (x, speed) ->
    for collisionX in [x..x + speed]
      return collisionX - x if @items[collisionX] and @items[collisionX].canCollide
    return 0

  checkWin: (x) -> x > @end

  draw: (context, canvas, top, bottom, xOffset, otherPlayer, padding) ->
    horizon = bottom - 70

    context.strokeStyle = 'white'
    context.beginPath()
    context.moveTo 0, horizon
    context.lineTo canvas.width, horizon
    context.closePath()

    context.stroke()

    start = xOffset % 150
    for drawX in [0..canvas.width + 150] by 150
      context.beginPath()
      context.moveTo drawX - start, top
      context.lineTo drawX - start, horizon
      context.moveTo drawX - start, horizon
      context.lineTo drawX - start + ((bottom - horizon) * @slope), bottom
      context.closePath()

      context.stroke()

    for drawX in [(xOffset - 100)..xOffset + @width]
      @items[drawX].draw(context, drawX - xOffset + padding, bottom - 20, @slope) if @items[drawX]

    # Return a callback to draw the other player (or an empty callback) so that we can layer
    # player bodies appropriately
    if otherPlayer and otherPlayer.x >= xOffset - otherPlayer.padding and otherPlayer.x <= xOffset + @width
      otherDrawX = otherPlayer.x - xOffset + otherPlayer.padding
      otherDrawY = bottom - 20 - otherPlayer.elevation

      return -> otherPlayer.body.draw context, otherDrawX, otherDrawY, 1.5, otherPlayer.lane
    return -> # Empty callback, player isn't in view

class Entity
  constructor: (@height, @width, @depth, @canCollide = false) ->

  shift: (shiftBack, drawX, drawY, slope) ->
    yShift = shiftBack
    xShift = shiftBack * slope

    drawX = drawX - xShift
    drawY = drawY - yShift

    [drawX, drawY]

  draw: (context, drawX, drawY, slope, slant = 0) ->
    x1 = drawX
    y1 = drawY
    x2 = drawX + @width * slope
    y2 = drawY + @width

    context.fillStyle = 'black'
    context.lineWidth = 2

    context.beginPath()

    context.moveTo x1 + slant, y1 - @height
    context.lineTo x2 + slant, y2 - @height
    context.lineTo x2, y2
    context.lineTo x1, y1
    context.lineTo x1 + slant, y1 - @height

    context.moveTo x1 + slant, y1 - @height
    context.lineTo x1 + @depth + slant, y1 - @height
    context.lineTo x2 + @depth + slant, y2 - @height
    context.lineTo x2 + @depth, y2
    context.lineTo x2, y2
    context.moveTo x2 + slant, y2 - @height
    context.lineTo x2 + @depth + slant, y2 - @height
    context.moveTo x1 + slant, y1 - @height

    context.closePath()

    context.fill()
    context.stroke()

class Tree extends Entity
  constructor: (@height, @width, @depth, @canCollide = false) ->
    super @height, @width, @depth, @canCollide
    @leaves = new Entity @height, 15, 60

  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'saddlebrown'

    [drawX, drawY] = @shift 40, drawX, drawY, slope
    super context, drawX, drawY, slope

    context.strokeStyle = 'green'
    context.fillStyle = 'white'

    @leaves.draw context, drawX - 25, drawY - @height, slope

class PlayerBody extends Entity
  draw: (context, drawX, drawY, slope, lane) ->
    context.strokeStyle = if lane == 1 then 'blue' else 'orange'

    [drawX, drawY] = @shift (lane * 20), drawX, drawY, slope

    # Draw the player with x being their front, rather than back
    drawX = drawX - @depth

    super context, drawX, drawY, slope, 25

class RoughPatch extends Entity
  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'yellow'

    [drawX, drawY] = @shift 40, drawX, drawY, slope
    super context, drawX, drawY, slope

class Santa extends Entity
  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'red'

    [drawX, drawY] = @shift 10, drawX, drawY, slope
    super context, drawX, drawY, slope

class End extends Entity
  draw: (context, drawX, drawY, slope) ->
    context.strokeStyle = 'red'

    [drawX, drawY] = @shift 50, drawX, drawY, slope
    super context, drawX, drawY, slope
