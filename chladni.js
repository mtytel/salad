/**
 * Salad: javascript waves, resonance and Chladni figures.
 *
 * Copyright (c) 2013
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */

var chladni = function() {
  // Damping consistently puts friction on all waving points.
  var DAMPING = 1.0;
  // Speed constant somehow defines speed of waves. Not sure on relationship.
  var SPEED_CONSTANT = 1.0;
  // Amplitude on the sine wave input equation
  var SIN_AMP = 5.0;
  // Influences frequency on sine wave input equation
  var SIN_DEN = 8.0;

  function setDamping(x) {
    DAMPING = x;
  }
  function setSpeed(x) {
    SPEED_CONSTANT = x;
  }
  function setSinAmp(x) {
    SIN_AMP = x;
  }
  function setSinDen(x) {
    SIN_DEN = x;
  }

  // Store the width and height so we don't have to access the DOM later.
  var canvas_width = 0, canvas_height = 0;
  var context = null;
  var image = null;
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
    // Update the input equation.
    var val = SIN_AMP * Math.sin(time / SIN_DEN);
    for (var i = 0; i < canvas_width; i++) {
      pos_matrix[0][i] = val;
      pos_matrix[canvas_height - 1][i] = val;
    }
    for (var i = 0; i < canvas_height; i++) {
      pos_matrix[i][0] = val;
      pos_matrix[i][canvas_width - 1] = val;
    }
    time++;

    // Wave equation! Give an acceleration based on neighboring points.
    for (var r = 1; r < canvas_height - 1; r++) {
      for (var c = 1; c < canvas_width - 1; c++) {
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

        // Update the image so it's ready to draw if we need.
        var bright = Math.floor(pos_matrix[r][c] * 20);
        var index = 4 * (r * canvas_width + c);
        image.data[index] = bright;
        image.data[index + 1] = bright;
        image.data[index + 2] = bright;
        image.data[index + 3] = 255;
      }
    }
  }

  function draw() {
    context.putImageData(image, 0, 0);
    window.requestAnimationFrame(draw);
  }

  function init_canvas() {
    var canvas = document.getElementById('chladni');
    context = canvas.getContext('2d');
    canvas_width = canvas.width;
    canvas_height = canvas.height;

    // reset the canvas
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, canvas_width, canvas_height);
    image = context.createImageData(canvas_width, canvas_height);
    pos_matrix = createTwoDimArray(canvas_width, canvas_height);
    vel_matrix = createTwoDimArray(canvas_width, canvas_height);
    temp_matrix = createTwoDimArray(canvas_width, canvas_height);
    time = 0;

    setInterval(tick, 20);
    draw();
  }

  function init_page() {
     $('#reset').on('click', function() {
       init_canvas();
     });
     function get_check_set_redraw(f) {
       return function() {
         var x = parseFloat($(this).val());
         if (!isNaN(x)) {
           f(x);
         }
       };
     }
     $('#sin-amp').on('change', get_check_set_redraw(setSinAmp));
     $('#freq-k').on('change', get_check_set_redraw(setSinDen));
     $('#damping-k').on('change', get_check_set_redraw(setDamping));
     init_canvas();
  }

  return {
    init_canvas: init_canvas,
    init_page: init_page,
    draw: draw,
    tick: tick,
  };
}();

window.onload = chladni.init_page;
