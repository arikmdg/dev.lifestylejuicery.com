// http://stackoverflow.com/questions/6491463/accessing-nested-javascript-objects-with-string-key
// Object.resolve("document.body.style.width")
// or
// Object.resolve("style.width", document.body)
// or even use array indexes
// (someObject has been defined in the question)
// Object.resolve("part3.0.size", someObject)
// a safe flag makes Object.resolve return undefined when intermediate
// properties are undefined, rather than throwing a TypeError
// Object.resolve('properties.that.do.not.exist', {hello:'world'}, true)
Object.resolve = function(path, obj, safe) {
  return path.split('.').reduce(function(prev, curr) {
    return !safe ? prev[curr] : (prev ? prev[curr] : undefined);
  }, obj || self);
};

Object.groupBy = function(arr, key) {
  var newArr = [],
    types = {},
    newItem, i, j, cur;
  for (i = 0, j = arr.length; i < j; i++) {
    cur = arr[i];
    if (!(cur[key] in types)) {
      types[cur[key]] = {
        type: cur[key],
        data: []
      };
      newArr.push(types[cur[key]]);
    }
    types[cur[key]].data.push(cur);
  }
  return newArr;
};

Object.resolveOrDefault = function(obj, path, value) {
  var resolved = Object.resolve(path, obj, true);
  return obj ? (resolved ? resolved : value) : value;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({
        toString: null
      }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [],
        prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}