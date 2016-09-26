/*
 * Name: utils.js
 * Description: brain utilities
 * Dependencies: jquery, lodash, jquery-bindable, lodash-inflection
 * 
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-09-26
 *
 * Notes: 
 *
 *
 */

define([
  'jquery',
  'lodash',
  'jquery-bindable',
  'lodash-inflection'
],function($, _) {
  var utils = {

    // base object for spitting things out.
    base: {

      augment: function(obj) {
        return $.extend(this, obj);
      }, // augment

      config: function(config) {
        return $.extend(true, this, config);
      }, // config

      create: function(config) {
        return $.extend(Object.create(this), config);
      }, // create

      doAfter: function(methodName, advice) {
        var method = this[methodName] || function() {};
        function wrap() {
          var that = method.apply(this, arguments);
          advice.apply(this, arguments);
          return that;
        }
        this[methodName] = wrap;
      }, // doAfter

      doBefore: function(methodName, advice) {
        var method = this[methodName] || function() {};
        function wrap() {
          advice.apply(this, arguments);
          var that = method.apply(this, arguments);
          return that;
        }
        this[methodName] = wrap;
      }, // doBefore

      getParent: function() {
        return Object.getPrototypeOf(this);
      }, // getParent

      isInstanceOf: function(prototype) {
        return prototype.isPrototypeOf(this);
      }, // isInstanceOf

      _super: function(methodName, args) {
        var parent = this;
        var originalMethod = this[methodName];
        var method;

        while (parent = parent.__proto__) {
          if (parent.hasOwnProperty(methodName)) {
            method = parent[methodName];
            if (method !== originalMethod && $.isFunction(method)) {
              return method.apply(this, args);
            }
          }
        }
        // Fail silently or optionally throw an error here.
      }
    }, // base

    log: function(msg, level) { // log
      var suppress = (!this.debug && ['error', 'warn'].indexOf(level)<0);
      if(!suppress && !!window.console) {
        if(typeof msg!=='string') {
          level = 'object';
        }
        var d = new Date();
        var ms = "." + d.getMilliseconds();
        while(ms.length<4) {
          ms += '0';
        }
        switch(level) {
          case 'info':
            if(+this.debug>0) {
              console.info('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg.toString(), 'font-weight: bold; color: #3333ff;');
            }
            break;
          case 'object':
            console.info('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1") + '] ', msg);
            break;
          case 'error':
            console.log('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg, 'font-weight: bold; color: #ff3333;');
            break;
          case 'warn':
            console.warn('[' + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1")+ '] %c' + msg, 'font-weight: bold; color: #ff8833;');
            break;
          default:
            console.log("[" + (d.toLocaleTimeString()).replace(/( [AP]M)/gim, ms + "$1") + "] " + msg, (msg.indexOf('%c')>=0 ? 'font-weight: bold; color: #3333ff;' : ''));
            break;
        }
      }
    }, // log

    // Adapted from: http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#answer-2901298 (second version)
    // JSK: While an impressive piece of work, this function is also a little "dumb."
    //      We probably want to add a way to handle rounding (via parameter *and* manipulation) // 2015-10-02
    formatNumber: function(n) {
      var parts = n.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }, // formatNumber

    mixin: function(destination, sources) {
      if($.isArray(destination)) {
        sources = destination;
        destination = {};
      }
      sources = [].concat(sources);
      for(var i=0, len=sources.length, source; i<len; i++) {
        source = sources[i];
        for(var k in source) {
          if(source.hasOwnProperty(k)) {
            destination[k] = source[k];
          }
        }
      }
      return destination;
    }, // mixin

    // n
    pluralize: function(num, str) { // this is *not* a smart function
      switch(num) {
        case 1:
          return [1, str].join(' ');
        default:
          return [num, _.pluralize(str)].join(' ');
      }
    }, // pluralize

    // serialize a JS hash into a querystring-like string
    serialize: function(obj, delimiter) {
      delimiter = delimiter ? delimiter : '&';
      var str = [];
      for(var p in obj) {
        if(obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
      }
      return str.join(delimiter);
    }, // serialize

    removeFromArray: function(arr, element) {
      if(arr.indexOf(element)===-1) {
        return false;
      }
      return _.pull(arr, element);
    } // removeFromArray
  }; // utils

  utils.bindable = utils.base.create($.bindable({}));

  return utils;
});
