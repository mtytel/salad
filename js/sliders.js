/**
 * thank you, Martin Angelov
 * http://tutorialzine.com/2010/03/colorful-sliders-jquery-css3/
 * http://demo.tutorialzine.com/2010/03/colorful-sliders-jquery-css3/demo.html
 *
 * Adapted only a little by adding options and making it a JQuery function.
 *   $my_slider = $(selector).slider(options)
 *   $my_slider.setPosition(val);
 */

(function($, window) {
  $.fn.extend({

    slider: function(o) {
      var options = $.extend({}, {
        min: 0,
        max: 1,
        start: 0.5,
        step: null,
      }, o);

      function on_drag(e, ui) {
        // 'this' is the slider handle
        if (!this.par) {
          this.par = $(this).parent();
          this.parHeight = this.par.height();
          this.height = $(this).height();
        }
        var ratio = 1 - (ui.position.top + this.height) / this.parHeight;
        var val = options.min + ratio * (options.max - options.min);
        if (options.step) {
          val = options.min + Math.floor((val - options.min) / options.step) * options.step;
        }
        this.par.trigger('change', val);
      }

      function set_position(val) {
        // 'this' is the slider track
        if (val < options.min || val > options.max) {
          return;
        }
        var $this = $(this);
        var ratio = (val - options.min) / (options.max - options.min);
        var $handle = $this.find('.slider-handle').first();
        $handle.css({top: (1 - ratio) * $this.height() - $handle.height()});
        $this.trigger('change', val);
      }

      return $(this).each(function(){
        var $this = $(this);
        $this.find('.slider-handle').first().draggable({
          containment:'parent',
          axis:'y',
          drag: on_drag,
        });
        $this.setPosition = set_position;
        $this.setPosition(options.start);
      });
    }

  });
})(jQuery, this);
