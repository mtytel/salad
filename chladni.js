var chladni = function() {
  // Damping consistently puts friction on all waving points.
  var DAMPING = 1.0;
  // Speed constant somehow defines speed of waves. Not sure on relationship.
  var SPEED_CONSTANT = 1.0;

  // Store the width and height so we don't have to access the DOM later.
  var canvas_width = 0, canvas_height = 0;
  var context = null;
  var pos_matrix = null;
  var vel_matrix = null;
  var temp_matrix = null;
  var time = 0;

  // Index by row first, then column.
  function createTwoDimArray(width, height) {
    var arr = [];
    for (var r = 0; r < height; r++) {
      var row = [];
      for (var c = 0; c < width; c++) {
        row.push(0);
      }
      arr.push(row);
    }
    return arr;
  }

  function tick() {
    var val = 5.0 * Math.sin(time / 8.0);
    for (var i = 0; i < canvas_width; i++) {
      pos_matrix[0][i] = val;
      pos_matrix[canvas_height - 1][i] = val;
    }
    for (var i = 0; i < canvas_height; i++) {
      pos_matrix[i][0] = val;
      pos_matrix[i][canvas_width - 1] = val;
    }
    time++;

    for (var r = 1; r < canvas_height - 1; r++) {
      for (var c = 1; c < canvas_width - 1; c++) {
        // Wave equation! Give an acceleration based on neighboring points.
        var neighbor_sum = pos_matrix[r - 1][c] + pos_matrix[r + 1][c] +
                           pos_matrix[r][c - 1] + pos_matrix[r][c + 1];
        var difference = pos_matrix[r][c] - neighbor_sum / 4.0;
        temp_matrix[r][c] = vel_matrix[r][c] - SPEED_CONSTANT * difference;
      }
    }

    // Swap the velocity matrices.
    var temp = vel_matrix;
    vel_matrix = temp_matrix;
    temp_matrix = vel_matrix;

    for (var r = 1; r < canvas_height - 1; r++) {
      for (var c = 1; c < canvas_width - 1; c++) {
        // Damp the velocity for each point.
        vel_matrix[r][c] *= DAMPING;

        // Update the position for each point.
        pos_matrix[r][c] += vel_matrix[r][c];
      }
    }
  }

  function draw() {
    // Probably shouldn't tick from draw...
    tick();
    var image = context.createImageData(canvas_width, canvas_height);

    for (var r = 0; r < canvas_height; r++) {
      for (var c = 0; c < canvas_width; c++) {
        var bright = Math.floor(pos_matrix[r][c] * 20);
        var index = 4 * (r * canvas_width + c);
        image.data[index] = bright;
        image.data[index + 1] = bright;
        image.data[index + 2] = bright;
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
  }

  function init() {
    var canvas = document.getElementById('chladni');
    context = canvas.getContext('2d');
    canvas_width = canvas.width;
    canvas_height = canvas.height;
    pos_matrix = createTwoDimArray(canvas_width, canvas_height);
    vel_matrix = createTwoDimArray(canvas_width, canvas_height);
    temp_matrix = createTwoDimArray(canvas_width, canvas_height);
    time = 0;

    setInterval(draw, 20);
  }

  return {
    init: init,
    draw: draw,
    tick: tick,
  };
}();

window.onload = chladni.init;
