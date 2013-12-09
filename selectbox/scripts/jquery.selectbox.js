(function ($) {
    var Options, Database = {}, Settings = {
        select: "ui-select",
        text: "ui-select-text",
        icon: "ui-select-icon",
        list: "ui-select-list",
        item: "ui-select-item",
        isOpen: "open",
        isPressed: "pressed",
        isSelected: "selected",
        $openSelect: null,
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

    function ClassCreateSelect(uniqueId, data) {
        var select, selectText, selectIcon, getSetData;
        this.select = select = $("<span />");
        this.selectText = selectText = $("<span />");
        this.selectIcon = selectIcon = $("<span />");
        this.cssClassOfList = Options.classes.list;
        this.cssClassOfItem = Options.classes.item;
        this.beforeOpenFunc = Options.beforeOpen;
        this.afterCloseFunc = Options.afterClose;
        this.getSetData = getSetData = function (data) {
            var result;
            if (data == undefined) {
                result = {
                    value: selectText.data("value"),
                    html: selectText.html()
                };
            } else {
                result = selectText.data("value", data.value).html(data.innerHTML);
            }
            return result;
        };
        select.addClass([Settings.select, Options.classes.select].join(" ")).prop("uniqueId", uniqueId);
        selectText.addClass([Settings.text, Options.classes.text].join(" "));
        selectIcon.addClass([Settings.icon, Options.classes.icon].join(" ")).html(Options.contentOfIcon);
        getSetData(data);
        select.append(selectText).append(selectIcon);
    };

    function GetClassOfSelect($select) {
        var uniqueId = $select.prop("uniqueId");
        return Database[uniqueId];
    };

    function changeOriginalSelect(e) {
        if (e.isChangeFromPluginSelectBox == undefined) {
            var $origSelect = $(this);
            var $newSelect = $origSelect.next("." + Settings.select);
            var select = GetClassOfSelect($newSelect);
            var selectedOption = $origSelect[0][$origSelect.prop("selectedIndex")];
            select.getSetData(selectedOption);
        }
    }

    function eachOriginalSelect(index, element) {
        var $origSelect = $(element);
        if ($origSelect.next().hasClass(Settings.select)) return;
        var selectedOption = $origSelect[0][$origSelect.prop("selectedIndex")];
        var uniqueId = "id" + (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000);
        var newSelect = new ClassCreateSelect(uniqueId, selectedOption);
        Database[uniqueId] = newSelect;

        newSelect.select.insertAfter($origSelect.hide());

        setSelectWidth(newSelect.select, $origSelect);
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
        var $newSelect = $(this);
        var select = GetClassOfSelect($newSelect);
        if ($newSelect.hasClass(Settings.isOpen)) {
            closeSelect($newSelect, select);
        } else {
            var $selectOpen = $("." + Settings.select).filter("." + Settings.isOpen);
            if ($selectOpen.length > 0) {
                closeSelect($selectOpen, select);
            } else {
                openSelect($newSelect, select);
            }
        }
        return false;
    };

    function openSelect($newSelect, select) {
        var elements = {
            $newSel: $newSelect,
            $origSel: $newSelect.prev()
        };
        var data = select.getSetData();

        Settings.$openSelect = elements.$newSel;
        Settings.$openSelect.addClass(Settings.isOpen);

        elements.$origSel.trigger("beforeOpen", [elements.$newSel, data]);
        select.beforeOpenFunc.apply(elements.$origSel, [elements.$newSel, data]);

        buildingOptionsList(elements, select);
        Settings.doc.on("click.selectbox", clickOnBody)
            .on("keyup.selectbox", keypressEsc);
    };

    function buildingOptionsList(elements, select) {
        elements.$origSel.children().each(function (index, element) {
            var $option = $(element);
            var html = $option.html();
            var value = $option.val();
            var $optionsListItem = $("<li />");
            $optionsListItem.addClass([Settings.item, select.cssClassOfItem].join(" "))
                .data("value", value)
                .html(html);
            if ($option.is(":selected")) $optionsListItem.addClass(Settings.isSelected);
            Settings.$optionsList.append($optionsListItem);
        });
        Settings.$optionsList.addClass(select.cssClassOfList);
        setDimensionsOptionsList(elements);
    };

    function setDimensionsOptionsList(elements) {
        var widthOfSelect = elements.$newSel.outerWidth();
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
        setPositionOptionsList(elements);
    };

    function setPositionOptionsList(elements) {
        var $selectOffset = elements.$newSel.offset();
        var selectHeight = elements.$newSel.outerHeight();
        var bodyScrollTop = Settings.body.scrollTop();
        var realHeight = Settings.doc.height() + bodyScrollTop;
        var optionsListHeight = Settings.$optionsList.outerHeight();
        var position = {
            left:$selectOffset.left,
            top: $selectOffset.top + selectHeight + bodyScrollTop
        };
        if (position.top + optionsListHeight > realHeight) {
            position.top = position.top - selectHeight - optionsListHeight;
        }
        Settings.$optionsList.offset(position).show();
    };

    function clickOnOptionsListItem() {
        var $optionsListItem = $(this);
        var select = GetClassOfSelect(Settings.$openSelect);
        var data = {
            value: $optionsListItem.data("value"),
            innerHTML: $optionsListItem.html()
        };
        select.getSetData(data);
        Settings.$openSelect.prev().val(data.value).trigger({type: "change", isChangeFromPluginSelectBox: true});
        checkIsNeedTitle(Settings.$openSelect, Settings.$openSelect.width());
        closeSelect(Settings.$openSelect, select);
        return false;
    };

    function closeSelect($openSelect, select) {
        var $origSelect = $openSelect.prev();
        var data = select.getSetData();
        $openSelect.removeClass(Settings.isOpen);
        Settings.$optionsList
            .hide()
            .empty()
            .removeAttr("style")
            .removeClass(select.cssClassOfList)
            .off("click.selectbox", ("." + Settings.item), clickOnOptionsListItem);
        Settings.doc.off("click.selectbox", clickOnBody)
            .off("keyup.selectbox", keypressEsc);

        $origSelect.trigger("afterClose", [$openSelect, data]);
        select.afterCloseFunc.apply($origSelect, [$openSelect, data]);
    };

    function clickOnBody(e) {
        var $clickedElem = $(e.target);
        var $parentElem = $clickedElem.parent();
        var $openSelect = Settings.$openSelect ? Settings.$openSelect : $("." + Settings.select).filter("." + Settings.isOpen);
        var select = GetClassOfSelect($openSelect);
        if ($parentElem.prop("nodeName").toLowerCase() == "body" || $parentElem.attr("class") == undefined) {
            closeSelect($openSelect, select);
        } else {
            if (!($parentElem.hasClass(Settings.select) || $parentElem.hasClass(Settings.list)))
                closeSelect($openSelect, select);
        }
    };

    function keypressEsc(e) {
        if (e.keyCode == 27) {
            var $openSelect = Settings.$openSelect ? Settings.$openSelect : $("." + Settings.select).filter("." + Settings.isOpen);
            var select = GetClassOfSelect($openSelect);
            closeSelect($openSelect, select);
        }
    }

    function checkIsNeedTitle($select, selectWidth) {
        if (Options.isShowTitle) {
            var select = GetClassOfSelect($select);
            var selectText = select.getSetData().html;
            var selectTextWidth = Settings.getWidthText(selectText);
            if (Options.isShowTitle && selectTextWidth > selectWidth)
                $select.attr("title", selectText);
            else
                $select.removeAttr("title");
        }
    };

    function switchPressedState(e) {
        var $select = $(this);
        var isPressed = (e.type == "mousedown");
        $select.toggleClass(Settings.isPressed, isPressed);
    };

})(jQuery);