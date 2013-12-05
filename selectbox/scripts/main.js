$(function () {
    $(".JsSelect").selectbox({
        widthOfSelect: 150,
        contentOfIcon: "&#9660;",
        isShowTitle: false,
        heightOfList: 300,
        classes: {
            select: "my-select",
            text: "my-text",
            icon: "my-icon",
            list: "my-list",
            item: "my-item"
        },
        beforeOpen: function (newSelect, data) {
            var obj = {
                select: newSelect,
                value: data.value,
                text: data.text,
                self: this,
                from: "plugin init func \"beforeSelectOpen\""
            };
            //console.log(obj);
        },
        beforeClose: function (newSelect, data) {
            var obj = {
                select: newSelect,
                value: data.value,
                text: data.text,
                self: this,
                from: "plugin init func \"beforeSelectClose\""
            };
            //console.log(obj);
        }
    })
        .on("beforeOpen", function (e, newSelect, data) {
            var obj = {
                select: newSelect,
                value: data.value,
                text: data.text,
                event: e,
                self: this,
                from: "handler func \"beforeSelectOpen\""
            };
            //console.log(obj);
    })
        .on("beforeClose", function (e, newSelect, data) {
            var obj = {
                select: newSelect,
                value: data.value,
                text: data.text,
                event: e,
                self: this,
                from: "handler func \"beforeSelectClose\""
            };
            //console.log(obj);
        });

    $(".JsSelect2").selectbox({
        widthOfSelect: 300,
        isShowTitle: false,
        heightOfList: 400,
        classes: {
            select: "long-select",
            text: "long-text",
            icon: "long-icon",
            list: "long-list",
            item: "long-item"
        }
    });

    $(".JsSelect3").selectbox({
        widthOfSelect: 70,
        isShowTitle: true,
        heightOfList: 200,
        classes: {
            select: "long-select",
            text: "long-text",
            icon: "long-icon",
            list: "long-list",
            item: "long-item"
        }
    });
});