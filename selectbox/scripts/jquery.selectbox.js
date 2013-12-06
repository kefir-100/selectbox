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
                    text: "select-text",
                    icon: "select-icon",
                    list: "select-list",
                    item: "select-item"
                },
                beforeOpen: function (newSelect, data) {},
                afterClose: function (newSelect, data) {}
            }, params);
            Settings.doc = $(document);
            Settings.body = $(document.body);

            if (Settings.$optionsList == undefined) {
                Settings.$optionsList = $("<div />").addClass(Settings.list).appendTo(Settings.body);
                Settings.doc.on("click.selectbox", ("." + Settings.select), clickOnSelect)
                    .on("mousedown.selectbox mouseup.selectbox", ("." + Settings.select), switchPressedState)
                    .on("click.selectbox", ("." + Settings.item), clickOnOptionsListItem);
            }

            return this.filter("select")
                .on("change", changeOriginalSelect)
                .each(eachOriginalSelect);
        },
        remove: function () {
            return this.filter("select")
                .each(function (index, element) {

                });
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
        var selectData = {
            classOfList: Options.classes.list,
            classOfItem: Options.classes.item,
            beforeOpen: Options.beforeOpen,
            afterClose: Options.afterClose
        };
        var $newSelect = $("<span />")
            .addClass([Settings.select, Options.classes.select].join(" "))
            .prop("selectData", selectData);
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
        var beforeOpenFunc = $select.prop("selectData").beforeOpen;
        $origSelect.trigger("beforeOpen", [$select, data]);
        beforeOpenFunc.apply($origSelect, [$select, data]);
        buildingOptionsList($select);
        Settings.doc.on("click.selectbox", clickOnBody)
            .on("keyup.selectbox", keypressEsc);
    };

    function buildingOptionsList($newSelect) {
        var $originalSelect = $newSelect.prev();
        var selectData = $newSelect.prop("selectData");
        $newSelect.addClass(Settings.isOpen);
        $originalSelect.children().each(function (index, element) {
            var $option = $(element);
            var html = $option.html();
            var value = $option.val();
            var $optionsListItem = $("<li />").addClass([Settings.item, selectData.classOfItem].join(" ")).data("value", value).html(html);
            if ($option.is(":selected")) $optionsListItem.addClass(Settings.isSelected);
            Settings.$optionsList.append($optionsListItem);
        });
        Settings.$optionsList.addClass(selectData.classOfList);
        setDimensionsOptionsList($newSelect);
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
        setPositionOptionsList($select);
    };

    function setPositionOptionsList($select) {
        var $selectOffset = $select.offset();
        var selectHeight = $select.outerHeight();
        var scrollTop = Settings.body.scrollTop();
        var realHeight = Settings.doc.height() + scrollTop;
        var optionsListHeight = Settings.$optionsList.outerHeight();
        var position = {
            left:$selectOffset.left,
            top: $selectOffset.top + selectHeight + scrollTop
        };
        if (position.top + optionsListHeight > realHeight) {
            position.top = position.top - selectHeight - optionsListHeight;
        }
        Settings.$optionsList.offset(position).show();
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
        var afterCloseFunc = $select.prop("selectData").afterClose;
        $select.removeClass(Settings.isOpen);
        Settings.$optionsList
            .hide()
            .empty()
            .removeAttr("style")
            .removeClass($select.prop("selectData").classOfList)
            .off("click.selectbox", ("." + Settings.item), clickOnOptionsListItem);
        Settings.doc.off("click.selectbox", clickOnBody)
            .off("keyup.selectbox", keypressEsc);

        $origSelect.trigger("afterClose", [$select, data]);
        afterCloseFunc.apply($origSelect, [$select, data]);
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