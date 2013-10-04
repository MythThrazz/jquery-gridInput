/*
 * jquery.gridInput.js (https://github.com/MythThrazz/jquery-gridInput)
 * @author Marcin Dudek
 * @version 1.0
 *
 * Copyright (c) 2013 Marcin Dudek aka MythThrazz (https://github.com/MythThrazz)
 * The MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

(function ($) {
    var api, defaultOptions, $gridInputId;

    $gridInputId = 0;

    defaultOptions = {
        length: 'input',
        ac: 'off'
    };

    api = {
        log: function () {
            console.log(this);
        },
        init: function (options) {
            var $this, data;

            $this = $(this), data = $this.data('gridInput');
            options = $.extend({}, defaultOptions, options || {});

            if (!data)
            {
                $(this).data('gridInput', {
                    options: options
                });
            }

            return this.each(function () {

                $gridInputId++;

                var $gridInputLength, $gridInput, $gridInputFields, $gridInputFieldsWrapper, $gridInputVal, i, t;

                $gridInput = $(this);
                $gridInputFields = []; //array of gridInputFields
                $gridInputAttributes = {}; //array of gridInputAttributes

                if ($gridInput.data('gridInputId'))
                {
                    $gridInput.gridInput('destroy');
                    $(this).data('gridInput', {
                        options: options
                    });
                }
                $gridInput.data('gridInputId', $gridInputId);
                $gridInput.data('gridInputType', $gridInput.attr('type'));

                if (options.length === 'input')
                {
                    $gridInputLength = $gridInput.val().length;
                }
                else if (typeof options.length === 'number')
                {
                    $gridInputLength = options.length;
                }
                else
                {
                    console.log('wrong value for options.length! Either "input" or number required!');
                    return false;
                }

                for (var attr, i = 0, attrs = $gridInput.get(0).attributes, l = attrs.length; i < l; i++) {
                    attr = attrs.item(i);
                    $gridInputAttributes[attr.nodeName] = attr.nodeValue;
                }

                $gridInputFieldsWrapper = $('<div/>', {
                    'class': 'gridInputFieldsWrapper'
                }).data('gridInputId', $gridInputId);

                $gridInputVal = ($gridInput.val()) ? $gridInput.val() : '';

                for (i = 0; i < $gridInputLength; i++)
                {
                    var $gridInputSingleField, $gridInputSingleSeparator, $formatVal;

                    if (options.format && options.format[i])
                    {
                        $formatVal = options.format[i];

                        if ($formatVal[0] === '@')
                        {
                            $formatVal = $formatVal.substr(1);
                            $gridInputSingleSeparator = $('<input/>', {
                                'type': 'hidden',
                                'class': 'gridInputSingleSeparator',
                                'name': $gridInputAttributes['name'],
                                'value': $formatVal,
                                'readonly': 'readonly',
                                'disabled': $gridInputAttributes['disabled'] ? $gridInputAttributes['disabled'] : false
                            });
                            $gridInputFieldsWrapper.append($gridInputSingleSeparator);
                            if ($gridInputVal[i])
                            {
                                $gridInputVal = $gridInputVal.substr(0, i) + $gridInputVal.substr((i + 1));
                            }
                        }

                        $gridInputSingleSeparator = $('<span/>', {
                            'class': 'gridInputSingleSeparator',
                            'text': $formatVal
                        });
                        $gridInputFieldsWrapper.append($gridInputSingleSeparator);
                    }

                    $gridInputSingleField = $('<input/>', {
                        'type': 'text',
                        'class': 'gridInputSingleField',
                        'size': 1,
                        'maxlength': 1,
                        'name': $gridInputAttributes['name'],
                        'value': ($gridInputVal[i]) ? $gridInputVal[i] : '',
                        'readonly': $gridInputAttributes['readonly'] ? $gridInputAttributes['readonly'] : false,
                        'disabled': $gridInputAttributes['disabled'] ? $gridInputAttributes['disabled'] : false,
                    });
                    $gridInputSingleField.attr('autocomplete', options.ac);
                    $gridInputFields.push($gridInputSingleField);
                    $gridInputFieldsWrapper.append($gridInputSingleField);
                }

                $gridInputFieldsWrapper.on(
                    {
                        'click': function (e) {
                            var $this = $(this);
                            $this.select();
                        },
                        'keydown': function (e) {
                            var $this = $(this);
                            /*
                             * Tab
                             */
                            if (9 === e.which)
                            {
                                return true;
                            }
                            /*
                             * Backspace
                             */
                            if (8 === e.which)
                            {
                                $this.val('');
                                $this.parents('.gridInputFieldsWrapper').children().slice(0, $this.index()).filter('.' + $this.attr("class") + ':last').select();
                                return false;
                            }
                            /*
                             * Del
                             */
                            if (46 === e.which)
                            {
                                $this.val('');
                                return false;
                            }
                            if (37 === e.which)
                            {
                                $this.parents('.gridInputFieldsWrapper').children().slice(0, $this.index()).filter('.' + $this.attr("class") + ':last').select();
                                return false;
                            }
                            if (39 === e.which)
                            {
                                $this.parents('.gridInputFieldsWrapper').children().slice($this.index() + 1).filter('.' + $this.attr("class") + ':first').select();
                                return false;
                            }
                            if ($this.val())
                                $this.parents('.gridInputFieldsWrapper').children().slice($this.index() + 1).filter('.' + $this.attr("class") + ':first').select()
                        },
                        'change': function () {
                            var $inputsValue = '';
                            $inputsValue = api.val.apply($gridInput);
                            $gridInput.val($inputsValue).trigger('change');
                        },
                        'blur': function () {

                            clearTimeout(t);
                            t = setTimeout(function () {
                                $gridInput.trigger('blur');
                            }, 500);
                        },
                        'focus': function () {
                            clearTimeout(t);
                        }
                    }, '.gridInputSingleField:not([readonly="readonly"]):not([disabled="disabled"])');

                /*
                 * Deactivate all singlefields on submit
                 */
                $('form').on('submit', function () {
                    var $this = $(this);
                    $this.find('.gridInputSingleField').attr('disabled', 'disabled');
                });

                $gridInput.addClass('gridInputField').attr('type', 'hidden').hide().before($gridInputFieldsWrapper);
            });
        },
        val: function () {
            var $inputsValue, $this, $gridInputFields, options;

            $this = $(this);
            $inputsValue = '';
            options = $this.data('gridInput').options;

            $gridInputFields = $this.prevAll('.gridInputFieldsWrapper').find('input[name="' + $this.attr('name') + '"]');

            $.each($gridInputFields, function (k, v) {
                var $val = $(v).val();
                $inputsValue += $val;
            });

            return $inputsValue;
        },
        destroy: function () {
            return this.each(function () {
                var $this, $gridInputId, $gridInputType, data, $parent, $gridInputWrapper;
                $this = $(this);
                data = $this.data('gridInput');
                $gridInputId = $this.data('gridInputId');
                $gridInputType = $this.data('gridInputType');

                $parent = $this.parents('form');
                $gridInputWrapper = $parent.find('.gridInputFieldsWrapper').filter(function () {
                    var $dataDridInputId = $(this).data('gridInputId');
                    return $dataDridInputId === $gridInputId;
                });

                $gridInputWrapper.remove();
                $this.attr('type', $gridInputType).show().removeData('gridInput').removeData('gridInputId').removeClass('gridInputField');
            });
        }
    };
    $.fn.gridInput = function (options) {
        // Method calling logic
        if (api[options]) {
            return api[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof options === 'object' || !options) {
            return api.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + options + ' does not exist on jQuery.grid.input');
        }
    };
})(jQuery);