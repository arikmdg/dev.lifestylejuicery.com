define('form',
[
  'common'
], function() {
  console.debug('form define');
  require([
    'form/main',
  ], function() {
    console.debug('form require');
    (typeof window.xfwInitForm === 'function') && window.xfwInitForm();
  });
});
