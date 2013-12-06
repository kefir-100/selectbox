$(function () {
    // Инициализируем плагин
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
            console.log("beforeOpen " + data.text + " " + data.value);
        },
        afterClose: function (newSelect, data) {
            console.log("afterClose " + data.text + " " + data.value);
        }
    });

    // Подписываемся на custom события перед открытием и после закрытия
    $(".JsSelect").on("beforeOpen",function (event, newSelect, data) {
        // event - обычный event object
        // newSelect - новый псевдо select, по факту <span/>
        // data - объект которые содержит 2 свойства: текущие text и value
        // this - в данном случае будет ссылаться на оригинальный тег <select/>
        $(".JsTypeEvent").html("Событие перед открытием выпадающего списка");
        $(".JsValue").html("text: " + data.text + ", value: " + data.value);
    })
    .on("afterClose", function (event, newSelect, data) {
        // event - обычный event object
        // newSelect - новый псевдо select, по факту элемент <span/>
        // data - объект который содержит 2 свойства: текущие text и value
        // this - в данном случае будет ссылаться на оригинальный тег <select/>
        $(".JsTypeEvent").html("Событие после закрытия выпадающего списка");
        $(".JsValue").html("text: " + data.text + ", value: " + data.value);
    });

    // Инициализируем плагин
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
        beforeOpen: function (newSelect, data) {
            console.log("beforeOpen " + data.text + " " + data.value);
        },
        afterClose: function (newSelect, data) {
            console.log("afterClose " + data.text + " " + data.value);
        }
    });

    // Инициализируем плагин
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