define('form/main', [
  'extensions/object',
  'extensions/number',
  'extensions/string',
  'loadcss',
  'handlebars',
  'text',
  'underscore',
  'form/helpers',
  'text!form/templates.html',
], function() {
  console.debug('form/main');

  /*   define(['dep1', 'dep2', 'dep3'], function (dep1, dep2, dep3) {
      var module = {
          ...
      };
      return module;
  });
    define(['dep1', 'dep2', 'dep3'], function (dep1, dep2, dep3) {
      var module = {
          ...
      };
      var init = function (options) {
          // Initialize here
          return module;
      };
      return init;
  });*/

  // INFO requires 'text!./form/templates.html' as last require
  var hbtemplates = $.parseHTML(arguments[arguments.length - 1]);
  loadCSSZ(require.toUrl('form/custom.css'), 1000);

  (function(window, undefined) {
    window.xfw = window.xfw || {};
    var FormObject = function() {
      var FORM = this;
      var opt = {
        postMessageToParrentOnLoad: false,
        debug: false,
        stepping: false,
        reporting: true,
      };
      var conf;
      var fom;

      var debug = function(args) {
        opt.debug && console.debug(arguments);
      };

      var stepping = function(func, params, name) {
        if (opt.stepping) {
          FORM.debug = FORM.debug || {};
          FORM.debug.nextstep = window.xfw.nextstep = {
            'name': name,
            'run': function() {
              func.apply(this, params);
            }
          };
          console.log('stepping processing activated > next step object:', FORM.debug.nextstep);
        } else {
          func.apply(this, params);
        }
      };

      var $getelement = function(id) {

      };

      FORM.reportProgress = function(str) {
        fom.formLoadingElement = fom.formLoadingElement ||
          $(opt.formElementId.ensurePrefix('#')).find('.loading-progress-text').first();
        fom.formLoadingElement.html(str);
      };

      FORM.hideProgress = function() {
        $(opt.formElementId.ensurePrefix('#')).find('.loading-progress').first().hide();
      };

      FORM.doInit = function(options) {
        fom = {};
        opt = FORM.options = _.extend(opt, options);
        (location.hash === '#debug') && (opt.debug = true);
        (location.hash === '#stepping') && (opt.stepping = opt.debug = true);
        debug('FORM.init(options)', arguments);
        FORM.reportProgress('initializing');
        // TODO use library for adding parameters in url with proper encoding etc
        opt.proxyUrl && (window.xfw.proxyUrl = opt.proxyUrl) && (opt.configUrl = opt.proxyUrl + opt.configUrl);
        stepping(FORM.loadConfig, [opt.configUrl, FORM.processResponse]);
      };

      FORM.loadConfig = function(url, callback) {
        debug('FORM.loadConfig(url)', arguments);
        FORM.reportProgress('loading configuration');
        console.time('loadConfig');
        $.ajax({
            url: url,
            crossDomain: true,
            cache: true,
            dataType: 'jsonp',
            contentType: 'text/plain',
            success: function() {
              debug('loadConfig success', arguments);
              callback(arguments[0]);
            },
            error: function() {
              debug('loadConfig error', arguments);
            }
          }).done(function() {
            debug('loadConfig done', arguments);
          }).complete(function() {
            debug('loadConfig complete', arguments);
            console.timeEnd('loadConfig');
          })
      };

      FORM.processResponse = function(response) {
        debug('FORM.processResponse(response)', arguments);
        FORM.reportProgress('processing response');
        if (response && response.result && response.result === 'success') {
          FORM.config = conf = response.data;
          stepping(FORM.processConfig, conf);
        }
      };

      FORM.processConfig = function(config) {
        debug('FORM.processConfig(config)', arguments);
        FORM.reportProgress('processing configuration');
        console.time('formgen');
        var conf = config ? config : FORM.config;
        var model = conf.model;
        var data = conf.data;
        var layout = conf.layout;
        var form = conf.form = {};
        var templates = conf.templates = {};

        //resolve data from data.key.values
        data.key.value.map(function(kv) {
          data[kv.key.toLowerCase()] = kv.value.split('|')
            .map(function(elem) {
              var selem = elem.split('=');
              if (selem.length == 1) {
                return elem;
              } else {
                return {
                  'value': selem[0],
                  'text': selem[1]
                };
              }
            });
        });

        //resolve model.data.values from data
        //JSON.parse model.data.options
        model.data.map(function(dm) {
          if (dm.values) {
            var resolved = Object.resolve(dm.values.toLowerCase(), conf);
            if (resolved) {
              dm.values = resolved;
              //resolve data attributes
              resolved.map(function(elem) {
                if (elem !== null && typeof elem === 'object') {
                  var dataElemNames = Object.getOwnPropertyNames(elem)
                    .filter(function(elemf) {
                      if (elemf.startsWith('data')) {
                        return true;
                      };
                    });
                  if (dataElemNames.length > 0) {
                    //assign data attributes objects to elem.data
                    elem.data = dataElemNames.map(function(elemm) {
                      return {
                        'name': elemm,
                        'value': elem[elemm]
                      };
                    });
                  };
                }
              });
            };
          };
          if (dm.options) {
            dm.options = JSON.parse(dm.options);
          };
        });

        //transform model and data into elements
        model.elements = {};
        model.data.map(function(elem) {
          model.elements[elem.id] = elem;
        });

        //transform sections
        // form.sections = Object.groupBy(
        //   Object.resolve(opt.formLayout, layout), 'section');
        form.sections = Object.resolve(opt.formLayout, layout);

        stepping(FORM.generateForm);

      };

      FORM.generateForm = function(config) {
        var conf = config ? config : FORM.config;
        var form = conf.form;
        var model = conf.model;
        var templates = conf.templates;

        //TODO preload images defined in data model
        //compile templates

        FORM.reportProgress('generating form');
        var Handlebars = require('handlebars')
          .default;

        console.time('Handlebars.compile');
        $(hbtemplates)
          .each(function(elem) {
            if ($(this).attr('id')) {
              templates[$(this)
                .attr('id')] = Handlebars.compile($(this)
                .html());
            } else if ($(this).attr('partial')) {
              Handlebars.registerPartial(
                $(this).attr('partial'),
                $(this).html()
              );
            }
          });
        console.timeEnd('Handlebars.compile');

        // $('script[type="text/x-handlebars-template"]', $(hbtemplates)).each(function(elem) {
        //   templates[$(this).attr('id')] = Handlebars.compile($(this).html());
        // });

        FORM.graph = {
          'type': 'graph type',
          'label': 'graph label',
          'metadata': {
            'user-defined': 'values'
          },
          'nodes': [{
            'id': opt.formElementId,
            'type': 'element',
            'label': opt.formElementId,
            'metadata': {
              'user-defined': 'values'
            }
          }],
          'edges': [{
            'source': '0',
            'relation': 'edge relationship',
            'target': '1',
            'directed': true,
            'label': 'edge label',
            'metadata': {
              'user-defined': 'values'
            }
          }]

        };

        // fds.nodes.push()

        var DocumentHelper = function() {

          var elements = {};

          // function Car( model, year, miles ) {
          //   this.model = model;
          //   var civic = new Car( "Honda Civic",
          var Element = function() {

            var element;

            var create = function(tagName) {
              if (elements[tagName]) {
                element = elements[tagName].cloneNode();
              } else {
                element = elements[tagName] = document.createElement(tagName);
              }
              return this;
            };

            var id = function(value) {
              element.setAttribute('id', value);
              return this;
            };

            var cls = function(value) {
              element.setAttribute('class', value);
              return this;
            };

            var html = function(value) {
              element.innerHTML = value;
              return this;
            };

            var node = function() {
              return element;
            };

            return {
              create: create,
              id: id,
              cls: cls,
              html: html,
              node: node
            };

          };

          return {
            el: new Element()
          };

        };

        var dh = new DocumentHelper();

        var parentelements = {};
        var parentelement = function(id) {
          !parentelements[id] && debug('parentelement', id);
          !parentelements[id] && (parentelements[id] = document.getElementById(id));
          return parentelements[id];
        };

        form.sections.map(function(elem) {
          var parent = parentelement(elem.parentid);
          !parent && console.error('no existing parent element', elem.parentid);
          if (elem.element) {
            // creates node or return if it's already node
            var createNode = function(receipt, id) {
              if (!receipt.nodeType) {
                var r = receipt.split('.');
                var elti = r.shift().split('#'); // type#id
                var elt = elti.shift();
                var eli = elti.shift(); // empty if type# or undefined if type
                var node = dh.el.create(elt);
                eli && (node.id(eli));
                eli === '' && (node.id(id));
                r.join(' ') && node.cls(r.join(' '));
                receipt = node.node();
              }
              return receipt;
            };
            var e = elem.element.split('/').reduce(function(res, curr) {
              res = createNode(res, elem.id);
              if (curr) {
                curr = createNode(curr, elem.id);
                res.appendChild(curr);
              }
              return res;
            });
            parent.appendChild(createNode(e, elem.id));
          } else if (elem.template) {
            var me = Object.resolve(elem.id, model.elements);
            if (me && elem.template) {
              // var f = document.createElement('div');
              // f.innerHTML = templates[elem.template](me);
              // parent.appendChild(f);
              parent.innerHTML += templates[elem.template](me);
            } else {
              !me && console.warn('%s wasn\'t resolved in model elements', elem.id);
              !elem.template && console.warn('%s doesn\'t have defined template id to render', elem.id);
            }
          }
        });

        // var elform = document.getElementById(opt.formElementId);
        // //TODO: switch to htmlbars as they work with dom instead of string
        // false && form.sections.map(function(elem) {
        //   var html = '';
        //   console.time('section templates');
        //   var elems = elem.data.map(function(elemm) {
        //     var me = Object.resolve(elemm.id, model.elements);
        //     if (me && elemm.template) {
        //       html += templates[elemm.template](me);
        //     } else {
        //       !me && console.warn('%s wasn\'t resolved in model elements', elemm.id);
        //       !elemm.template && console.warn('%s doesn\'t have defined template id to render', elemm.id);
        //     }
        //   });
        //   console.timeEnd('section templates');
        //   console.time('section dh');
        //   var section = dh.el.create('section').id(elem.type).node();
        //   var div = dh.el.create('div').cls('container').html(html).node();
        //   section.appendChild(div);
        //   elform.appendChild(section);
        //   console.timeEnd('section dh');
        // });
        console.timeEnd('formgen');
        stepping(FORM.extendForm);
      };

      FORM.extendForm = function(config) {
        var conf = config ? config : FORM.config;
        var form = conf.form;
        var model = conf.model;
        var templates = conf.templates;

        FORM.reportProgress('extending form');
        //eval functions
        console.time('functions');

        // form.sections.map(function(elem) {
        form.sections.map(function(elemm) {
          var me = Object.resolve(elemm.id, model.elements);
          if (me && me.function) {
            var options = me.options;
            eval(me.function);
            debug(me.function, options);
          };
        });
        // });

        false && form.sections.map(function(elem) {
          elem.data.map(function(elemm) {
            var me = Object.resolve(elemm.id, model.elements);
            if (me && me.function) {
              var options = me.options;
              eval(me.function);
              debug(me.function, options);
            };
          });
        });
        console.timeEnd('functions');

        // setFormSubmit(document.getElementById(opt.formElementId));

        FORM.hideProgress();

      };
    };
    window.xfw.form = new FormObject();
  })(this);
});