requirejs.config({
  urlArgs: 'xfw=0.4',
  baseUrl: './xfw',
  paths: {
    'bootstrap': 'vendor/bootstrap/js/bootstrap.min',
    'bootstrapToggle': 'vendor/bootstrap-toggle/2.2.2/js/bootstrap-toggle.min',
    'googlemaps': 'https://maps.googleapis.com/maps/api/js?v=3.exp',
    'handlebars': 'vendor/handlebars.js/handlebars.amd.min',
    'image-picker': 'vendor/image-picker/0.2.4.x/js/image-picker',
    'jquery': 'vendor/jquery/jquery-1.12.3.min',
    'loadcss': 'vendor/loadcss/loadCSS',
    'owl-carousel': 'vendor/owl-carousel/1.3.3/js/owl.carousel',
    'text': 'vendor/require/text',
    'underscore': 'vendor/underscore/1.8.3/underscore',
  },
  'shim': {
    'bootstrap': ['jquery'],
    'bootstrapToggle': ['bootstrap'],
    'image-picker': ['jquery'],
    'owl-carousel': ['jquery'],
  },
});

define('common', [
  'jquery',
  'underscore',
], function() {
  console.debug('common define');
  window.xfw = window.xfw || {};
});
