function loadCSSZ(href, zindex, media) {

  zindex = zindex ? zindex : 0;
  var ref;
  var links = document.getElementsByTagName('link');
  var i = 0;
  for (i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.getAttribute('rel') === 'stylesheet') {
      if (link.getAttribute('href') === href) {
        return;
      }
      // TODO needs to keep below lowest
      if (ref &&
        ref.getAttribute('data-z-index') >
        link.getAttribute('data-z-index')) {
        ref = link;
      } else if (link.getAttribute('data-z-index') &&
        link.getAttribute('data-z-index') > zindex) {
        ref = link;
      }
    }
  }
  var css = loadCSS(href, ref, media);
  css.setAttribute('data-z-index', zindex);
}

function setImagePicker(id, options) {
  requirejs(['image-picker', 'loadcss'], function() {
    //https://rvera.github.io/image-picker/
    loadCSSZ(require.toUrl('vendor/image-picker/0.2.4.x/css/image-picker.css'), 100);
    $(id).imagepicker(options);
  });
}

function setOwlCarousel(id, options) {
  requirejs(['owl-carousel', 'loadcss'], function() {
    loadCSSZ(require.toUrl('vendor/owl-carousel/1.3.3/css/owl.carousel.css'), 100);
    loadCSSZ(require.toUrl('vendor/owl-carousel/1.3.3/css/owl.theme.css'), 200);
    $(id + '-owl-carousel').owlCarousel(options);
  });
}

function addBlend(element) {
  // TODO use relative id from configuration
  var option = $(element).find('option');
  var li = $(element).find('div');
  $('#product-blendsowl').append(option.clone().attr('selected', true).css('display', ''));
  $('#product-blendsowl-list').append(li.clone().css('display', ''));
  return false;
}

function removeBlend(element) {
  var t = $(element);
  $('#product-blendsowl').children().slice(t.index(), t.index() + 1).remove();
  $('#product-blendsowl-list').children().slice(t.index(), t.index() + 1).remove();
}

function setNumber(id, options) {
  //plugin bootstrap minus and plus
  //http://jsfiddle.net/laelitenetwork/puJ6G/
  $('.btn-number').click(function(e) {
    e.preventDefault();

    fieldName = $(this).attr('data-field');
    type = $(this).attr('data-type');
    var input = $('input[name=\'' + fieldName + '\']');
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
      var step = input.attr('step') ? input.attr('step') : 1;
      step = parseInt(step);
      if (type == 'minus') {

        if (currentVal > input.attr('min')) {
          input.val(currentVal - step).change();
        }
        if (parseInt(input.val()) == input.attr('min')) {
          $(this).attr('disabled', true);
        }

      } else if (type == 'plus') {

        if (currentVal < input.attr('max')) {
          input.val(currentVal + step).change();
        }
        if (parseInt(input.val()) == input.attr('max')) {
          $(this).attr('disabled', true);
        }

      }
    } else {
      input.val(0);
    }
    $(this).trigger("waschanged");
  });
  $('.input-number').focusin(function() {
    $(this).data('oldValue', $(this).val());
  });
  $('.input-number').change(function() {

    minValue = parseInt($(this).attr('min'));
    maxValue = parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    step = $(this).attr('step') ? parseInt($(this).attr('step')) : 1;

    name = $(this).attr('name');
    if (valueCurrent >= minValue) {
      $('.btn-number[data-type=\'minus\'][data-field=\'' + name + '\']').removeAttr('disabled');
    } else {
      // alert('Sorry, the minimum value was reached');
      $(this).val($(this).data('oldValue'));
    }
    if (valueCurrent <= maxValue) {
      $('.btn-number[data-type=\'plus\'][data-field=\'' + name + '\']').removeAttr('disabled');
    } else {
      // alert('Sorry, the maximum value was reached');
      $(this).val($(this).data('oldValue'));
    }
    if (valueCurrent % step !== 0) {
      $(this).val($(this).data('oldValue'));
    }

    $(this).trigger("waschanged");

  });
  // $(".input-number").keydown(function(e) {
  //         // Allow: backspace, delete, tab, escape, enter and .
  //         if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
  //              // Allow: Ctrl+A
  //             (e.keyCode == 65 && e.ctrlKey === true) ||
  //              // Allow: home, end, left, right
  //             (e.keyCode >= 35 && e.keyCode <= 39)) {
  //                  // let it happen, don't do anything
  //                  return;
  //         }
  //         // Ensure that it is a number and stop the keypress
  //         if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
  //             e.preventDefault();
  //         }
  //     });

}

function setMap(options) {
  requirejs(['googlemaps'], function() {
    initMap();
  });
}

function setCountry(id, options) {
  requirejs(['image-picker'], function() {
    if (options && options.imagePickerOptions) {
      setImagePicker(id, options.imagePickerOptions);
    }
    $(id)
      .closest('section')
      .toggleClass('hidden', false);
    $(id)
      .on('change', function() {
        resetCountryDependendSelects(this);
      });
    setTimeout(function() {
      resetCountryDependendSelects($(id));
    }, 500);
  });
}

function resetDependendSelects(elem, filterkey, exclude) {
  var $elem = $(elem);
  var $pf = $elem.closest('form');
  var selectedvalue = $elem.val();

  var lookfor = '[data-' + filterkey + ']:not([template])';
  var exludeid = ':not(#' + exclude + ')';

  console.groupCollapsed('resetDependendSelects:' + filterkey);
  $pf.find(lookfor).parent(exludeid).each(function() {
    var $p = $(this);
    var f = $p.data('xfw-filter') || {};
    var de = $p.data('xfw-detached') || [];

    f[filterkey] = selectedvalue;
    console.log($p.attr('id'), filterkey, f);

    $p.find(lookfor).each(function() {
      var $e = $(this);
      var pass = true;
      for (k in f) {
        pass = pass & ($e.data(k) && $e.data(k) === f[k]);
      }
      if (!pass) {
        var $d = $e.detach();
        de.push($d);
        console.log('-', $p.attr('id'), $d.attr('value'));
      }
    });

    de = de.reduce(function(der, elem, index) {
      var $e = $(elem);
      var pass = true;
      for (k in f) {
        pass = pass & ($e.data(k) && $e.data(k) === f[k]);
      }
      if (pass) {
        $p.append($e);
        console.log('+', $p.attr('id'), $e.attr('value'), $e.text());
      } else {
        der.push($e);
      }
      return der;
    }, []);
    $p.data('xfw-detached', de);
    $p.data('xfw-filter', f);

  });
  console.groupEnd();
}

function resetCountryDependendSelects(elem) {

  resetDependendSelects(elem, 'country', 'country');

  var $elem = $(elem);
  var $pf = $elem.closest('form');

  // $elem.append($('#country').data('detached'));

  var po = $elem.data('picker').opts;
  $elem.imagepicker(po);
  $elem.on('change', function() {
    resetCountryDependendSelects(this);
  });

  // TODO workaround
  false && setTimeout(function() {
    $('#product-cleanse').next().find('.active').first().click();
  }, 500);

  // TODO implement promise insted of timeout
  false && setTimeout(function() {
      $pf.find('option[data-country][data-country!="' + country + '"]:selected')
        .prop('selected', false);
      // BUG #product-cleanse enven after switch holds selected even when hidden
      // TODO
      if ($('#product-cleanse').length) {
        $('#product-cleanse option:not([hidden])').first().prop('selected', true);
        var p = $('#product-cleanse').data('picker');
        if (p) {
          p.sync_picker_with_select();
        }
      }
      if ($('#product-blends').length) {
        $('#product-blends option:not([hidden])').first().prop('selected', true);
        var p = $('#product-blends').data('picker');
        if (p) {
          p.sync_picker_with_select();
        }
      }
      // $pf.find('select').each(function() {
      //   var $t = $(this);
      //   var p = $t.data('picker');
      //   if (p) {
      //     p.sync_picker_with_select();
      //   //   var po = p.opts;
      //   //   p.destroy;
      //   //   $t.imagepicker(po);
      //   }
      // });
    },
    250
  );

  console.groupEnd();

}

function setProductJuicing(id, options) {
  requirejs(['image-picker'], function() {
    if (options && options.imagePickerOptions) {
      setImagePicker(id, options.imagePickerOptions);
    }
    $(id)
      .on('change', function() {
        resetProductJuicingDependendSelects(this);
      });
    // setTimeout(function() {
    resetProductJuicingDependendSelects($(id));
    // }, 500);
  });
}

function resetProductJuicingDependendSelects(elem) {

  resetDependendSelects(elem, 'product', 'product-juicing');

  var $elem = $(elem);

  if ($elem.data('picker')) {
    var po = $elem.data('picker').opts;
    $elem.imagepicker(po);
    $elem.on('change', function() {
      resetProductJuicingDependendSelects(this);
    });
  }

}

function doFormatPrice(amount, currency) {
  var price = '';
  currency = currency.toUpperCase();
  switch (currency) {
    case 'THB':
    case 'B':
      price = amount.formatMoney(0) + 'B';
      break;
    case 'RM':
    case 'MYR':
      price = 'RM ' + amount.formatMoney(0);
      break;
  }
  return price;
}

function setProductJuicingPacks(id, options) {
  $(id)
    .on('change', function() {
      var $ts = $(this).find(':selected');
      var price = doFormatPrice($ts.data('unitprice'), $ts.data('currency'));
      $(options.priceElementId).val(price);
    });
}

function setAllergies(options) {
  requirejs(['bootstrapToggle'], function() {
    loadCSSZ(require.toUrl('vendor/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css'));
    //http://www.bootstraptoggle.com/
    $('#toggle-allergies')
      .bootstrapToggle();
    $('#toggle-allergies')
      .change(function() {
        if ($(this)
          .prop('checked')) {
          $('#allergies')
            .val('')
            .prop('disabled', false)
            .prop('required', true);
          // document.getElementById('allergies').disabled = false;
          // document.getElementById('allergies').required = true;
        } else {
          $('#allergies')
            .val($('#allergies')
              .data('no-allergies'))
            .prop('disabled', true)
            .prop('required', false);
          // document.getElementById('allergies').disabled = true;
          // document.getElementById('allergies').required = false;
        }
      });
  });
}

function setUnorderedList(id, options) {
  console.debug('function setUnorderedList(id, options)', arguments);
}

// TODO options set dependent on
function setPrice(id, options) {
  console.debug(['function setPrice(id, options)', arguments]);
  switch (id) {
    case '#price-cleanse':
      setPriceCleanse(id, options);
      break;
    case '#price-blends':
      setPriceBlends(id, options);
      break;
  }
}

function setPriceCleanse(id, options) {
  var $pe = $(id);
  var $c = $('country'.ensurePrefix('#'));
  var $pce = $('product-cleanse'.ensurePrefix('#'));
  var $dce = $('duration-cleanse'.ensurePrefix('#'));
  var $gse = $('groupsize'.ensurePrefix('#'));
  $c.on("waschanged", function(event) {
    // console.debug('product-cleanse', event, $pce.val());
    calcPriceCleanse($pe, $pce, $dce, $gse);
  });
  $pce.on("waschanged", function(event) {
    // console.debug('product-cleanse', event, $pce.val());
    calcPriceCleanse($pe, $pce, $dce, $gse);
  });
  $dce.on("waschanged", function(event) {
    // console.debug('duration-cleanse', event, $dce.val());
    calcPriceCleanse($pe, $pce, $dce, $gse);
  });
  $gse.on("waschanged", function(event) {
    // console.debug('groupsize', event, $gse.val());
    calcPriceCleanse($pe, $pce, $dce, $gse);
  });
}

function calcPriceCleanse(pe, pce, dce, gse) {
  // console.debug(pce.val(), dce.val(), gse.val());
  var duration = parseInt(dce.val());
  var groupsize = parseInt(gse.val());
  var price = 0;
  var currency = '';
  var x = document.getElementById("product-cleanse").options[document.getElementById("product-cleanse").selectedIndex];
  var po = xfw.form.config.data.price.cleanse.filter(function(elem) {
    return elem['data-country'] === x.getAttribute('data-country'); //pce.val(); 
  }).filter(function(elem) {
    return elem['data-product'] === x.getAttribute('data-product'); //pce.val(); 
  }).map(function(elem) {
    if (parseInt(elem['data-duration']) <= duration) {
      price = parseInt(elem['data-unitprice']);
      currency = elem['data-currency'];
    }
    // if (parseInt(elem['data-duration']) < duration) {
    //   price = parseInt(elem['data-unitprice']);
    //   price = parseInt(elem['data-unitprice']);
    // }
  });

  var sum = duration * groupsize * price;
  if (sum && sum !== 0) {
    pe.val(doFormatPrice(sum, currency));
  } else {
    pe.val('');
  }
}

function setGroup(options) {
  requirejs(['bootstrapToggle'], function() {
    loadCSSZ(require.toUrl('vendor/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css'));
    //http://www.bootstraptoggle.com/
    var $tge = $('#toggle-group');
    var $gse = $('#groupsize');

    $tge.bootstrapToggle();
    $gse.closest('div.row').hide();
    $tge.change(function() {
      if ($(this)
        .prop('checked')) {
        $gse.val($gse.data('group-on'))
          .prop('hidden', false)
          .prop('required', true)
          .closest('div.row').show();
      } else {
        $gse.val($gse.data('group-off'))
          .prop('hidden', true)
          .prop('required', false)
          .closest('div.row').hide();
      }
      $gse.trigger('waschanged');
    });
  });
}

function setDeliverySchedule(options) {
  requirejs(['bootstrapToggle'], function() {
    loadCSSZ(require.toUrl('vendor/bootstrap-toggle/2.2.2/css/bootstrap-toggle.min.css'));
    //http://www.bootstraptoggle.com/
    var $te = $('#toggle-deliveryschedule');

    $te.bootstrapToggle();
    $('#deliveryschedule')
      .closest('div.row').hide();
    $te.change(function() {
      if ($(this)
        .prop('checked')) {
        $('#deliveryschedule')
          .val($('#deliveryschedule')
            .data('deliveryschedule-on'))
          .prop('hidden', false)
          .prop('required', true)
          .closest('div.row').show();
      } else {
        $('#deliveryschedule')
          .val($('#deliveryschedule')
            .data('deliveryschedule-off'))
          .prop('hidden', true)
          .prop('required', false)
          .closest('div.row').hide();
      }
    });
  });
}

function setExistingUser(options) {
  $('#toggle-existing-user')
    .bootstrapToggle();
}

function setRefferer(options) {

  var selector = Object.resolveOrDefault(options,
    'options.selector',
    '#Refferer');
  $(selector)
    .val(document.referrer);
}

function setGeoIP() {
  console.time('loadGeoIP');
  // Preset location
  // TODO: implement own maxmind lookup for countries as others either tiomeout or are blocked
  var url = 'https://freegeoip.net/json/';
  xfw.proxyUrl && (url = xfw.proxyUrl + url);
  $.getJSON(url, function(data) {
    console.debug(['$.getJSON(url, function(data) {', url, data]);
    geoip = data;
    $('#geoip')
      .val(JSON.stringify(geoip, null, 2));
    console.timeEnd('loadGeoIP');
  });
}

function setFormType() {
  $('#formtype')
    .val(window.xfw.form.options.formType);
}

function setFormOptions() {
  $('#formoptions')
    .val(JSON.stringify(window.xfw.form.options));
}

function toggleHidden() {
  $('input[type="hidden"]')
    .attr('type', 'text');
}

var map;
var marker;

function initMap() {
  var myOptions = {
    zoom: 14,
    center: new google.maps.LatLng(13.736535, 100.587496),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('gmap_canvas'), myOptions);
  marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(13.736535, 100.587496)
  });
  // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
  infowindow = new google.maps.InfoWindow({
    content: '<b>address</b>'
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
  // infowindow.open(map, marker);
  // This event listener will call addMarker() when the map is clicked.

  getAddress();

  $('#gmap-init-position')
    .click(function() {
      setPosition();
    });
  $('#gmap-init-address')
    .click(function() {
      //TODO
      var address = getAddress();
      geocodeAddress(address);

    });

  $('#gmap-init-click')
    .click(function() {
      map.addListener('click', function(event) {
        setMarker(event.latLng);
      });
    });
}
// google.maps.event.addDomListener(window, 'load', init_map);

//getAddress();
function getAddress() {

  var aparts = [
    $('#buildingname')
    .val(),
    $('#street')
    .val(),
    $('#streetaddressdetail')
    .val(),
    $('#city option:selected')
    .val(),
    $('#country option:selected')
    .val()
  ];
  var address = aparts.filter(function(elem) {
      return elem !== '';
    })
    .join(' ');
  $('#address')
    .val(address);
  $('#gmap-init-address span.address')
    .text(address);
  return address;
}

// Adds a marker to the map and push to the array.
function setMarker(location) {
  marker.position = location;
  marker.setMap(map);
  $('#gmap-location')
    .text(JSON.stringify(location));
  // map.setCenter(location);
}

//https://developers.google.com/maps/documentation/javascript/examples/geocoding-simple
function geocodeAddress(address) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({
    'address': address
  }, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var location = results[0].geometry.location;
      setMarker(location);
      map.setCenter(location);
      return location;
    } else {
      console.log('Geocode was not successful for the following reason: ' +
        status);
      return undefined;
    }
  });
}

//https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
function setPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.warn('navigator.geolocation not supported.');
  }
}

function showPosition(position) {

  var location = new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude);
  setMarker(location);
  map.setCenter(location);
}

function setRangeCalendar(id, options) {
  requirejs([
    'assets/rangecalendar/js/jquery.rangecalendar',
    'assets/moment.js/2.7.0/moment-with-langs.min',
    'assets/jqueryui/1.11.0/js/jquery-ui.min',
    'loadcss'
  ], function() {

    loadCSSZ(require.toUrl('vendor/rangecalendar/css/rangecalendar.css', 1));
    loadCSSZ(require.toUrl('vendor/rangecalendar/css/style.css', 2));

    var newDate = moment()
      .add('days', 1);
    console.log(newDate);
    var defaultCalendar = $(id)
      .rangeCalendar()
      .setStartDate(newDate);

    $('#setDateBt')
      .click(function() {
        var newDate = moment()
          .add('days', 1);
        rangeCalendar.setStartDate(newDate);

        rangeCalendar.update();
      });

    $('#addMonthBt')
      .click(function() {

        var newDate = moment()
          .add('months', 1);
        rangeCalendar.setStartDate(newDate);
      });

    var callbackRangeCalendar = $(id)
      .rangeCalendar({
        changeRangeCallback: rangeChanged,
        weekends: true,
        minRangeWidth: 2,
        start: '+2',
        startRangeWidth: 6,
      });

    function rangeChanged(target, range) {

      console.log(range);
      var startDay = moment(range.start)
        .format('DD');
      var startMonth = moment(range.start)
        .format('MMM');
      var startYear = moment(range.start)
        .format('YY');
      var endDay = moment(range.end)
        .format('DD');
      var endMonth = moment(range.end)
        .format('MMM');
      var endYear = moment(range.end)
        .format('YY');

      $('.calendar-values .start-date .value')
        .html(startDay);
      $('.calendar-values .start-date .label')
        .html('');
      $('.calendar-values .start-date .label')
        .append(startMonth);
      $('.calendar-values .start-date .label')
        .append('<small>' + startYear + '</small>');
      $('.calendar-values .end-date .value')
        .html(endDay);
      $('.calendar-values .end-date .label')
        .html('');
      $('.calendar-values .end-date .label')
        .append(endMonth);
      $('.calendar-values .end-date .label')
        .append('<small>' + endYear + '</small>');
      $('.calendar-values .days-width .value')
        .html(range.width);
      $('.calendar-values .from-now .value')
        .html(range.fromNow);

    }
  });
}

var request;

function setFormSubmit(id, options) {
  console.debug('setFormSubmit', arguments);
  // bind to the submit event of our form
  var feid = '#' + xfw.form.options.formElementId;
  var submiturl = xfw.form.options.submitUrl;
  // TODO fix proxy to repost parameters via get/post
  // TODO use library for adding parameters in url with proper encoding etc
  false && window.xfw.proxyUrl && (submiturl = xfw.proxyUrl + xfw.form.options.submitUrl);
  $(feid)
    .submit(function(event) {
      // abort any pending request
      if (request) {
        request.abort();
      }

      console.time('submit');
      // setup some local variables
      var $form = $(this);
      // let's select and cache all the fields
      var $inputs = $form.find('input, select, button, textarea');

      // serialize the data in the form
      var serializedData = $form.serialize();
      // add to serialized data text of values of seleted options
      serializedData += $form.find('option:selected').map(function(opt) {
        var $t = $(this);
        return $t.parent().attr('name') + '--Text=' + $t.text();
      }).get().reduce(function(result, current) {
        result += '&' + current;
        return result;
      }, '');

      // let's disable the inputs for the duration of the ajax request
      // Note: we disable elements AFTER the form data has been serialized.
      // Disabled form elements will not be serialized.
      $inputs.prop('disabled', true);
      $('#result').html(options.SendingText);

      request = $.ajax({
        url: submiturl,
        crossDomain: true,
        cache: false,
        dataType: 'jsonp',
        contentType: 'text/plain',
        data: serializedData,
        type: 'post',
        method: 'post',

        // url: submiturl,
        // type: 'post',
        // crossDomain: true,
        // cache: false,
        // dataType: 'jsonp',
        // data: serializedData,
        // cache: false
        // contentType: 'text/plain',
        // success: function() {
        //   debug('loadConfig success', arguments);
        // },
        // error: function() {
        //   debug('loadConfig error', arguments);
        // }
      });

      // request = $.ajax({
      //   url: submiturl,
      //   type: 'post',
      //   data: serializedData
      // });
      // callback handler that will be called on success
      request.done(function(response, textStatus, jqXHR) {
        // log a message to the console
        $('#result').html(options.SuccessText);
        console.timeEnd('submit');
      });
      // callback handler that will be called on failure
      request.fail(function(jqXHR, textStatus, errorThrown) {
        // log the error to the console
        console.error(
          'The following error occured: ' +
          textStatus, errorThrown
        );
        $('#result').html(options.ErrorText);
        // reenable the inputs
        $inputs.prop('disabled', false);
      });
      // callback handler that will be called regardless
      // if the request failed or succeeded
      request.always(function() {
        // reenable the inputs
        // $inputs.prop('disabled', false);
      });
      // prevent default posting of form
      event.preventDefault();
    });
}