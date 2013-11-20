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
        setData: function ($newSelect, value, text) {
            $newSelect
                .data({"value": value, "text": text})
                .children("." + Settings.selectText).html(text);
            return $newSelect;
        },
        getData: function ($newSelect) {
            return {
                value: $newSelect.data("value"),
                text: $newSelect.data("text")
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
                selectWidth: 100,
                selectCssClass: "new-select",
                selectIconContent: "",
                selectIsShowTitle: true,
                beforeSelectOpen: function (select, value, text) {console.log(select)},
                beforeSelectClose: function () {console.log("Close")}
            }, params);

            // Create container for list items
            Settings.$newOptionsList = $("<div />").attr({"class": Settings.optionsList});

            $(document.body).append(Settings.$newOptionsList)
                // Add click handler for "body" element
                .on("click.selectbox", clickOnBody)
                // Add click handler for "select" element
                .on("click.selectbox", ("." + Settings.select), clickOnSelect)
                // Add mousedown/mouseup handler for "select" element
                .on("mousedown.selectbox mouseup.selectbox", ("." + Settings.select), switchPressedState)
                // Add click handler for "option list item" element
                .on("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);

            return this.each(eachOriginalSelect);
        }
    };

    // Get each select and create environment
    function eachOriginalSelect(index, element) {
        var $originalSelect = $(element);
        if (!($originalSelect.is("select") || $originalSelect.next().is("." + Settings.select))) return;
        // Get selected option ($originalSelect[0] - clean JavaScript object)
        var selectedOption = $originalSelect[0][$originalSelect.context.selectedIndex];
        var valueSelectedOption = selectedOption.value;
        var textSelectedOption = selectedOption.innerHTML;
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
        Settings.setData($newSelect, valueSelectedOption, textSelectedOption);

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
        var $newSelect = $(this);
        var selectData = Settings.getData($newSelect);
        // If click in current open "select"
        if ($newSelect.hasClass(Settings.selectIsOpen)) {
            // Call handler
            Options.beforeSelectClose();
            // Close him
            closeSelect($newSelect);
        } else {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
            // If click in another "select", check open "select"
            if ($selectOpen.length > 0) {
                // Call handler
                Options.beforeSelectClose();
                // If he exist - close him
                closeSelect($selectOpen);
            } else {
                // Call handler
                Options.beforeSelectOpen.call($newSelect, selectData.value, selectData.text);
                // If he not exist - open him
                openSelect($newSelect);
            }
        }
        return false;
    };

    // Building "options list" and show it
    function openSelect($newSelect) {
        var $originalSelect = $newSelect.addClass(Settings.selectIsOpen).prev();
        $originalSelect.children().each(function (index, element) {
            var $option = $(element);
            var html = $option.html();
            var value = $option.val();
            var $newOptionsListItem = $("<li />").attr({"class": Settings.optionsListItem, "data-value": value}).html(html);
            if ($option.is(":selected")) $newOptionsListItem.addClass(Settings.optionsItemIsSelected);
            Settings.$newOptionsList.append($newOptionsListItem);
        });
        setOptionsListPosition($newSelect);
    };

    // Set position for "options list"
    function setOptionsListPosition($newSelect) {
        var $newSelectOffset = $newSelect.offset();
        var newSelectHeight = $newSelect.outerHeight();
        var position = {
            left:$newSelectOffset.left,
            top: $newSelectOffset.top + newSelectHeight
        };
        Settings.$newOptionsList.offset(position).show();
        setOptionsListWidth($newSelect);
    };

    // Set correct width for "options list"
    function setOptionsListWidth($newSelect) {
        var newSelectWidth = $newSelect.outerWidth();
        var newOptionsListWidth = Settings.$newOptionsList.outerWidth();
        var finalWidth = Settings.$newOptionsList.width() + 2; // 2 - border-left + border-right
        var isHasScrollbar = Settings.$newOptionsList.prop("scrollHeight") > Settings.$newOptionsList.prop("clientHeight");
        var scrollbarWidth = 18;
        if (newSelectWidth >= newOptionsListWidth) finalWidth = newSelectWidth;
        if (isHasScrollbar) finalWidth += scrollbarWidth;
        Settings.$newOptionsList.width(finalWidth);
    };

    // Handler for click event on "options list" box
    function clickOnOptionsListItem() {
        var $newOptionsListItem = $(this);
        var $newSelectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
        var value = $newOptionsListItem.data("value");
        var text = $newOptionsListItem.html();
        Settings.setData($newSelectOpen, value, text);
        $newSelectOpen.prev().val(value).trigger("change");
        checkIsNeedTitle($newSelectOpen, $newSelectOpen.width());
        closeSelect($newSelectOpen);
        return false;
    };

    // Closing "select" and clean content/event handlers
    function closeSelect($select) {
        var $selectOpen = $select ? $select : $("." + Settings.select).filter("." + Settings.selectIsOpen);
        $selectOpen.removeClass(Settings.selectIsOpen);
        Settings.$newOptionsList.hide()
            .empty()
            .removeAttr("style")
            .off("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);
    };

    // Handler for click event on "body" element
    function clickOnBody(e) {
        var $clickedElem = $(e.target);
        var $parentElem = $clickedElem.parent();
        // Close "select" if parent element is body or without CSS class
        if ($parentElem[0].nodeName.toLowerCase() == "body" || $parentElem[0].className == "undefined") {
            closeSelect();
        } else {
            // Check parent element class
            if (!($parentElem.hasClass(Settings.select) || $parentElem.hasClass(Settings.optionsList))) closeSelect();
        }
    };

    // Handler for mousedown/mouseup event
    function switchPressedState(e) {
        var $newSelect = $(this);
        var isPressed = (e.type == "mousedown");
        $newSelect.toggleClass(Settings.selectIsPressed, isPressed);
    };

    function checkIsNeedTitle($newSelect, newSelectWidth) {
        var newSelectText = Settings.getData($newSelect).text;
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

/* TO DO если будет куча вызовов с разными классами $(".JsSelect").selectbox({select: "uniqueClass"}); отработают только те селекты в которых совпадут классы */