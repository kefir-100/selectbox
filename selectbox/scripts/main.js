$(function () {
    /*
     $(".JsSelect").selectbox({
        // width of new select
        widthOfSelect: 200, // number (150) || number + percents (1-100%) || string ("auto")
        // show or not tooltip text if text is too long and not displayed
        isShowTitle: false, // true || false
        // content of icon element
        contentOfIcon: "", // text or html string
        // height of drop down list
        heightOfList: 300, // number
        // css classes of elements
        classes: {
            select: "select",
            text: "select-text",
            icon: "select-icon",
            list: "select-list",
            item: "select-item"
        },
        // call back function before open select
        beforeOpen: function (newSelect, data) {
            // newSelect - new pseudo select element (<span />)
            // data = {html: html of newSelect, value: value of newSelect}
            // this = original <select/>
        },
        // call back function after close select
        afterClose: function (newSelect, data) {
            // newSelect - new pseudo select element (<span />)
            // data = {html: html of newSelect, value: value of newSelect}
            // this = original <select/>
        }
     });
    */

    // initialize
    $(".JsSelect").selectbox({
        widthOfSelect: 70,
        contentOfIcon: "&#9660;",
        isShowTitle: true,
        heightOfList: 300,
        classes: {
            select: "simple-select",
            text: "simple-select-text",
            icon: "simple-select-icon",
            list: "simple-select-list",
            item: "simple-select-item"
        },
        beforeOpen: function (newSelect, data) {
            console.log("beforeOpen " + data.html + " " + data.value);
        },
        afterClose: function (newSelect, data) {
            console.log("afterClose " + data.html + " " + data.value);
        }
    });

    // add event handler before open new pseudo select
    $(".JsSelect").on("beforeOpen",function (event, newSelect, data) {
        // event - jQuery event object
        // newSelect - new pseudo select element (<span />)
        // data = {html: html of newSelect, value: value of newSelect}
        // this = original <select/>
        $(".JsTypeEvent").html("Event before open <select />");
        $(".JsValue").html("data = {html: " + data.html + ", value: " + data.value + "}");
    })
    // add event handler after close new pseudo select
    .on("afterClose", function (event, newSelect, data) {
        // event - jQuery event object
        // newSelect - new pseudo select element (<span />)
        // data = {html: html of newSelect, value: value of newSelect}
        // this = original <select/>
        $(".JsTypeEvent").html("Event after close <select />");
        $(".JsValue").html("data = {html: " + data.html + ", value: " + data.value + "}");
    });

    // initialize
    $(".JsSelect2").selectbox({
        widthOfSelect: 300,
        isShowTitle: false,
        heightOfList: 400,
        classes: {
            select: "long-select",
            text: "long-select-text",
            icon: "long-select-icon",
            list: "long-select-list",
            item: "long-select-item"
        },
        // add event handler before open new pseudo select
        beforeOpen: function (newSelect, data) {
            console.log("beforeOpen " + data.html + " " + data.value);
        },
        // add event handler after close new pseudo select
        afterClose: function (newSelect, data) {
            console.log("afterClose " + data.html + " " + data.value);
        }
    });

    // initialize
    $(".JsSelect3").selectbox({
        widthOfSelect: 150,
        isShowTitle: true,
        heightOfList: 200,
        classes: {
            select: "middle-select",
            text: "middle-select-text",
            icon: "middle-select-icon",
            list: "middle-select-list",
            item: "middle-select-item"
        }
    });
});