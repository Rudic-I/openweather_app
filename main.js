var body = $("body");
var output = $("#geo_output");
var map;
var apiStatic = "http://api.openweathermap.org/data/2.5/forecast/daily?APPID=dbf6c155e73cf512bb7ff0949aa4095e&cnt=8";
var units = "&units=metric";
var url;
var lat;
var lon;
var temperaturesDiv;
var f = $("#f");
var c = $("#c");
var minTemp = [];
var maxTemp = [];
var dateChart = [];    

function initialize() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getCoords, showError);
    }  
    else {
        output.html("Geolocation is not supported by this browser. Please choose location.");
    }
    function getCoords(position) {
        var geoLat = "&lat=" + position.coords.latitude;
        var geoLon = "&lon=" + position.coords.longitude; 
        url = apiStatic + geoLon + geoLat + units;
        getApi();
    };
    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                output.text("User denied the request for Geolocation. Please choose location.")
                break;
            case error.POSITION_UNAVAILABLE:
                output.text("Location information is unavailable. Please choose location.")
                break;
            case error.TIMEOUT:
                output.text("The request to get user location timed out. Please choose location.")
                break;
            case error.UNKNOWN_ERROR:
                output.text("An unknown error occurred. Please choose location.")
                break;
        }
    };

    map = new google.maps.Map(document.getElementById('map'));

    var input = document.getElementById("input");
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo("bounds", map);

    google.maps.event.addListener(autocomplete, 'place_changed',function(){
        var place=autocomplete.getPlace();
        lat = place.geometry.location.lat(),
        lon = place.geometry.location.lng();

        chooseLocation();
    });

    f.click(fahrenheit);
    function fahrenheit() {
        c.addClass("t_unit_btn");
        f.removeClass("t_unit_btn");
        f.addClass("hidden");
        units = "&units=imperial";
        chooseLocation();
    };

    c.click(celsius);
    function celsius() {
        c.removeClass("t_unit_btn");
        c.addClass("hidden");
        f.removeClass("hidden");
        f.addClass("t_unit_btn");
        units = "&units=metric";
        chooseLocation();
    };

    function chooseLocation() {
        var userLat = "&lat="+lat;
        var userLon = "&lon="+lon;
        url = apiStatic + userLat + userLon + units;
        getApi();
    }

    function getApi(){
        $.ajax({
            url: url,
            method: "GET"
        }).done(getWeather);
    }

    function getWeather(data){
        body.addClass("background");
        var city = $("#city");
        city.text(data.city.name + ", " + data.city.country);
        city.addClass("city_text_box");
        var degree = String.fromCharCode(176);
        temperaturesDiv = $("#temperatures_div");
        temperaturesDiv.empty();
        
        var months = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep",
                        "Okt", "Nov", "Dec"];

        for(var i = 0; i < data.cnt; i++) {
            var dayTemp = $("<ul></ul>");
            var dayIcon = $("<li></li>");
            var dateInSeconds = data.list[i].dt;
            var dateFull = new Date(dateInSeconds * 1000);
            var day = dateFull.getDate();
            var month = dateFull.getMonth();
            var dateFormatted = day + ". " + months[month];
            var tempFormatted = Math.round(data.list[i].temp.max);
            var iconCode = data.list[i].weather[0].icon;
            var icon = $("<img src='http://openweathermap.org/img/w/" + iconCode + ".png'>");
            if (units === "&units=metric") {
                dayTemp.html('<li class="date_box">'+dateFormatted+'</li>' + 
                            '<li class="t_box">'+tempFormatted+degree+' C</li>') 
            }
            if (units === "&units=imperial") {
                dayTemp.html('<li class="date_box">'+dateFormatted+'</li>' + 
                            '<li class="t_box">'+tempFormatted+degree+' F</li>') 
            }
            dayIcon.html(icon);
            dayTemp.append(dayIcon);
            dayTemp.addClass("dnevna_t"+i);
            temperaturesDiv.append(dayTemp);

            minTemp[i] = Math.round(data.list[i].temp.min);
            maxTemp[i] = Math.round(data.list[i].temp.max);
            dateChart[i] = dateFormatted;
        }
        chart();
    }

    function chart() {
        $('#container').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: 'Min/Max Temperatures'
            },
            xAxis: {
                categories: dateChart.slice(1)
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
    }
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
    }
    function hideChart(e){
        chartWrap.removeClass("chart_show");
        chartWrap.addClass("hidden");
        chartOff.removeClass("chart_btn");
        chartOff.addClass("hidden");
        chartOn.removeClass("hidden");
        chartOn.addClass("chart_btn");
    }
}
