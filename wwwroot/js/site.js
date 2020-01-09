// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


if (window.location.href.indexOf("Home/Disclaimer") > -1) {

    $('.select-style').addClass('hidden');
    $('.search').addClass('hidden');
} else {
    getEmbassyInformation("nederland");
    getLocation();
}


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(useLocation);
    } 
    
};

function populateSelectBox(originalCountryName, countryName) {
    
    var $dropdown = $("#dropdown");
    
    //$dropdown.append('<option value="currentLocation">Huidige locatie</option>');
    $dropdown.append($("<option />").val(countryName).text(originalCountryName));
    //console.log(originalCountryName);
    $('.search-results').append("<div class='search-country hidden' attr-country-name='" + countryName+"'>" + originalCountryName + "</div>");
}

$("#dropdown").change(function () {
    $('.close-btn').removeClass('active');
    $('.search-bar').removeClass('active');
    $('.search-bar').val('');
    if ($("#dropdown").children("option").filter(":selected").val() == "currentLocation") {
        getLocation();
    } else {
        
        getEmbassyInformation($(this).val());
    }
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

$('.search-bar').focus(function () {
    $('.search-bar').val('');
    $('.close-btn').removeClass('active');
    $('.search-bar').removeClass('active');
    $(".search-country").addClass('hidden');
});

$('.close-btn').click(function () {
    $('.search-bar').val('');
    $('.search-bar').focus();
    
});

$('.search-bar').keyup(function () {
    $('.search-bar').addClass('active');
    $('.close-btn').addClass('active');
    var searchWord = $(this).val().toLowerCase();
    $(".search-country").addClass('hidden');
    $(".search-country").each(function () {
        var countryName = $(this).text().toLowerCase();
        if (countryName.indexOf(searchWord) !== -1) {
            $(this).removeClass('hidden');
        }
    });

    if ($(this).val() != "") {
       
        $('.navbar .search .search-bar').css('background-image', 'url("../images/police_icon.png") !important;')
    }
});

$(document).on('click', '.search-country', function () {
    var countryName = $(this).attr('attr-country-name');
    $('.search-bar').val($(this).text());
    $(".search-country").addClass('hidden');


    $(".pb-3").fadeOut(50, function () {
        getEmbassyInformation(countryName);
        $('.pb-3').fadeIn(50);
    });

});

var fire_number;
var police_number;
var ambulance_number;
var embassy_number;
var embassy_email;
var opening_hours_embassy;
var name_embassador;
var address_embassy;


function getEmbassyInformation(countryName) {

    $('.search-country').remove();

    $.getJSON("/Data/embassies.json", function (mydata) {
        //console.log(mydata);
        var embassies = mydata.embassies;
        //console.log('countryname = '+countryName);
        $.each(embassies, function (i, item) {
            
            //
            populateSelectBox(item.original_country_name, item.country_name);
            if (item.country_name == countryName) {

                $('.country-name').html(item.original_country_name + ' (' + item.country_number + ')');

                fire_number = item.fire.split("\n")[0];
                police_number = item.police.split("\n")[0];
                ambulance_number = item.ambulance.split("\n")[0];
                embassy_number = item.phone_embassy.split("\n")[0];
                embassy_email = findEmailAddresses(item.e_mail_embassy);
                opening_hours_embassy = item.opening_hours_embassy;
                name_embassador = item.name_embassador;
                address_embassy = item.address_embassy;

                exceptions(countryName);

                $('.fire-dept .number').html(fire_number);
                $('.fire-dept').attr('href', 'tel:' + fire_number);

                
                $('.police-dept .number').html(police_number);
                $('.police-dept').attr('href', 'tel:' + police_number);


                
                $('.ambulance-dept .number').html(ambulance_number);
                $('.ambulance-dept').attr('href', 'tel:' + ambulance_number);



                $('.embassy-dept .number').html(embassy_number);
                $('.embassy-dept').attr('href', 'tel:' + embassy_number);


     
                console.log("item_embassy_email: " + item.embassy_email);

                if (embassy_email !== undefined && embassy_email != "") {
                    
                } else {
                    embassy_email = "";
                }
                console.log("embassy_email: " + embassy_email);

                if (embassy_email != "") {
                    $('.e-mail').parent().css('display', 'block');
                } else {
                    $('.e-mail').parent().css('display', 'none');
                    //console.log('opening_hours_embassy empty');
                }

                
                if (item.opening_hours_embassy != "") {
                    $('.opening-times').parent().css('display', 'block');
                } else {
                    $('.opening-times').parent().css('display', 'none');
                    //console.log('opening_hours_embassy empty');
                }

                
                if (item.name_embassador != "") {
                    $('.name-embassador').parent().css('display', 'block');
                } else {
                    $('.name-embassador').parent().css('display', 'none');
                    //console.log('name_embassador empty');
                }

                
                if (item.address_embassy != "") {
                    $('.address-embassy').parent().css('display', 'block');
                    
                    //$('#map').css('display', 'block');
                } else {
                    $('.address-embassy').parent().css('display', 'none');
                    //$('#map').css('display', 'none');
                    //console.log('address_embassy empty');
                }

                console.log("embassy_email: " + embassy_email);
                console.log("opening_hours_embassy: " + item.opening_hours_embassy);
                console.log("name_embassador: " + item.name_embassador);
                console.log("address_embassy: " + item.address_embassy);


                if (embassy_email == "" && item.opening_hours_embassy == "" && item.name_embassador == "" && item.address_embassy == "") {
                    $('.no-info').parent().removeClass('hidden');
                    $('.no-info').html('Helaas is er geen ambassade informatie beschikbaar voor dit land.');
                } else {
                    $('.no-info').parent().addClass('hidden');
                }


                $('.e-mail').html('<a href="mailto:' + embassy_email + '">' + embassy_email+'</a>');
                $('.opening-times').html(item.opening_hours_embassy);
                $('.name-embassador').html(item.name_embassador);
                $('.address-embassy').html(item.address_embassy);
                $('.country-title-bar img').attr('src', item.flag.replace('23px', '100px'));

                var address = item.address_embassy;
               
                initMap(address + ',' +item.original_country_name);

            }
        });
        disableEmptyNumbers();
    });
    
    
    
};



function disableEmptyNumbers() {
    $('.number').each(function () {
        //console.log($(this).text());
        if ($(this).text() == "nvt" || $(this).text() == "") {
            $(this).parent().parent().addClass('disabled');
        } else {
            $(this).parent().parent().removeClass('disabled');
        }
    });
}

function useLocation(position) {
    
    console.log("lat: "+position.coords.latitude);
    console.log("long: "+ position.coords.longitude);

    if (!position.coords.latitude) {
        position.coords.latitude = 52.088012799999994;
        position.coords.longitude = 5.1757056;
    }

    $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&key=AIzaSyBCt_EBdFQETts8o0j34gox7GEC_ttnxTk&language=nl-NL', function (data) {
        //data is the JSON string
        // console.log(data.results[0].address_components);
        data.results[0].address_components
        var address_components = data.results[0].address_components;
        $.each(address_components, function (i, item) {

            $.each(item, function (x, subitem) {

                if (subitem[0] == "country") {
                    //console.log(item.long_name);
                    $('.country-name').html(item.long_name);
                    countryName = item.long_name.toLowerCase();
                    //countryName = "algerije";
                    getEmbassyInformation(countryName);
                }
            });
        });

    });

    
};


var geocoder;
var map;

function initMap(address) {
    //console.log(address);
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: { lat: -34.397, lng: 150.644 }
    });
    geocoder = new google.maps.Geocoder();
    codeAddress(geocoder, map, address);
}

function codeAddress(geocoder, map, address) {

    geocoder.geocode({ 'address': address }, function (results, status) {
        //console.log(results);
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}


function findEmailAddresses(StrObj) {
    console.log(StrObj);
    var separateEmailsBy = ", ";
    var email = ""; // if no match, use this
    var emailsArray = StrObj.match(/\b([^\s]+@[^\s]+)\b/g);
    console.log(emailsArray);

    if (emailsArray) {
        email = "";
        for (var i = 0; i < emailsArray.length; i++) {
            if (i != 0) email += separateEmailsBy;
            email += emailsArray[i];
        }
    }
    return email;
}

function exceptions(countryName) {

    if (countryName == "irak") {
        fire_number = "112";
        ambulance_number = "112";
        police_number = "112";
        embassy_number = "+9647833017583";
    }

    if (countryName == "amerikaanse maagdeneilanden") {
        fire_number = "911";
        ambulance_number = "911";
        police_number = "911";
    }

    if (countryName == "india") {
        fire_number = "100";
        ambulance_number = "102";
        police_number = "101";
    }

    if (embassy_number.indexOf('0800') !== -1) {
        embassy_number = "+6444716390";
    }
    if (countryName == "brunei darussalam") {
        fire_number = "993";
        ambulance_number = "991";
        police_number = "995";
    }
    

}

function sameHeight() {
    if ($(window).width() >= 992) {
        var height = $('.button-col').height();
        console.log(height);
        $('.embassy-information').height(height - 65);
    } else {
       // $('.embassy-information').height(150-65);
    }
}

sameHeight();
$(window).resize(function () {
    sameHeight();
});


lock('portrait-primary');

function fullScreen() {
    // Kind of painful, but this is how it works for now
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }
}

function smolScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function lock(orientation) {
    fullScreen();
    screen.orientation.lock(orientation);
}