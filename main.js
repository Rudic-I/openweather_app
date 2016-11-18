var api = "http://api.openweathermap.org/data/2.5/forecast/daily?APPID=dbf6c155e73cf512bb7ff0949aa4095e&cnt=8&units=metric";
var url;
var lat;
var lon;
var output = $("#geo_output");
var map;
var address;
var temperaturesDiv = $("#temperatures_div");
var f = $("#f");
var c = $("#c");
var minTemp = [];
var maxTemp = [];
var dateChart = [];
var dateFormatted = [];
var iconCode;
var icon = [];
var degree = String.fromCharCode(176);

window.onload = function(){
    getGeolocation();
    initialize();
};

function getGeolocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoords, showError);
    }  
    else {
        output.html("Geolocation is not supported by this browser. Please choose location.");
    }
};

function getCoords(position) {
    lat = "&lat=" + position.coords.latitude;
    lon = "&lon=" + position.coords.longitude; 
    url = api + lon + lat;
    getApi();
};

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            output.text("User denied the request for Geolocation. Please choose location.");
            break;
        case error.TIMEOUT:
            output.text("The request to get user location timed out. Please choose location.");
            break;
        case error.UNKNOWN_ERROR:
            output.text("An unknown error occurred. Please choose location.");
            break;
        default:
            output.text("Location information is unavailable. Please choose location.");
    }
};

function initialize() {
    map = new google.maps.Map(document.getElementById('map'));

    var input = document.getElementById("input");
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo("bounds", map);

    google.maps.event.addListener(autocomplete, 'place_changed', function(){
        var place = autocomplete.getPlace();
        address = place.formatted_address;
        lat = "&lat=" + place.geometry.location.lat(),
        lon = "&lon=" + place.geometry.location.lng();
        url = api + lon + lat;
        getApi();
    });
};

function getApi(){
    $.ajax({
        url: url,
        method: "GET"
    }).done(getWeather);
};

function getWeather(data){
    output.empty();
    temperaturesDiv.empty();
    var city = $("#city");
    if(address) {
        city.text(address);
    }
    else {
        city.text(data.city.name + ", " + data.city.country);
    }
    city.addClass("city_text_box");        
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                "Oct", "Nov", "Dec"];

    for(var i = 0; i < data.cnt; i++) {
        var dateInSeconds = data.list[i].dt;
        var dateFull = new Date(dateInSeconds * 1000);
        var day = dateFull.getDate();
        var month = dateFull.getMonth();
        dateFormatted[i] = day + ". " + months[month];
        maxTemp[i] = Math.round(data.list[i].temp.max);
        minTemp[i] = Math.round(data.list[i].temp.min);
        iconCode = data.list[i].weather[0].icon;
        icon[i] = $("<img src='http://openweathermap.org/img/w/" + iconCode + ".png'>");
            
        var dayTemp = $("<ul></ul>");
        var dayIcon = $("<li></li>");
            dayTemp.html('<li class="date_box">'+ dateFormatted[i] +'</li>' + 
                    '<li class="t_box">'+ maxTemp[i] + degree + ' C</li>');
            dayIcon.html(icon[i]);
            dayTemp.append(dayIcon);
            dayTemp.addClass("dnevna_t"+i);
        temperaturesDiv.append(dayTemp);
    }
    chart();
};

f.click(weatherToFahrenheit);
function weatherToFahrenheit() {
    temperaturesDiv.empty();
    c.addClass("t_unit_btn");
    f.removeClass("t_unit_btn");
    f.addClass("hidden");
    for(i in maxTemp){
        var dayTemp = $("<ul></ul>");
        var dayIcon = $("<li></li>");
        maxTemp[i] = Math.round(maxTemp[i] * 9 / 5 + 32);
        minTemp[i] = Math.round(minTemp[i] * 9 / 5 + 32);
        dayTemp.html('<li class="date_box">'+ dateFormatted[i] +'</li>' + 
                    '<li class="t_box">'+ maxTemp[i] + degree + ' F</li>');
        dayIcon.html(icon[i]);
        dayTemp.append(dayIcon);
        dayTemp.addClass("dnevna_t"+i);
        temperaturesDiv.append(dayTemp);
    }
    chart();
};

c.click(weatherToCelsius);
function weatherToCelsius() {
    temperaturesDiv.empty();
    c.removeClass("t_unit_btn");
    c.addClass("hidden");
    f.removeClass("hidden");
    f.addClass("t_unit_btn");
    for(i in maxTemp){
        var dayTemp = $("<ul></ul>");
        var dayIcon = $("<li></li>");
        maxTemp[i] = Math.round((maxTemp[i] - 32) * 5 / 9);
        minTemp[i] = Math.round((minTemp[i] - 32) * 5 / 9);
        dayTemp.html('<li class="date_box">'+ dateFormatted[i] +'</li>' + 
                    '<li class="t_box">'+ maxTemp[i] + degree + ' C</li>');
        dayIcon.html(icon[i]);
        dayTemp.append(dayIcon);
        dayTemp.addClass("dnevna_t"+i);
        temperaturesDiv.append(dayTemp);
    }
    chart();
};

function chart() {
    $('#container').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: 'Min/Max Temperatures'
        },
        xAxis: {
            categories: dateFormatted.slice(1)
        },
        yAxis: {
            title: {
                text: 'Temperature'
            }
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [{
            name: 'Max',
            data: maxTemp.slice(1)
        }, {
            name: 'Min',
            data: minTemp.slice(1)
        }]
    });
};

var chartWrap = $("#chart_wrap");
var chartOn = $("#show_chart_btn");
    chartOn.click(showChart);
var chartOff = $("#hide_chart_btn");
    chartOff.click(hideChart);

function showChart(){
    chartWrap.removeClass("hidden");
    chartWrap.addClass("chart_show");
    chartOn.removeClass("chart_btn");
    chartOn.addClass("hidden");
    chartOff.removeClass("hidden");
    chartOff.addClass("chart_btn");
};

function hideChart(e){
    chartWrap.removeClass("chart_show");
    chartWrap.addClass("hidden");
    chartOff.removeClass("chart_btn");
    chartOff.addClass("hidden");
    chartOn.removeClass("hidden");
    chartOn.addClass("chart_btn");
};