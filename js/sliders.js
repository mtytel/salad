/**
 * thank you, Martin Angelov
 * http://tutorialzine.com/2010/03/colorful-sliders-jquery-css3/
 * http://demo.tutorialzine.com/2010/03/colorful-sliders-jquery-css3/demo.html
 *
 * Adapted only a little by adding options and making it a JQuery function.
 *   $my_slider = $(selector).slider(options)
 *   $my_slider.setSliderPosition(val);
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

      function actual_height($this) {
        return parseFloat($this.css('height')) + parseFloat($this.css('padding-top')) + parseFloat($this.css('padding-bottom')) + parseFloat($this.css('border-top-width')) + parseFloat($this.css('border-bottom-width'));
      }

      function on_drag(e, ui) {
        // 'this' is the slider handle
        if (!this.par) {
          var $this = $(this);
          this.par = $this.parent();
          // min and max possible for ui.position.top
          // this is just how jQueryUI draggable works
          this.min_pos = 1;
          this.max_pos = this.par.height() - actual_height($this) + 1;
        }
        var ratio = 1 - (ui.position.top - this.min_pos) / (this.max_pos - this.min_pos);
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
        var $handle = $this.find('.slider-handle').first();
        var min_pos = 1;
        var max_pos = $this.height() - actual_height($handle) + 1;

        var ratio = 1 - (val - options.min) / (options.max - options.min);
        var pos = min_pos + ratio * (max_pos - min_pos);
        $handle.css({top: pos});
        $this.trigger('change', val);
      }

      return $(this).each(function(){
        var $this = $(this);
        $this.find('.slider-handle').first().draggable({
          containment:'parent',
          axis:'y',
          drag: on_drag,
        });
        $this.setSliderPosition = set_position;
        $this.setSliderPosition(options.start);
      });
    }

  });
})(jQuery, this);
