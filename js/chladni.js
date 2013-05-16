/**
 * Salad: javascript waves, resonance and Chladni figures.
 *
 * Copyright (c) 2013
 * Under MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */

var chladni = function() {
  // Speed constant somehow defines speed of waves. Not sure on relationship.
  var SPEED_CONSTANT = 1.0;
  // The polynomial scale of the damping slide.
  var DAMPING_SCALE = 6;

  // Damping consistently puts friction on all waving points.
  var damping_ = 1.0;
  // Amplitude on the sine wave input equation
  var amplitude_ = 5.0;
  // Influences frequency on sine wave input equation
  var frequency_ = 1.0 / 15.0;
  // Store the width and height so we don't have to access the DOM later.
  var canvas_width_ = 0, canvas_height_ = 0;
  var chladni_coloring_ = true;
  var context_ = null;
  var image_ = null;
  var pos_matrix_ = null;
  var vel_matrix_ = null;
  var temp_matrix_ = null;
  var time_ = 0;

  function setDamping(damping) {
    damping_ = damping;
  }
  function setAmplitude(amplitude) {
    amplitude_ = amplitude;
  }
  function setFrequency(frequency) {
    frequency_ = frequency;
  }

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
    var val = amplitude_ * Math.sin(time_ * frequency_);
    for (var i = 0; i < canvas_width_; i++) {
      pos_matrix_[0][i] = val;
      pos_matrix_[canvas_height_ - 1][i] = val;
    }
    for (var i = 0; i < canvas_height_; i++) {
      pos_matrix_[i][0] = val;
      pos_matrix_[i][canvas_width_ - 1] = val;
    }
    time_++;

    // Wave equation! Give an acceleration based on neighboring points.
    for (var r = 1; r < canvas_height_ - 1; r++) {
      for (var c = 1; c < canvas_width_ - 1; c++) {
        var neighbor_sum = pos_matrix_[r - 1][c] + pos_matrix_[r + 1][c] +
                           pos_matrix_[r][c - 1] + pos_matrix_[r][c + 1];
        var difference = pos_matrix_[r][c] - neighbor_sum / 4.0;
        temp_matrix_[r][c] = vel_matrix_[r][c] - SPEED_CONSTANT * difference;
      }
    }

    // Swap the velocity matrices.
    var temp = vel_matrix_;
    vel_matrix_ = temp_matrix_;
    temp_matrix_ = vel_matrix_;

    for (var r = 1; r < canvas_height_ - 1; r++) {
      for (var c = 1; c < canvas_width_ - 1; c++) {
        // Damp the velocity for each point.
        vel_matrix_[r][c] *= damping_;

        // Update the position for each point.
        pos_matrix_[r][c] += vel_matrix_[r][c];

        // Update the image_ so it's ready to draw if we need.
        var brightness = 0;
        if (chladni_coloring_) {
          var scaled_velocity = vel_matrix_[r][c] / frequency_;
          brightness = 255 - (pos_matrix_[r][c] * pos_matrix_[r][c] + scaled_velocity * scaled_velocity);
        }
        else
          brightness = Math.floor(pos_matrix_[r][c] * 20);
        var index = 4 * (r * canvas_width_ + c);
        image_.data[index] = brightness;
        image_.data[index + 1] = brightness;
        image_.data[index + 2] = brightness;
        image_.data[index + 3] = 255;
      }
    }
  }

  function draw() {
    context_.putImageData(image_, 0, 0);
    window.requestAnimationFrame(draw);
  }

  function initCanvas() {
    var canvas = document.getElementById('chladni');
    context_ = canvas.getContext('2d');
    canvas_width_ = canvas.width;
    canvas_height_ = canvas.height;

    // reset the canvas
    image_ = context_.createImageData(canvas_width_, canvas_height_);
    pos_matrix_ = createTwoDimArray(canvas_width_, canvas_height_);
    vel_matrix_ = createTwoDimArray(canvas_width_, canvas_height_);
    temp_matrix_ = createTwoDimArray(canvas_width_, canvas_height_);
    time_ = 0;

    setInterval(tick, 20);
    draw();
  }

  function initPage() {
    $('#reset').on('click', initCanvas);
    $('#position').on('click', function() {
      chladni_coloring_ = false;
      $('#position').addClass('pressed');
      $('#stillness').removeClass('pressed');
    });
    $('#stillness').on('click', function() {
      chladni_coloring_ = true;
      $('#stillness').addClass('pressed');
      $('#position').removeClass('pressed');
    });
    if (chladni_coloring_)
      $('#stillness').addClass('pressed');
    else
      $('#position').addClass('pressed');

    $('#amplitude')
      .slider({min: 0, max: 10, start: amplitude_})
      .on('change', function(ev, val) {
        setAmplitude(val);
      });
    $('#frequency')
      .slider({min: .01, max: .5, start: frequency_})
      .on('change', function(ev, val) {
        setFrequency(val);
      });
    $('#damping')
      .slider({min: 0, max: 1, start: Math.pow(1 - damping_, 1 / DAMPING_SCALE)})
      .on('change', function(ev, val) {
        setDamping(1 - Math.pow(val, DAMPING_SCALE));
      });
    initCanvas();
  }

  return {
    initCanvas: initCanvas,
    initPage: initPage,
    draw: draw,
    tick: tick,
  };
}();

window.onload = chladni.initPage;
