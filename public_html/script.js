/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

function changeStart() {
    var input = document.getElementById("startDate");
    input.type = "date";
    input.style.backgroundColor = "white";
}

function changeEnd() {
    var input = document.getElementById("endDate");
    input.type = "date";
    input.style.backgroundColor = "white";
}

function sendDate() {
    /*
     * send data function
     */
}

/*
 * keep the footer down
 * 
 */
$(window).scroll(function() {
    if ($(this).scrollTop() < 100) {
        $(".footer").hide();
    }
    else {
        $(".footer").show();
    }
});
  