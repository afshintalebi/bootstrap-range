/*!
 *  jQuery bootstrap-range - v1.1
 *  A plugin to select range of values from list
 *
 *  Copyright 2016-2017 Afshin Talebi
 *  Licensed under the MIT license
 */
// @todo : accept negative values
// check for jQuery plugin
if (typeof jQuery === 'undefined') {
  throw new Error('BootstrapRange\'s JavaScript requires jQuery')
}

// check for bootstrap plugin
(function ($) {
  if (typeof $.fn.popover === 'undefined') {
    throw new Error('BootstrapRange\'s JavaScript requires Bootstrap Popover plugin')
  }
})(jQuery);


(function ($) {
  'use strict';

  // Bootstrap Range class
  var bootstrapRange = function (element, options) {
    this.target = $(element);
    this.options = options;
    this.classObj = null;
    this.minimumItemValue = null;
    this.maximumItemValue = null;
    this.popoverObj = null;
    this.minObj = null;
    this.maxObj = null;
    this.leftItemsObj = null;
    this.rightItemsObj = null;
    this.minOldVal = '';
    this.minNewVal = '';
    this.maxOldVal = '';
    this.maxNewVal = '';
  }

  /**
   * @name bootstrapRange.DEFAULTS
   * @description default options
   * @type {{cssClass: string, minValues: Array, maxValues: Array, minPlaceholder: string, maxPlaceholder: string, minAttribute: string, maxAttribute: string, minHintText: string, maxHintText: string, readonly: boolean, format: boolean, minimumCallback: minimumCallback, maximumCallback: maximumCallback}}
   */
  bootstrapRange.DEFAULTS = {
    // default css class
    cssClass: 'at-bootstrap-range',
    // minimum values
    minValues: [],
    // maximum values
    maxValues: [],
    // placeholder of minimum input
    minPlaceholder: 'Minimum',
    // placeholder of maximum input
    maxPlaceholder: 'Maximum',
    // attribute for save selected minimum value
    minAttribute: 'data-minimum',
    // attribute for save selected maximum value
    maxAttribute: 'data-maximum',
    // minimum hint text
    minHintText: 'from',
    // maximum hint text
    maxHintText: 'to',
    // make iput readonly
    readonly: true,
    // format number values
    format: true,
    // callback function when select minimum value
    minimumCallback: function (min) {
    },
    // callback function when select maximum value
    maximumCallback: function (max) {
    }
  };

  /**
   * @name isNumber
   * @description make filter for object to enter number only
   * @param e
   */
  bootstrapRange.isNumber = function (e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
      // Allow: Ctrl/cmd+A
      (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: Ctrl/cmd+C
      (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: Ctrl/cmd+X
      (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }

  /**
   * @name format
   * @description format the number
   * @param number
   * @param n
   * @param x
   * @returns {string}
   */
  bootstrapRange.prototype.format = function (number, n, x) {
    var classObj = this;
    if (classObj.options.format) {
      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
      number = parseInt(number);
      number = number.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    }
    return number;
  }

  /**
   * @name isPopoverExists
   * @description check popover already created or not
   * @param $object
   * @returns {boolean}
   */
  bootstrapRange.isPopoverExists = function ($object) {
    return $object.next('.popover').length > 0 ? true : false;
  }

  /**
   * @name setCssClass
   * @description add default css class to target element
   */
  bootstrapRange.prototype.setCssClass = function () {
    var classObj = this;
    classObj.target.addClass(classObj.options.cssClass);
  }

  /**
   * @name readonly
   * @description make target object readonly
   */
  bootstrapRange.prototype.readonly = function () {
    var classObj = this;
    if (classObj.options.readonly) {
      classObj.target.prop('readonly', true);
    }
  }

  /**
   * @name createPopover
   * @description create popover for object
   */
  bootstrapRange.prototype.createPopover = function () {
    var classObj = this,
      options = classObj.options,
      $target = classObj.target;
    $target.popover({
      html: true,
      placement: 'bottom',
      trigger: 'manual',
      content: function () {
        var minItems = '', maxItems = '';
        //prepare minimum items
        minItems += '<ul class="list-unstyled">';
        for (var i = 0; i < options.minValues.length; i++) {
          minItems += '<li data-value="' + options.minValues[i] + '">' + classObj.format(options.minValues[i]) + '</li>';
        }
        minItems += '</ul>';

        //prepare maximum items
        maxItems += '<ul class="list-unstyled">';
        for (var i = 0; i < options.maxValues.length; i++) {
          maxItems += '<li data-value="' + options.maxValues[i] + '">' + classObj.format(options.maxValues[i]) + '</li>';
        }
        maxItems += '</ul>';

        // return html
        return '<div class="bootstrap-range">' +
          '<div class="right-column">' +
          '<div class="input-container">' +
          '<input type="text" name="maximum" tabindex="3" class="maximum" placeholder="' + options.maxPlaceholder + '">' +
          '</div>' +
          '<div class="list-items maximum-items">' +
          maxItems +
          '</div>' +
          '</div>' +
          '<div class="left-column">' +
          '<div class="input-container">' +
          '<input type="text" name="minimum" tabindex="2" class="minimum" placeholder="' + options.minPlaceholder + '">' +
          '</div>' +
          '<div class="list-items minimum-items">' +
          minItems +
          '</div>' +
          '</div>' +

          '</div>';
      }
    }).on('shown.bs.popover', function () {
      // initialize object
      classObj.initialize();

      // prevent close popover when click on popover contents
      classObj.popoverObj.click(function (e) {
        e.stopPropagation();
      })
    });
  }

  /**
   * @name setTargetEvents
   * @description set event(s) on target object
   */
  bootstrapRange.prototype.setTargetEvents = function () {
    var classObj = this,
      $target = classObj.target;
    // hide other popovers
    $target.on('focus', function (e) {
      e.stopPropagation();
      if (!bootstrapRange.isPopoverExists($target)) {
        $('.' + classObj.options.cssClass).not($target).popover('hide');
        $target.popover('show');
      }
    });
    // close popovers when click on document and bootstrap dropdown items
    $(document).add("[data-toggle='dropdown']").click(function (e) {
      $('.' + classObj.options.cssClass).popover('hide');
    });
    // prevent close popover when click on target input
    $target.click(function (e) {
      e.stopPropagation();
    })
  }

  /**
   * @name initialize
   * @description initialize popover content after show
   */
  bootstrapRange.prototype.initialize = function () {
    var classObj = this,
      $target = classObj.target,
      $popoverObj, $minObj, $maxObj;
    $popoverObj = classObj.popoverObj = $target.next('.popover');
    $minObj = classObj.minObj = $popoverObj.find('.input-container input.minimum');
    $maxObj = classObj.maxObj = $popoverObj.find('.input-container input.maximum');
    classObj.leftItemsObj = $popoverObj.find('.left-column .list-items');
    classObj.rightItemsObj = $popoverObj.find('.right-column .list-items');

    // add tabindex too the target
    $target.attr('tabindex', '1');

    // get previous selected values
    if (classObj.getMinimum()) {
      classObj.minimumItemValue = classObj.getMinimum();
      $minObj.val(classObj.format(classObj.minimumItemValue));
    }
    if (classObj.getMaximum()) {
      classObj.maximumItemValue = classObj.getMaximum();
      $maxObj.val(classObj.format(classObj.maximumItemValue));
    }

    //focus on minimum input field
    $minObj.focus();

    //add event to list items
    $popoverObj.find('.minimum-items > ul > li').on('click', $.proxy(classObj.minItemsClickHandler, classObj));
    $popoverObj.find('.maximum-items > ul > li').on('click', $.proxy(classObj.maxItemsClickHandler, classObj));

    // events for hide|show list items
    $minObj.on('focus', function () {
      classObj.hideListItems('right');
    }).on('blur', function () {
      classObj.showListItems('right');
    }).trigger('focus');
    $maxObj.on('focus', function () {
      classObj.hideListItems('left');
    }).on('blur', function () {
      classObj.showListItems('left');
    });
    classObj.setMinEvents();
    classObj.setMaxEvents();
    classObj.disableMaxLowerValues();
  }

  /**
   * @name getMinimum
   * @description get minimum value
   * @returns {string}
   */
  bootstrapRange.prototype.getMinimum = function () {
    var classObj = this;
    return classObj.target.attr(classObj.options.minAttribute);
  }

  /**
   * @name getMaximum
   * @description get maximum value
   * @returns {string}
   */
  bootstrapRange.prototype.getMaximum = function () {
    var classObj = this;
    return classObj.target.attr(classObj.options.maxAttribute);
  }

  /**
   * @name setMinimum
   * @param min
   * @description set minimum value
   */
  bootstrapRange.prototype.setMinimum = function (min) {
    var classObj = this;
    classObj.target.attr(classObj.options.minAttribute, min);
  }

  /**
   * @name setMaximum
   * @param max
   * @description set maximum value
   */
  bootstrapRange.prototype.setMaximum = function (max) {
    var classObj = this;
    classObj.target.attr(classObj.options.maxAttribute, max);
  }

  /**
   * @name checkMaxValue
   * @description check max value is lower than minimum or not
   */
  bootstrapRange.prototype.checkMaxValue = function () {
    var classObj = this,
      $maxObj = classObj.maxObj;
    var max = !isNaN(classObj.maximumItemValue) ? parseInt(classObj.maximumItemValue) : undefined,
      min = parseInt(classObj.minimumItemValue);
    if (max >= 0) {
      if (min > max) {
        $maxObj.val('');
        classObj.maximumItemValue = undefined;
        classObj.removeMaximum();
      }
    }
  }

  /**
   * @name removeMaximum
   * @description remove maximum attribute
   */
  bootstrapRange.prototype.removeMaximum = function () {
    var classObj = this;
    classObj.target.removeAttr(classObj.options.maxAttribute);
  }

  /**
   * @name minItemsClickHandler
   * @description click handler for minimum items
   */
  bootstrapRange.prototype.minItemsClickHandler = function (e) {
    var classObj = this,
      $minObj = classObj.minObj,
      $target = $(e.target);
    classObj.minimumItemValue = $target.data('value');
    //set selected minimum value to input
    $minObj.val(classObj.format(classObj.minimumItemValue));
    classObj.setMinimum(classObj.minimumItemValue);
    classObj.checkMaxValue();
    classObj.disableMaxLowerValues();
    // show selected value in target field
    classObj.setTargetValue();
    //call callback function
    if (typeof classObj.options.minimumCallback === 'function')
      classObj.options.minimumCallback(classObj.minimumItemValue);

  }

  /**
   * @name maxItemsClickHandler
   * @description click handler for maximum items
   */
  bootstrapRange.prototype.maxItemsClickHandler = function (e) {
    var classObj = this,
      $maxObj = classObj.maxObj,
      $target = $(e.target);
    if (!$target.hasClass('disabled')) {
      classObj.maximumItemValue = $target.data('value');
      //set selected maximum value to input
      $maxObj.val(classObj.format(classObj.maximumItemValue));
      classObj.setMaximum(classObj.maximumItemValue);

      // show selected value in target field
      classObj.setTargetValue();
      //call callback function
      if (typeof classObj.options.maximumCallback === 'function')
        classObj.options.maximumCallback(classObj.maximumItemValue);
    }
  }

  /**
   * @name setTargetEvents
   * @description show selected values in target
   */
  bootstrapRange.prototype.setTargetValue = function () {
    var classObj = this,
      value = '';
    if ((classObj.minimumItemValue > 0 || classObj.minimumItemValue === 0) && (classObj.maximumItemValue > 0 || classObj.maximumItemValue === 0)) {
      value = classObj.options.minHintText + ' ' + classObj.format(classObj.minimumItemValue) + ' ' + classObj.options.maxHintText + ' ' + classObj.format(classObj.maximumItemValue);
    } else if (classObj.minimumItemValue > 0 || classObj.minimumItemValue === 0) {
      value = classObj.options.minHintText + ' ' + classObj.format(classObj.minimumItemValue);
    } else if (classObj.maximumItemValue > 0 || classObj.maximumItemValue === 0) {
      value = classObj.options.maxHintText + ' ' + classObj.format(classObj.maximumItemValue);
    }
    classObj.target.val(value);
  }

  /**
   * @name hideListItems
   * @param position
   * @description hide list items
   */
  bootstrapRange.prototype.hideListItems = function (position) {
    var classObj = this;
    switch (position) {
      case 'left' :
        classObj.leftItemsObj.fadeOut();
        break;
      case 'right' :
        classObj.rightItemsObj.fadeOut();
        break;
    }
  }

  /**
   * @name showListItems
   * @param position
   * @description show list items
   */
  bootstrapRange.prototype.showListItems = function (position) {
    var classObj = this;
    switch (position) {
      case 'left' :
        classObj.leftItemsObj.fadeIn();
        break;
      case 'right' :
        classObj.rightItemsObj.fadeIn();
        break;
    }
  }

  /**
   * @name setMinEvents
   * @description set minimum input events
   */
  bootstrapRange.prototype.setMinEvents = function () {
    var classObj = this,
      $minObj = classObj.minObj;
    $minObj.on('keydown', bootstrapRange.isNumber);
    $minObj.on('keyup', $.proxy(classObj.minValueChanged, classObj));
  }

  /**
   * @name setMaxEvents
   * @description set maximum input events
   */
  bootstrapRange.prototype.setMaxEvents = function () {
    var classObj = this,
      $maxObj = classObj.maxObj;
    $maxObj.on('keydown', bootstrapRange.isNumber);
    $maxObj.on('keyup', $.proxy(classObj.maxValueChanged, classObj));
  }

  /**
   * @name disableMaxLowerValues
   * @description add `disabled` css class to maximum values that are lower than selected minimum value
   */
  bootstrapRange.prototype.disableMaxLowerValues = function () {
    var classObj = this;
    classObj.popoverObj.find('.maximum-items li').each(function (index) {
      var $li = $(this);
      if (parseInt($li.data('value')) < parseInt(classObj.minimumItemValue)) {
        $li.addClass('disabled');
      } else {
        $li.removeClass('disabled');
      }
    });
  }

  /*bootstrapRange.prototype.checkMaxValue = function () {

  }
  bootstrapRange.prototype.checkMinValue = function () {

  }*/
  /**
   * @name minValueChanged
   * @description handle minimum changes
   * @param e
   */
  bootstrapRange.prototype.minValueChanged = function (e) {
    var classObj = this,
      $target = $(e.target);
    classObj.minNewVal = $target.val();
    if (classObj.minNewVal && classObj.minNewVal != classObj.minOldVal) {
      classObj.minimumItemValue = classObj.minNewVal;
      classObj.minOldVal = classObj.minNewVal;
      classObj.setMinimum(classObj.minNewVal);
      classObj.disableMaxLowerValues();
      classObj.options.minimumCallback(classObj.minNewVal);
      classObj.checkMaxValue();
      classObj.setTargetValue();
    } else if (!classObj.minNewVal) {
      classObj.minOldVal = classObj.minNewVal = '';
    }
  };

  /**
   * @name maxValueChanged
   * @description handle maximum changes
   * @param e
   */
  bootstrapRange.prototype.maxValueChanged = function (e) {
    var classObj = this,
      $target = $(e.target);
    classObj.maxNewVal = $target.val();
    if (parseInt(classObj.maxNewVal) < parseInt(classObj.getMinimum())) {
      classObj.removeMaximum();
      classObj.maximumItemValue = undefined;
      classObj.setTargetValue();
    } else {
      if (classObj.maxNewVal && classObj.maxNewVal != classObj.maxOldVal) {
        classObj.maximumItemValue = classObj.maxNewVal;
        classObj.maxOldVal = classObj.maxOldVal;
        classObj.setMaximum(classObj.maxNewVal);
        classObj.options.maximumCallback(classObj.maxNewVal);
        // show selected value in target field
        classObj.setTargetValue();

      } else if (!classObj.maxNewVal) {
        classObj.maxOldVal = classObj.maxNewVal = '';
      }
    }
  }

  /**
   * add structure to the items
   * @param options
   * @returns {Array|Object|*}
   * @constructor
   */
  function Plugin(options) {
    return this.each(function () {
      options = $.extend(bootstrapRange.DEFAULTS, options);
      var object = new bootstrapRange(this, options);
      object.setCssClass();
      object.readonly();
      object.createPopover();
      object.setTargetEvents();


    });
  }

  $.fn.bootstrapRange = Plugin;
  $.fn.bootstrapRange.Constructor = bootstrapRange;

})(jQuery);