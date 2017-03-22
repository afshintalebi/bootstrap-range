/*
 *  jQuery bootstrap-range - v1.0.0
 *  A plugin which allows to select range of values from a list
 *
 *  Made by Afshin Talebi
 *  Under MIT License
 */
(function ( $ ) {
    'use strict';
    var cssClass = 'aft-bootstrap-range';
    $.bootstrapRange = {'version': '1.0'};

    $.fn.bootstrapRange = function(options ) {

        // default options
        var settings = $.extend({
            cssClass: cssClass,
            minValues : [],
            maxValues : [],
            minPlaceholder:'Minimum',
            maxPlaceholder:'Maximum',
            minAttribute:'data-minimum',
            maxAttribute:'data-maximum',
            minHintText:'from',
            maxHintText:'to',
            readonly:true,
            format:true,
            minimumCallback: function(min){},
            maximumCallback: function(max){}
        }, options );

        // format numbers
        var format = function(number,n, x) {
            if(settings.format) {
                var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
                number=parseInt(number);
                number = number.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
            }
            return number;
        };

        // check text inputs for enter numbers only
        var isNumber = function (e) {
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

        // check popover already created or not
        var isPopoverExists = function ($object){
            return $object.next('.popover').length > 0 ? true : false;
        }
        // check for type to be in Array structure
        if(!Array.isArray(settings.minValues)) {
            console.info('Minimum values isn\'t Array');
            return;
        }
        if(!Array.isArray(settings.maxValues)) {
            console.info('Maximum values isn\'t Array');
            return;
        }

        return this.each(function () {

            var target = $(this),
                minimumItemValue, maximumItemValue,
                $popoverObj,$minObj,$maxObj,
                $leftItemsObj,$rightItemsObj ,
                minOldVal='', minNewVal='',
                maxOldVal='', maxNewVal='';

            /**
             * initialize popover content after show
             */
            var initialize = function () {
                //initial objects
                $popoverObj=target.next('.popover');
                $minObj=$popoverObj.find('.input-container input.minimum');
                $maxObj=$popoverObj.find('.input-container input.maximum');
                $leftItemsObj=$popoverObj.find('.left-column .list-items');
                $rightItemsObj=$popoverObj.find('.right-column .list-items');
                // get previous selected values
                if(getMinimum()) {
                    minimumItemValue=getMinimum();
                    $minObj.val(format(minimumItemValue));
                }
                if(getMaximum()) {
                    maximumItemValue=getMaximum();
                    $maxObj.val(format(maximumItemValue));
                }

                //focus on minimum input field
                $popoverObj.find('.minimum').focus();

                //add event to list items
                $popoverObj.find('.minimum-items > ul > li').on('click',minItemsClickHandler);
                $popoverObj.find('.maximum-items > ul > li').on('click',maxItemsClickHandler);

                // events for hide|show list items
                $minObj.on('focus',function () {
                    hideListItems('left');
                }).on('blur',function () {
                    showListItems('left');
                }).trigger('focus');
                $maxObj.on('focus',function () {
                    hideListItems('right');
                }).on('blur',function () {
                    showListItems('right');
                });
                setMinEvents();
                setMaxEvents();
                disableMaxLowerValues();
            }

            /**
             * hide list items
             * @param position
             */
            var hideListItems = function (position) {
                switch (position) {
                    case 'left' :
                        $leftItemsObj.fadeOut();
                        break;
                    case 'right' :
                        $rightItemsObj.fadeOut();
                        break;
                }
            }

            /**
             * show list items
             * @param position
             */
            var showListItems = function (position) {
                switch (position) {
                    case 'left' :
                        $leftItemsObj.fadeIn();
                        break;
                    case 'right' :
                        $rightItemsObj.fadeIn();
                        break;
                }
            }

            /**
             * set maximum value
              * @param max
             */
            var setMaximum = function (max) {
                target.attr(settings.maxAttribute,max);
            }

            /**
             * set minimum value
             * @returns {*}
             */
            var getMaximum = function () {
                return target.attr(settings.maxAttribute);
            }

            /**
             * remove maximum attribute
             */
            var removeMaximum = function () {
                target.removeAttr(settings.maxAttribute);
            }

            /**
             * set minimum value
              * @param min
             */
            var setMinimum = function (min) {
                target.attr(settings.minAttribute,min);
            }

            /**
             * get minimum value
             * @returns {*}
             */
            var getMinimum = function () {
                return target.attr(settings.minAttribute);
            }

            /**
             * handle minimum changes
             * @param e
             */
            var minChanged = function (e) {
                minNewVal = $(this).val();
                if(minNewVal && minNewVal != minOldVal) {
                    minimumItemValue=minNewVal;
                    minOldVal = minNewVal;
                    setMinimum(minNewVal);
                    disableMaxLowerValues();
                    settings.minimumCallback(minNewVal);
                    setTargetValue();
                } else if(!minNewVal) {
                    minOldVal = minNewVal = '';
                }
            }

            /**
             * handle maximum changes
             * @param e
             */
            var maxChanged = function (e) {
                maxNewVal = $(this).val();
                if (parseInt(maxNewVal) < parseInt(getMinimum())) {
                    removeMaximum();
                    maximumItemValue = undefined;
                    setTargetValue();
                } else {
                    if (maxNewVal && maxNewVal != maxOldVal) {
                        maximumItemValue = maxNewVal;
                        maxOldVal = maxOldVal;
                        setMaximum(maxNewVal);
                        settings.maximumCallback(maxNewVal);
                        // show selected value in target field
                        setTargetValue();

                    } else if (!maxNewVal) {
                        maxOldVal = maxNewVal = '';
                    }
                }
            }

            /**
             * set minimum input events
             */
            var setMinEvents = function () {
                $minObj.on('keydown',isNumber);
                $minObj.on('keyup',minChanged);
            }

            /**
             * set maximum input events
             */
            var setMaxEvents = function () {
                $maxObj.on('keydown',isNumber);
                $maxObj.on('keyup',maxChanged);
            }

            /**
             * make target readonly
              */
            var readonly = function () {
                if(settings.readonly) {
                    target.attr('readonly','');
                }
            }

            /**
             * show selected values in target
             */
            var setTargetValue = function () {
                var value='';
                if(minimumItemValue >= 0 && maximumItemValue >= 0) {
                    value=settings.minHintText+' '+format(minimumItemValue)+' '+settings.maxHintText+' '+format(maximumItemValue);
                } else if(minimumItemValue >= 0) {
                    value=settings.minHintText+' '+format(minimumItemValue);
                } else if(maximumItemValue >= 0) {
                    value=settings.maxHintText+' '+format(maximumItemValue);
                }
                target.val(value);
            }

            /**
             * check max value is lower than minimum or not
             */
            var checkMaxValue = function () {
                var max = !isNaN(maximumItemValue) ?parseInt(maximumItemValue) : undefined,
                    min = parseInt(minimumItemValue);
                if(max >= 0) {
                    if(min > max) {
                        $maxObj.val('');
                        maximumItemValue=undefined;
                        removeMaximum();
                    }
                }
            }

            /**
             * add `disabled` css class to maximum values that are lower than selected minimum value
             */
            var disableMaxLowerValues = function () {
                $popoverObj.find('.maximum-items li').each(function(index){
                    if(parseInt($(this).data('value')) < parseInt(minimumItemValue)) {
                        $(this).addClass('disabled');
                    } else {
                        $(this).removeClass('disabled');
                    }
                });
            }

            /**
             * click handler for minimum items
             */
            var minItemsClickHandler = function () {
                minimumItemValue=$(this).data('value');
                //set selected minimum value to input
                $minObj.val(format(minimumItemValue));
                setMinimum(minimumItemValue);
                checkMaxValue();
                disableMaxLowerValues();

                // show selected value in target field
                setTargetValue();
                //call callback function
                if(typeof settings.minimumCallback === 'function')
                    settings.minimumCallback(minimumItemValue);
            }

            /**
             * click handler for maximum items
             */
            var maxItemsClickHandler = function () {
                if(!$(this).hasClass('disabled')) {
                    maximumItemValue=$(this).data('value');
                    //set selected maximum value to input
                    $maxObj.val(format(maximumItemValue));
                    setMaximum(maximumItemValue);

                    // show selected value in target field
                    setTargetValue();
                    //call callback function
                    if(typeof settings.maximumCallback === 'function')
                        settings.maximumCallback(maximumItemValue);
                }
            }

            // add default class to target and make it readonly
            target.addClass(settings.cssClass);
            // make target readonly
            readonly();

            // create popover
            $(this).popover({
                html:true,
                placement: 'bottom',
                trigger: 'manual',
                content: function () {
                    var minItems='', maxItems='';
                    //prepare minimum items
                    minItems+='<ul class="list-unstyled">';
                    for(var i=0;i<settings.minValues.length;i++) {
                        minItems+='<li data-value="'+settings.minValues[i]+'">'+format(settings.minValues[i])+'</li>';
                    }
                    minItems+='</ul>';

                    //prepare maximum items
                    maxItems+='<ul class="list-unstyled">';
                    for(var i=0;i<settings.maxValues.length;i++) {
                        maxItems+='<li data-value="'+settings.maxValues[i]+'">'+format(settings.maxValues[i])+'</li>';
                    }
                    maxItems+='</ul>';

                    // return html
                    return '<div class="bootstrap-range">' +
                                '<div class="right-column">' +
                                    '<div class="input-container">' +
                                        '<input type="text" name="minimum" class="minimum" placeholder="'+settings.minPlaceholder+'">' +
                                    '</div>' +
                                    '<div class="list-items minimum-items">' +
                                        minItems+
                                    '</div>' +
                                '</div>' +
                                '<div class="left-column">' +
                                    '<div class="input-container">' +
                                        '<input type="text" name="maximum" class="maximum" placeholder="'+settings.maxPlaceholder+'">' +
                                    '</div>' +
                                    '<div class="list-items maximum-items">' +
                                    maxItems+
                                    '</div>' +
                                '</div>' +

                            '</div>';
                }
            }).on('shown.bs.popover', function() {
                // initialize object
                initialize();

                // prevent close popover when click on popover contents
                $popoverObj.click(function(e){
                    e.stopPropagation();
                })
            });

            // hide other popovers
            target.on('focus',function(e){
                e.stopPropagation();
                if(!isPopoverExists(target)) {
                    $('.' + cssClass).not(target).popover('hide');
                    target.popover('show');
                }

            });

            // close popovers when click on document and bootstrap dropdown items
            $(document).add("[data-toggle='dropdown']").click(function(e){
                $('.'+cssClass).popover('hide');
            });

            // prevent close popover when click on target input
            target.click(function(e){
                e.stopPropagation();
            })

        });
    };

}( jQuery ));