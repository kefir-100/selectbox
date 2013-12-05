(function ($) {
    var Options, Settings = {
        select: "ui-select",
        text: "ui-select-text",
        icon: "ui-select-icon",
        list: "ui-select-list",
        item: "ui-select-item",
        isOpen: "open",
        isPressed: "pressed",
        isSelected: "selected",
        setData: function ($newSelect, data) {
            $newSelect
                .data("value", data.value)
                .data("html", data.innerHTML)
                .children("." + Settings.text)
                .html(data.innerHTML);
            return $newSelect;
        },
        getData: function ($newSelect) {
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

    $.fn.selectbox = function (method) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'The method "' +  method + '" not exist in jQuery.selectbox' );
        }
    };

    var methods = {
        init:function(params) {
            Options = $.extend({
                widthOfSelect: 200,
                isShowTitle: false,
                contentOfIcon: "",
                heightOfList: 300,
                classes: {
                    select: "select",
                    text: "text",
                    icon: "icon",
                    list: "list",
                    item: "item"
                },
                beforeOpen: function (newSelect, data) {},
                beforeClose: function (newSelect, data) {}
            }, params);

            Settings.document = $(document);
            Settings.body = $(document.body);

            if (Settings.$optionsList == undefined) {
                Settings.$optionsList = $("<div />").addClass(Settings.list).appendTo(Settings.body);
                Settings.document.on("click.selectbox", ("." + Settings.select), clickOnSelect)
                    .on("mousedown.selectbox mouseup.selectbox", ("." + Settings.select), switchPressedState)
                    .on("click.selectbox", ("." + Settings.item), clickOnOptionsListItem);
            }

            return this.filter("select")
                .on("change", changeOriginalSelect)
                .each(eachOriginalSelect);
        }
    };

    function changeOriginalSelect(e) {
        if (e.isChangeFromNewSelect == undefined) {
            var $originalSelect = $(this);
            var $newSelect = $originalSelect.next("." + Settings.select);
            var selectedOption = $originalSelect[0][$originalSelect.prop("selectedIndex")];
            Settings.setData($newSelect, selectedOption);
        }
    }

    function eachOriginalSelect(index, element) {
        var $originalSelect = $(element);
        if ($originalSelect.next().hasClass(Settings.select)) return;
        var $newSelect = $("<span />")
            .addClass([Settings.select, Options.classes.select].join(" "))
            .prop("classOfList", Options.classes.list)
            .prop("classOfItem", Options.classes.item);
        var $newSelectText = $("<span />").addClass([Settings.text, Options.classes.text].join(" "));
        var $newSelectIcon = $("<span />").addClass([Settings.icon, Options.classes.icon].join(" ")).html(Options.contentOfIcon);
        $newSelect
            .append($newSelectText)
            .append($newSelectIcon)
            .insertAfter($originalSelect.hide());

        var selectedOption = $originalSelect[0][$originalSelect.prop("selectedIndex")];
        Settings.setData($newSelect, selectedOption);

        setSelectWidth($newSelect, $originalSelect);
    };

    function setSelectWidth($newSelect, $originalSelect) {
        if (Options.widthOfSelect == "auto") {
            var originalSelectWidth = $originalSelect.outerWidth();
            $newSelect.width(originalSelectWidth);
        } else if (Options.widthOfSelect == "100%") {
            $newSelect.css("display", "block");
        } else if (!isNaN(Options.widthOfSelect)) {
            var styleProps = $newSelect.css(["paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"]);
            var indents = parseInt(styleProps.paddingLeft) +
                parseInt(styleProps.paddingRight) +
                parseInt(styleProps.borderLeftWidth) +
                parseInt(styleProps.borderRightWidth);
            var newSelectUserWidth = Options.widthOfSelect - indents;
            checkIsNeedTitle($newSelect, newSelectUserWidth);
            $newSelect.width(newSelectUserWidth);
        } else {
            $.error("Parameter 'newSelectWidth' must be a number in a jQuery.selectbox, you pass: '" + Options.widthOfSelect + "'");
        }
    }

    function clickOnSelect() {
        var $select = $(this);
        if ($select.hasClass(Settings.isOpen)) {
            closeSelect($select);
        } else {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.isOpen);
            if ($selectOpen.length > 0) {
                closeSelect($selectOpen);
            } else {
                openSelect($select);
            }
        }
        return false;
    };

    function openSelect($select) {
        var $origSelect = $select.prev();
        var data = Settings.getData($select);
        $origSelect.trigger("beforeOpen", [$select, data]);
        Options.beforeOpen.apply($origSelect, [$select, data]);
        buildingOptionsList($select);
        Settings.document.on("click.selectbox", clickOnBody)
            .on("keyup.selectbox", keypressEsc);
    };

    function buildingOptionsList($newSelect) {
        var $originalSelect = $newSelect.prev();
        var customCssClassItem = $newSelect.prop("classOfItem");
        $newSelect.addClass(Settings.isOpen);
        $originalSelect.children().each(function (index, element) {
            var $option = $(element);
            var html = $option.html();
            var value = $option.val();
            var $optionsListItem = $("<li />").addClass([Settings.item, customCssClassItem].join(" ")).data("value", value).html(html);
            if ($option.is(":selected")) $optionsListItem.addClass(Settings.isSelected);
            Settings.$optionsList.append($optionsListItem);
        });
        Settings.$optionsList.addClass($newSelect.prop("classOfList"));
        setPositionOptionsList($newSelect);
    };

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

    function setDimensionsOptionsList($select) {
        var widthOfSelect = $select.outerWidth();
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

        if (optionsList.height > Options.heightOfList) {
            finalDimensions.height = Options.heightOfList;
            finalDimensions.isNeedScrollbar = true;
        }

        if (widthOfSelect > optionsList.width) {
            finalDimensions.width = widthOfSelect;
            if (finalDimensions.isNeedScrollbar) {
                var difference = widthOfSelect - optionsList.width;
                if (difference < scrollbarWidth) {
                    finalDimensions.width = widthOfSelect + (scrollbarWidth - difference);
                }
            }
        } else if (widthOfSelect <= optionsList.width) {
            if (finalDimensions.isNeedScrollbar) {
                finalDimensions.width += scrollbarWidth;
            }
        }
        Settings.$optionsList.width(finalDimensions.width).height(finalDimensions.height);
    };

    function clickOnOptionsListItem() {
        var $optionsListItem = $(this);
        var $selectOpen = $("." + Settings.select).filter("." + Settings.isOpen);
        var data = {
            value: $optionsListItem.data("value"),
            innerHTML: $optionsListItem.html()
        };
        Settings.setData($selectOpen, data);
        $selectOpen.prev().val(data.value).trigger({type: "change", isChangeFromNewSelect: true});
        checkIsNeedTitle($selectOpen, $selectOpen.width());
        closeSelect($selectOpen);
        return false;
    };

    function closeSelect($select) {
        var $origSelect = $select.prev();
        var data = Settings.getData($select);
        $origSelect.trigger("beforeClose", [$select, data]);
        Options.beforeClose.apply($origSelect, [$select, data]);
        $select.removeClass(Settings.isOpen);
        Settings.$optionsList.hide()
            .empty()
            .removeAttr("style")
            .removeClass($select.prop("classOfList"))
            .off("click.selectbox", ("." + Settings.item), clickOnOptionsListItem);
        Settings.document.off("click.selectbox", clickOnBody)
            .off("keyup.selectbox", keypressEsc);
    };

    function clickOnBody(e) {
        var $clickedElem = $(e.target);
        var $parentElem = $clickedElem.parent();
        var $selectOpen = $("." + Settings.select).filter("." + Settings.isOpen);
        if ($parentElem.prop("nodeName").toLowerCase() == "body" || $parentElem.attr("class") == undefined) {
            closeSelect($selectOpen);
        } else {
            if (!($parentElem.hasClass(Settings.select) || $parentElem.hasClass(Settings.list)))
                closeSelect($selectOpen);
        }
    };

    function keypressEsc(e) {
        console.log(e.keyCode);
        if (e.keyCode == 27) {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.isOpen);
            closeSelect($selectOpen);
        }
    }

    function checkIsNeedTitle($newSelect, newSelectWidth) {
        var newSelectText = Settings.getData($newSelect).text;
        var newSelectTextWidth = Settings.getWidthText(newSelectText);
        if (Options.isShowTitle && newSelectTextWidth > newSelectWidth)
            $newSelect.attr("title", newSelectText);
        else
            $newSelect.removeAttr("title");
    };

    function switchPressedState(e) {
        var $newSelect = $(this);
        var isPressed = (e.type == "mousedown");
        $newSelect.toggleClass(Settings.isPressed, isPressed);
    };

})(jQuery);