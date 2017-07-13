
/** START: Helpers **/
Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
    ].join('-');
};
/** END: Helpers **/

/** START: Graphs **/
function initGraphs() {
    function initPowerGraph() {
        var powerGraph = $('#power-bitcoin canvas');
        var ctx = powerGraph.get(0).getContext("2d");


        var powerChart = new Chart(ctx, {
            type: 'line',
            defaults: {
                global: {
                    elements: {
                        line: {
                            tension: 0
                        }
                    }
                }
            },
            data: {
                labels: ["2013", "2014", "2015", "2016", "2017"],
                datasets: [{
                    label: '',
                    data: [bitcoinYearly['2013'], bitcoinYearly['2014'], bitcoinYearly['2015'], bitcoinYearly['2016'], bitcoinYearly['2017']],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0)'
                    ],
                    borderColor: [
                        'rgba(43,253,180,1)'
                    ],
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0,
                    lineTension: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                bezierCurve: false,
                elements: {
                    line: {
                        tension: 0
                    }
                },
                legend: {
                    display: false
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: '#fff'
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            fontColor: '#fff'
                        }
                    }]
                },
                tooltips: {
                    enabled: false
                }
            }
        });
        //powerChart.canvas.parentNode.style.height = '95px';
        //powerChart.canvas.parentNode.style.width = '284px';
    }

    function init() {
        initPowerGraph();
    }

    init();
}
/** END: Graphs **/

/** START: Blackhole buttons for menu page **/

function blackhole(element) {
    var debugThisFile = true;
    var fname = 'global.js: ';

    if (debugThisFile) { console.log(fname, 'blackhole() called'); }

    var me = $(element);

    var h = $(element).height(),
	    w = $(element).width(),
	    cw = w,
	    ch = h,
	    maxorbit = 175, // distance from center
	    centery = ch / 2,
	    centerx = cw / 2;

    var startTime = new Date().getTime();
    var currentTime = 0;

    var stars = [],
	    collapse = false, // if hovered
	    expanse = false; // if clicked

    var canvas = $('<canvas/>').attr({ width: cw, height: ch }).appendTo(element),
	    context = canvas.get(0).getContext("2d");

    context.globalCompositeOperation = "multiply";

    function setDPI(canvas, dpi) {
        // Set up CSS size if it's not set up already
        if (!canvas.get(0).style.width)
            canvas.get(0).style.width = canvas.get(0).width + 'px';
        if (!canvas.get(0).style.height)
            canvas.get(0).style.height = canvas.get(0).height + 'px';

        var scaleFactor = dpi / 96;
        canvas.get(0).width = Math.ceil(canvas.get(0).width * scaleFactor);
        canvas.get(0).height = Math.ceil(canvas.get(0).height * scaleFactor);
        var ctx = canvas.get(0).getContext('2d');
        ctx.scale(scaleFactor, scaleFactor);
    }

    function rotate(cx, cy, x, y, angle) {
        var radians = angle,
		    cos = Math.cos(radians),
		    sin = Math.sin(radians),
		    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
		    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    setDPI(canvas, 192);

    var star = function () {

        var ratetweak = .125;

        // Get a weighted random number, so that the majority of stars will form in the center of the orbit
        var rands = [];
        rands.push(Math.random() * (maxorbit / 2) + 1);
        rands.push(Math.random() * (maxorbit / 2) + maxorbit);

        this.orbital = (rands.reduce(function (p, c) {
            return p + c;
        }, 0) / rands.length);
        // Done getting that random number, it's stored in this.orbital

        this.x = centerx; // All of these stars are at the center x position at all times
        this.y = centery + this.orbital; // Set Y position starting at the center y + the position in the orbit

        this.yOrigin = centery + this.orbital;  // this is used to track the particles origin

        this.speed = (Math.floor(Math.random() * 2.5 * ratetweak) + 1.5) * Math.PI / 180; // The rate at which this star will orbit
        this.rotation = 0; // current Rotation
        this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180; // Starting rotation.  If not random, all stars will be generated in a single line.  

        this.id = stars.length;  // This will be used when expansion takes place.

        this.collapseBonus = this.orbital - (maxorbit * 0.7); // This "bonus" is used to randomly place some stars outside of the blackhole on hover
        if (this.collapseBonus < 0) { // if the collapse "bonus" is negative
            this.collapseBonus = 0; // set it to 0, this way no stars will go inside the blackhole
        }

        stars.push(this);
        this.color = 'rgba(255,255,255,' + (1 - ((this.orbital) / 255)) + ')'; // Color the star white, but make it more transparent the further out it is generated

        this.hoverPos = centery + (maxorbit / 2) + this.collapseBonus;  // Where the star will go on hover of the blackhole
        this.expansePos = centery + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1); // Where the star will go when expansion takes place


        this.prevR = this.startRotation;
        this.prevX = this.x;
        this.prevY = this.y;

        // The reason why I have yOrigin, hoverPos and expansePos is so that I don't have to do math on each animation frame.  Trying to reduce lag.
    }
    star.prototype.draw = function () {
        var debugThisFunction = false;
        var funname = 'star.prototype.draw(): ';
        // the stars are not actually moving on the X axis in my code.  I'm simply rotating the canvas context for each star individually so that they all get rotated with the use of less complex math in each frame.



        if (!expanse) {
            this.rotation = this.startRotation + (currentTime * this.speed);
            if (!collapse) { // not hovered
                if (this.y > this.yOrigin) {
                    this.y -= 2.5;
                }
                if (this.y < this.yOrigin - 4) {
                    this.y += (this.yOrigin - this.y) / 10;
                }
            } else { // on hover
                this.trail = 1;
                if (this.y > this.hoverPos) {
                    this.y -= (this.hoverPos - this.y) / -5;
                }
                if (this.y < this.hoverPos - 4) {
                    this.y += 2.5;
                }
            }
        } else {
            this.rotation = this.startRotation + (currentTime * (this.speed / 2));
            if (this.y > this.expansePos) {
                this.y -= Math.floor(this.expansePos - this.y) / -140;
            }
        }

        context.save();
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.beginPath();
        var oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
        context.moveTo(oldPos[0], oldPos[1]);
        context.translate(centerx, centery);
        context.rotate(this.rotation);
        context.translate(-centerx, -centery);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.restore();


        this.prevR = this.rotation;
        this.prevX = this.x;
        this.prevY = this.y;

        if (debugThisFile && debugThisFunction) { console.log(fname, funname, 'drew a star at', this.x + ',', this.y, 'r:', this.rotation); }
    }


    me.find('.centerHover').on('click', function () {
        collapse = false;
        expanse = true;

        $(this).addClass('open');
        $('.fullpage').addClass('open');
        setTimeout(function () {
            $('.header .welcome').removeClass('gone');
        }, 500);
    });
    me.find('.centerHover').on('mouseover', function () {
        if (expanse == false) {
            collapse = true;
        }
    });
    me.find('.centerHover').on('mouseout', function () {
        if (expanse == false) {
            collapse = false;
        }
    });

    window.requestFrame = (function () {
        return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
			    window.setTimeout(callback, 1000 / 60);
			};
    })();

    function loop() {
        var debugThisFunction = true;
        var funname = 'init(): ';

        var now = new Date().getTime();
        currentTime = (now - startTime) / 50;

        context.fillStyle = 'rgba(0,42,56,0.2)'; // somewhat clear the context, this way there will be trails behind the stars 
        //context.fillRect(0, 0, cw, ch);
        context.clearRect(0, 0, cw, ch);

        for (var i = 0; i < stars.length; i++) {  // For each star
            if (stars[i] != stars) {
                stars[i].draw(); // Draw it
            }
        }

        requestFrame(loop);
    }

    function init(time) {
        var debugThisFunction = true;
        var funname = 'init(): ';

        if (debugThisFile && debugThisFunction) { console.log(fname, funname, 'called.'); }

        context.fillStyle = 'rgba(0,42,56,1)';  // Initial clear of the canvas, to avoid an issue where it all gets too dark
        context.fillRect(0, 0, cw, ch);
        for (var i = 0; i < 1500; i++) {  // create 2500 stars
            new star();
        }
        loop();
    }
    init();
}
/** END: Blackhole buttons for menu page **/

/** START: Read Bitcoin Data **/
var bitcoinYearly = {};
function readBitcoinData(maincallback) {
    var currentPrice = 0;

    function getCurrentPrice() {
        var priceField = $('[data-name="worth"] .content_img_box p');
        if (priceField.length) {
            priceField.html('$' + currentPrice.toFixed(2));
        }
    }

    function setCurrentPrice(callback) {
        var url = 'http://api.coindesk.com/v1/bpi/currentprice/USD.json';
        $.getJSON(url, function (data) {
            currentPrice = data.bpi.USD.rate_float;
            getCurrentPrice();
            if (typeof callback === 'function') {
                callback();
            }

        });
    }

    function setYearlyPrice(callback) {
        var date = new Date();
        var today = date.yyyymmdd();
        var url = 'http://api.coindesk.com/v1/bpi/historical/close.json?start=2013-01-01&end=' + today;
        

        // In case you are wondering why I don't just use this to get the current price as well,
        // the historical endpoint doesn't return the current price, only yesterday's price.
        $.getJSON(url, function (data) {
            bitcoinYearly = {
                '2013': data.bpi['2013-01-01'].toFixed(2),
                '2014': data.bpi['2014-01-01'].toFixed(2),
                '2015': data.bpi['2015-01-01'].toFixed(2),
                '2016': data.bpi['2016-01-01'].toFixed(2),
                '2017': currentPrice.toFixed(2)
            }
            if (typeof callback === 'function') {
                callback();
            }
        });

    }

    function init() {
        if (currentPrice == 0) {
            setCurrentPrice(function () {
                setYearlyPrice(maincallback);
            });
        }
    }

    init();
}
/** END: Read Bitcoin Data **/

function initBlocksat() {

    function init() {
        var curPage = $('body').data('page');
        curPage = (typeof curPage === 'undefined') ? '' : curPage;

        // Let's only init functions that we actually need on the page, and not for every page.
        switch(curPage) {
            case 'menu':
                $('.blackhole').each(function () {
                    blackhole(this);
                });
                break;
            case 'bitcoin':
                readBitcoinData(function () {
                    initGraphs();
                });
                break;
        }


    }

    init();
}
initBlocksat();
