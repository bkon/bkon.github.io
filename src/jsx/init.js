var $ = require("jquery");

var settings = {
  // Parallax background effect?
  parallax: true,

  // Parallax factor (lower = more intense, higher = less intense).
  parallaxFactor: 20
};

$(function() {
  var $window = $(window);
  var $body = $('body');
  var $header = $('#header');

  // Parallax background.
  $header.css('background-position', 'left 0px');
  $window.on('scroll.strata_parallax', function() {
    $header.css('background-position', 'left ' + (-1 * (parseInt($window.scrollTop()) / settings.parallaxFactor)) + 'px');
  });
});
