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
        units = "&units=imperial";
        chooseLocation();
    };

    c.click(celsius);
    function celsius() {
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
            var tempFormatted = Math.floor(data.list[i].temp.day);
            var iconCode = data.list[i].weather[0].icon;
            var icon = $("<img src='http://openweathermap.org/img/w/" + iconCode + ".png'>");
            if (units === "&units=metric") {
                dayTemp.html("<li>"+dateFormatted+"</li>" + 
                            "<li>"+tempFormatted+degree+" C</li>") 
            }
            if (units === "&units=imperial") {
                dayTemp.html("<li>"+dateFormatted+"</li>" + 
                            "<li>"+tempFormatted+degree+" F</li>") 
            }
            dayIcon.html(icon);
            dayTemp.append(dayIcon);
            dayTemp.addClass("dnevna_t " + ("dnevna_t"+i));
            temperaturesDiv.append(dayTemp);

            minTemp[i] = data.list[i].temp.min;
            maxTemp[i] = data.list[i].temp.max;
            dateChart[i] = dateFormatted;
        }
        showChart();
    }
    function showChart() {
        $('#container').highcharts({
            chart: {
                type: 'line'
            },
            title: {
                text: 'Min/Max Temperatures'
            },
            xAxis: {
                categories: dateChart
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
                data: maxTemp
            }, {
                name: 'Min',
                data: minTemp
            }]
        });
    }
}