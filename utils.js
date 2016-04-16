
function asLetter(i) {
    return String.fromCharCode("A".charCodeAt(0) + i);
};

function getUrlParameter(sParam, def) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }

    return def;
};

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function DefaultNumber(num, def) {
    return typeof(num) === "number" && !isNaN(num) ? num : def;
};

var seed = 123896;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

Array.prototype.randomElement = function() {
    return this[Math.floor(Math.random()*this.length)];
};

Array.prototype.last = function(i) {
    i = i || 0;
    return this[this.length - i - 1];
};

Array.prototype.removeElement = function(item) {
    var index = this.indexOf(item);

    if(index > -1) {
        this.splice(index, 1);
    }
};

$print = undefined;
function print(str) {
    if($print) {
        $print.append(
            $("<li>").html(str)
        );
    }
};

function clearPrint() {
    if($print) {
        $print.html("");
        $selectedInfo.html("");
    }
};

function formatInfo(info) {
    return String("<h2>" + info.title + "</h2><pre>" + JSON.stringify(info.data, null, 4) + "</pre>");
};

// Least Common Multiple
function LCM(arr) {
    var min, range;
    var range = arr;
    if(arr[0] > arr[1]) {
       min = arr[1];
    }
    else{
       min = arr[0]
    }

    function gcd(a, b) {
        return !b ? a : gcd(b, a % b);
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);
    }

   var multiple = min;
    range.forEach(function(n) {
       multiple = lcm(multiple, n);
    });

   return multiple;
};

/*
 * Returns the list of divisors (in ascending order) of the given integer.
 * Examples:
 *   divisorList(1) = [1]
 *   divisorList(5) = [1, 5]
 *   divisorList(12) = [1, 2, 3, 4, 6, 12]
 */
function divisors(n) {
    if (n < 1)
        throw "Argument error";

    var small = [];
    var large = [];
    var end = Math.floor(Math.sqrt(n));
    for (var i = 1; i <= end; i++) {
        if (n % i == 0) {
            small.push(i);
            if (i * i != n)  // Don't include a square root twice
                large.push(n / i);
        }
    }
    large.reverse();
    return small.concat(large);
}
