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
        setData: function ($newSelect, data) {
            $newSelect
                .data("value", data.value)
                .data("html", data.innerHTML)
                .children("." + Settings.selectText)
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
                selectWidth: 200,
                selectCssClass: "new-select",
                selectIsShowTitle: false,
                selectIconContent: "",
                optionsListScrollHeight: 300,
                beforeSelectOpen: function (newSelect, data) {},
                beforeSelectClose: function (newSelect, data) {}
            }, params);

            Settings.body = $(document.body);
            Settings.$optionsList = $("<div />").attr({"class": Settings.optionsList});

            Settings.body.append(Settings.$optionsList)
                .on("click.selectbox", ("." + Settings.select), clickOnSelect)
                .on("mousedown.selectbox mouseup.selectbox", ("." + Settings.select), switchPressedState)
                .on("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);

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
        var newSelectCssClass = $originalSelect.data("css-class") ? [$originalSelect.data("css-class"), Options.selectCssClass].join(" ") : Options.selectCssClass;
        var $newSelect = $("<span />").addClass(Settings.select);
        var $newSelectText = $("<span />").addClass(Settings.selectText);
        var $newSelectIcon = $("<span />").addClass(Settings.selectIcon).html(Options.selectIconContent);

        $newSelect
            .addClass(newSelectCssClass)
            .append($newSelectText)
            .append($newSelectIcon)
            .insertAfter($originalSelect.hide());

        var selectedOption = $originalSelect[0][$originalSelect.prop("selectedIndex")];
        Settings.setData($newSelect, selectedOption);

        setSelectWidth($newSelect, $originalSelect);
    };

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

    function clickOnSelect() {
        var $select = $(this);
        if ($select.hasClass(Settings.selectIsOpen)) {
            closeSelect($select);
        } else {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
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
        $origSelect.trigger("beforeSelectOpen", [$select, data]);
        Options.beforeSelectOpen.apply($origSelect, [$select, data]);
        buildingOptionsList($select);
        Settings.body.on("click.selectbox", clickOnBody)
            .on("keyup.selectbox", keypressEsc);
    };

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

        if (optionsList.height > Options.optionsListScrollHeight) {
            finalDimensions.height = Options.optionsListScrollHeight;
            finalDimensions.isNeedScrollbar = true;
        }

        if (selectWidth > optionsList.width) {
            finalDimensions.width = selectWidth;
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

    function clickOnOptionsListItem() {
        var $optionsListItem = $(this);
        var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
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
        $origSelect.trigger("beforeSelectClose", [$select, data]);
        Options.beforeSelectClose.apply($origSelect, [$select, data]);
        $select.removeClass(Settings.selectIsOpen);
        Settings.$optionsList.hide()
            .empty()
            .removeAttr("style")
            .off("click.selectbox", ("." + Settings.optionsListItem), clickOnOptionsListItem);
        $(document.body).off("click.selectbox", clickOnBody)
            .off("keyup.selectbox", keypressEsc);
    };

    function clickOnBody(e) {
        var $clickedElem = $(e.target);
        var $parentElem = $clickedElem.parent();
        var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
        if ($parentElem.prop("nodeName").toLowerCase() == "body" || $parentElem.attr("class") == undefined) {
            closeSelect($selectOpen);
        } else {
            if (!($parentElem.hasClass(Settings.select) || $parentElem.hasClass(Settings.optionsList)))
                closeSelect($selectOpen);
        }
    };

    function keypressEsc(e) {
        console.log(e.keyCode);
        if (e.keyCode == 27) {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.selectIsOpen);
            closeSelect($selectOpen);
        }
    }

    function checkIsNeedTitle($newSelect, newSelectWidth) {
        var newSelectText = Settings.getData($newSelect).text;
        var newSelectTextWidth = Settings.getWidthText(newSelectText);
        if (Options.selectIsShowTitle && newSelectTextWidth > newSelectWidth)
            $newSelect.attr("title", newSelectText);
        else
            $newSelect.removeAttr("title");
    };

    function switchPressedState(e) {
        var $newSelect = $(this);
        var isPressed = (e.type == "mousedown");
        $newSelect.toggleClass(Settings.selectIsPressed, isPressed);
    };

})(jQuery);