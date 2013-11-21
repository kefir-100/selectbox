(function ($) {
    var Options, Settings = {
        select: "ui-select",
        selectText: "ui-select-text",
        selectIcon: "ui-select-icon",
        optionsList: "ui-select-list",
        optionsListItem: "ui-select-list-item",
        selectIsOpen: "open",
        selectIsPressed: "pressed",
        optionsItemIsSelected: "selected",
        setDataSelect: function ($newSelect, data) {
            $newSelect
                .data("value", data.value)
                .data("html", data.innerHTML)
                .children("." + Settings.selectText).html(data.innerHTML);
            return $newSelect;
        },
        getDataSelect: function ($newSelect) {
            return {
                value: $newSelect.data("value"),
                text: $newSelect.data("html")
            };
        },
        getWidthText: function (text) {
            var span = $("<span />").html(text).hide().appendTo(document.body);
            var width = span.width();
            span.remove();
            return width;
        }
    };
    // Public methods
    var methods = {
        init:function(params) {
            Options = $.extend({
                selectWidth: 200,
                selectCssClass: "new-select",
                selectIconContent: "",
                selectIsShowTitle: false,
                optionsListScrollHeight: 300,
                beforeSelectOpen: function (data) {},
                beforeSelectClose: function (data) {}
            }, params);

            // Create container for list items
            Settings.$optionsList = $("<div />").attr({"class": Settings.optionsList});

            $(document.body).append(Settings.$optionsList)
                // Add click handler for "body" element
                .on("click.selectbox", clickOnBody)
                // Add click handler for "select" element
                .on("click.selectbox", ("." + Settings.select), clickOnSelect)
                // Add mousedown/mouseup handler for "select" element
                .on("mousedown.selectbox mouseup.selectbox", ("." + Settings.select), switchPressedState)
                // Add click handler for "option list item" element
                .on("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);

            return this.each(eachOriginalSelect).on("change", changeOriginalSelect);
        }
    };

    function changeOriginalSelect(e) {
        if (e.isChangeFromNewSelect == "undefined") {
            var $originalSelect = $(this);
            var $newSelect = $originalSelect.next("." + Settings.select);
            var selectedOption = $originalSelect[0][$originalSelect.context.selectedIndex];
            Settings.setDataSelect($newSelect, selectedOption);
            console.log("1");
        }
    }

    // Get each select and create environment
    function eachOriginalSelect(index, element) {
        var $originalSelect = $(element);
        if (!($originalSelect.is("select") || $originalSelect.next().is("." + Settings.select))) return;
        var $newSelect = $("<span />").attr({"class": Settings.select});
        var $newSelectText = $("<span />").attr({"class": Settings.selectText});
        var $newSelectIcon = $("<span />").attr({"class": Settings.selectIcon}).html(Options.selectIconContent);
        var newSelectCssClass = $originalSelect.data("css-class") ? [$originalSelect.data("css-class"), Options.selectCssClass].join(" ") : Options.selectCssClass;

        // Insert elements at the DOM
        $newSelect.append($newSelectText)
            .append($newSelectIcon)
            .addClass(newSelectCssClass)
            .insertAfter($originalSelect.hide());

        // Set current/correct data attrs and html of new "select"
        var selectedOption = $originalSelect[0][$originalSelect.context.selectedIndex];
        Settings.setDataSelect($newSelect, selectedOption);

        // Set correct width for "select"
        setSelectWidth($newSelect, $originalSelect);
    };

    // Set correct "select" width
    function setSelectWidth($newSelect, $originalSelect) {
        if (Options.selectWidth == "auto") {
            var originalSelectWidth = $originalSelect.outerWidth();
            $newSelect.width(originalSelectWidth);
        } else if (Options.selectWidth == "100%") {
            $newSelect.css("display", "block");
        } else if (!isNaN(Options.selectWidth)) {
            var styleProps = $newSelect.css(["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]);
            var indents = parseInt(styleProps.paddingLeft) +
                parseInt(styleProps.paddingRight) +
                parseInt(styleProps.borderLeftWidth) +
                parseInt(styleProps.borderRightWidth);
            var newSelectUserWidth = Options.selectWidth - indents;
            checkIsNeedTitle($newSelect, newSelectUserWidth);
            $newSelect.width(newSelectUserWidth);
        } else {
            $.error("Parameter 'newSelectWidth' must be a number in a jQuery.selectbox, you pass: '" + Options.selectWidth + "'");
        }
    }

    // Handler for click event on "select"
    function clickOnSelect() {
        var $select = $(this);
        // If click in current open "select"
        if ($select.hasClass(Settings.selectIsOpen)) {
            closeSelect($select);
        } else {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
            // If click in another "select", check open "select"
            if ($selectOpen.length > 0) {
                closeSelect($selectOpen);
            } else {
                openSelect($select);
            }
        }
        return false;
    };

    function openSelect($select) {
        var data = Settings.getDataSelect($select);
        Options.beforeSelectOpen.call($select, data);
        buildingOptionsList($select);
    };

    // Building "options list"
    function buildingOptionsList($newSelect) {
        var $originalSelect = $newSelect.prev();
        $newSelect.addClass(Settings.selectIsOpen);
        $originalSelect.children().each(function (index, element) {
            var $option = $(element);
            var html = $option.html();
            var value = $option.val();
            var $optionsListItem = $("<li />").addClass(Settings.optionsListItem).data("value", value).html(html);
            if ($option.is(":selected")) $optionsListItem.addClass(Settings.optionsItemIsSelected);
            Settings.$optionsList.append($optionsListItem);
        });
        setPositionOptionsList($newSelect);
    };

    // Set position for "options list"
    function setPositionOptionsList($select) {
        var $newSelectOffset = $select.offset();
        var newSelectHeight = $select.outerHeight();
        var position = {
            left:$newSelectOffset.left,
            top: $newSelectOffset.top + newSelectHeight
        };
        setDimensionsOptionsList($select);
        Settings.$optionsList.offset(position).show();
    };

    // Set correct dimensions for "options list"
    function setDimensionsOptionsList($select) {
        var selectWidth = $select.outerWidth();
        var scrollbarWidth = 16;
        var optionsList = {
            width: Settings.$optionsList.outerWidth(),
            height: Settings.$optionsList.outerHeight()
        };
        var finalDimensions = {
            width: optionsList.width,
            height: optionsList.height,
            isNeedScrollbar: false
        };

        // OptionsList box are not can be higher than content inside it
        if (optionsList.height > Options.optionsListScrollHeight) {
            finalDimensions.height = Options.optionsListScrollHeight;
            finalDimensions.isNeedScrollbar = true;
        }
        // OptionsList box are not can be shorter than select box
        if (selectWidth > optionsList.width) {
            finalDimensions.width = selectWidth;
            // If has scrollbar we increase width of options list
            if (finalDimensions.isNeedScrollbar) {
                var difference = selectWidth - optionsList.width;
                if (difference < scrollbarWidth) {
                    finalDimensions.width = selectWidth + (scrollbarWidth - difference);
                }
            }
        } else if (selectWidth <= optionsList.width) {
            if (finalDimensions.isNeedScrollbar) {
                finalDimensions.width += scrollbarWidth;
            }
        }
        Settings.$optionsList.width(finalDimensions.width).height(finalDimensions.height);
    };

    // Handler for click event on "options list" box
    function clickOnOptionsListItem() {
        var $optionsListItem = $(this);
        var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
        var data = {
            value: $optionsListItem.data("value"),
            innerHTML: $optionsListItem.html()
        };
        Settings.setDataSelect($selectOpen, data);
        $selectOpen.prev().val(data.value).trigger({type: "change", isChangeFromNewSelect: true});
        checkIsNeedTitle($selectOpen, $selectOpen.width());
        closeSelect($selectOpen);
        return false;
    };

    // Closing "select" and clean content/event handlers
    function closeSelect($select) {
        var data = Settings.getDataSelect($select);
        Options.beforeSelectClose.call($select, data);
        $select.removeClass(Settings.selectIsOpen);
        Settings.$optionsList.hide()
            .empty()
            .removeAttr("style")
            .off("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);
    };

    // Handler for click event on "body" element
    function clickOnBody(e) {
        var $clickedElem = $(e.target);
        var $parentElem = $clickedElem.parent();
        var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
        // Close "select" if parent element is body or without CSS class
        if ($parentElem[0].nodeName.toLowerCase() == "body" || $parentElem[0].className == "undefined") {
            closeSelect($selectOpen);
        } else {
            // Check parent element class
            if (!($parentElem.hasClass(Settings.select) || $parentElem.hasClass(Settings.optionsList))) closeSelect($selectOpen);
        }
    };

    // Handler for mousedown/mouseup event
    function switchPressedState(e) {
        var $newSelect = $(this);
        var isPressed = (e.type == "mousedown");
        $newSelect.toggleClass(Settings.selectIsPressed, isPressed);
    };

    function checkIsNeedTitle($newSelect, newSelectWidth) {
        var newSelectText = Settings.getDataSelect($newSelect).text;
        var newSelectTextWidth = Settings.getWidthText(newSelectText);
        if (Options.selectIsShowTitle && newSelectTextWidth > newSelectWidth) $newSelect.attr({"title": newSelectText});
    };

    $.fn.selectbox = function (method) {
        // Call the need method
        if ( methods[method] ) {
            // Method exists - call, take all parameters and this
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            // If method is object or empty - call init
            return methods.init.apply( this, arguments );
        } else {
            // Error
            $.error( 'The method "' +  method + '" not exist in jQuery.selectbox' );
        }
    };

})(jQuery);