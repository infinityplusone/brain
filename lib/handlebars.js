/* 
 * Name: utils.js
 * Description: BrainyBars utilities and extensions
 * Dependencies: brainybars, lodash, lodash-inflection, brain, jquery
 *
 * Author(s):  Jonathan "Yoni" Knoll
 * Version:    0.1.0
 * Date:       2016-09-26
 * 
 */
define([
  'brainybars',
  'lodash',
  'brain',
  'jquery'
], function(BrainyBars, _) {

  var HTML_TAGS = /\b(a|abbr|acronym|address|applet|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cdata|center|cite|code|col|colgroup|dd|del|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|map|mark|meta|nav|noframes|object|ol|optgroup|option|p|param|pre|samp|script|section|select|small|span|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video)\b/i;
  var SVG_TAGS = /\b(animate|circle|cursor|defs|desc|ellipse|font|g|glyph|image|line|marker|mask|metadata|path|pattern|polygon|polyline|rect|set|stop|svg|switch|symbol|text|use|view)\b/i;
  var RE_COMPONENTS = /<(\/|\b)([^ >]+)([^>]*)>/gim;
  var RE_ALPHA = /^\w+$/i; // valid tags contain no special characters such as hyphens or underscores

  /*
   * Finds all non-HTML tags in a string and replaces them with handlebars partial block code,
   * under the assumption that they are brain components (which *is* the only reason they should be there)
   * @param source {String} the string to be parsed
   * @return {String} the parsed string with component tags replaced
   */
  function _findComponents(source) {
    return source.replace(RE_COMPONENTS, function(match, prefix, tag, attrs, offset, string) {
      prefix = prefix ? prefix : '#>';
      // if we don't recognize the partial, ignore it
      if(typeof BrainyBars.partials[tag]==='undefined' || (RE_ALPHA.test(tag) && (HTML_TAGS.test(tag) || SVG_TAGS.test(tag)))) { // test the match against known HTML tags, and do nothing if it is one
        return match;
      }
      return '{{' + prefix + tag + attrs + '}}'; // otherwise, replace the component tag with handlebars partial block syntax
    }); // replace
  } // _findComponents

  // addTemplates
  BrainyBars.addTemplates = function(source) {
    var $root;
    var results = {
      partials: 0,
      templates: 0
    };
    var oldSource = source;

    switch(typeof source) {
      case 'string':
        source = _findComponents(source);
        if(/x-handlebars-template/gim.test(source)) { // raw code
          $root = $('<div />').append(source);
        }
        else { // probably (hopefully) a selector
          $root = $(source);
        }
        break;
      case 'object':
        $root = $(source);
        break;
      default:
        $root = $('body');
        break;
    }

    // grab any partials we find
    // also grabs layouts, which are just partials, but adding a different naming convention for our own organization
    $root.find('[data-partial-id]:not(.processed)').each(function(i, partial) {
      var $partial = $(partial),
          partialId = partial.getAttribute('data-partial-id');

      if(typeof BrainyBars.partials[partialId]!=='undefined') {
        console.warn('Duplicate partial `' + partialId + '` found! Overwriting.');
      }

      BrainyBars.registerPartial(partialId, $partial.html());
      $partial.addClass('processed');

      if(brain.DEBUG) {
        console.info('Partial compiled: `' + partialId + '`');
      }
    });

    // grab any templates we find
    $root.find('[data-template-id]:not(.processed)').each(function(i, template) {
      var $template = $(template),
          templateId = template.getAttribute('data-template-id');

      if(typeof brain.templates[templateId]!=='undefined') {
        console.warn('Duplicate template `' + templateId + '` found! Overwriting.');
      }

      // brain.templates[templateId] = BrainyBars.compile($template.html());
      brain.templates[templateId] = function() {
        var brainId = _.uniqueId('brain-');
        var $ret = $(BrainyBars.compile($template.html()).apply(BrainyBars, arguments));
        $ret.attr('data-brain-id', brainId);
        // var ret = BrainyBars.compile($template.html()).apply(BrainyBars, arguments);

        // JSK: Can't trigger this until the code has hit the page.
        // Potentially problematic if something is generated and never added
        var wait = setInterval(function() {
          if($(['[data-brain-id="' + brainId + '"]']).length>0) {
            clearInterval(wait);
            brain.templates.trigger('template:rendered', {
              template: templateId,
              $ret: $ret,
              args: arguments,
              id: brainId
            });
          }
        }, 50);

        return $ret;
      };

      $template.addClass('processed');

      if(brain.DEBUG) {
        console.info('Template compiled: `' + templateId + '`');
      }
    });

    return results;

  }; // addTemplates

  // add application-specific helpers
  BrainyBars.registerHelper({
    REL_IMG: function() {
     return brain.REL_ROOT + 'assets/images/';
    }, // helper: REL_IMG

    REL_EOOT: function() {
     return brain.REL_ROOT;
    } // helper: REL_ROOT
  });


  return BrainyBars;

}); // define
