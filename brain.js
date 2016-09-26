/*
 * Name: brain.js
 * Description: The brain namespace
 * Dependencies: jquery, brain/handlebars, brain/utils, lodash, lodash-inflection, brainybars
 * 
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-09-26
 *
 * Notes: 
 *
 *
 */

requirejs.config({
  paths: {
    // these come from bower
    'jquery':               'bower_components/jquery/dist/jquery',
    'jquery-bindable':      'bower_components/jquery-enable/dist/jquery.bindable',
    'lodash':               'bower_components/lodash/dist/lodash.min',
    'lodash-inflection':    'bower_components/lodash-inflection/lib/lodash-inflection',

    // these come from infinityplusone
    'brainybars':           'bower_components/brainybars/brainybars',
    'brain':                'bower_components/brain/brain'
  },
  shim: {
    'jquery-bindable':      { deps: [ 'jquery' ] },
    'lodash-inflection':    { deps: [ 'lodash' ] },
    'brain': {
      deps: [ 'brainybars', 'jquery', 'jquery-bindable', 'lodash', 'lodash-inflection' ],
      exports: 'brain'
    }

  }
});

define([
  './lib/utils',
  './lib/handlebars'
], function(utils, handlebars) {

  window.brain = utils.base.create({

    NAME: 'brain',

    VERSION: '0.1.0',

    REL_ROOT: (function(path) {
      var sp=path.split('/'), rel = '', i=0;
      // JSK: This ridiculous line tries to figure out what the root path of the project is
      //      It makes the (hopefully reasonable) assumption, that the 
      while(i<(sp.length-2 - sp.indexOf([].concat(path.match(/\bapp\b/))[0]))) {
        rel += '../';
        i++;
      }
      rel += '../';
      return rel;
    })(location.pathname),

    _: {},

    debug: typeof brainDebugLevel!=='undefined' ? brainDebugLevel : false,

    templates: utils.bindable.create({}),

    utils: utils,

    handlebars: handlebars,

    log: function() { this.utils.log.apply(this, arguments); }

  });

  return brain;

});