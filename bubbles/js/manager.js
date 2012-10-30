define(function (require) {
    var Manager = function (Preloader) {

        require("base/libs/jukebox/Manager");    
        var config      = require("./config"),
            collides    = require("./collides") ,
            Draw        = require("./draw"),
            input       = require("./input"),
            particle    = require("./particle"),
            Bubble       = require("./bubble"),
            touch       = require("./touch");



        
        var entities        = [],
            canvas          = null,
            ctx             =  null,
            wave            = {},
            hitField        = document.getElementById('hit'),                
            missedField     = document.getElementById('missed'),
            accuracyField   = document.getElementById('accuracy');
            
            
        this.init = function() {  		
                    // the proportion of width to height
                    config.RATIO = config.WIDTH / config.HEIGHT;
                    // these will change when the screen is resize
                    config.currentWidth = config.WIDTH;
                    config.currentHeight = config.HEIGHT;
                    // this is our canvas element
                    canvas = document.getElementsByTagName('canvas')[0];
                    // it's important to set this
                    // otherwise the browser will
                    // default to 320x200
                    canvas.width = config.WIDTH;
                    canvas.height = config.HEIGHT;
                    // the canvas context allows us to 
                    // interact with the canvas api
                    ctx = canvas.getContext('2d');

                    draw = new Draw(ctx);                    

                    // we need to sniff out android & ios
                    // so we can hide the address bar in
                    // our resize function
                    config.ua = navigator.userAgent.toLowerCase();
                    config.android = config.ua.indexOf('android') > -1 ? true : false;
                    config.ios = ( config.ua.indexOf('iphone') > -1 || config.ua.indexOf('ipad') > -1  ) ? true : false;

                    // set up our wave effect
                    // basically, a series of overlapping circles
                    // across the top of screen
                    wave = {
                        x: -25, // x coord of first circle
                        y: -40, // y coord of first circle
                        r: 50, // circle radius
                        time: 0, // we'll use this in calculating the sine wave
                        offset: 0 // this will be the sine wave offset
                    }; 
                    // calculate how many circles we need to 
                    // cover the screen width
                    wave.total = Math.ceil(config.WIDTH / wave.r) + 1;

                    // listen for clicks
                    window.addEventListener('click', function(e) {
                        e.preventDefault();
                        input.set(e);
                    }, false);

                    // listen for touches
                    window.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        // the event object has an array
                        // called touches, we just want
                        // the first touch
                        input.set(e.touches[0]);
                    }, false);
                    window.addEventListener('touchmove', function(e) {
                        // we're not interested in this
                        // but prevent default behaviour
                        // so the screen doesn't scroll
                        // or zoom
                        e.preventDefault();
                    }, false);
                    window.addEventListener('touchend', function(e) {
                        // as above
                        e.preventDefault();
                    }, false);

					document.getElementById('scoreContainer').addEventListener(config.versatileEvents.CLICK, function(){
                        player.play('gameEnd');
                    });

                    // we're ready to resize
                    this.resize();					
                    this.loop();

                };            

            this.resize = function() {
            
                config.currentHeight = window.innerHeight;
                // resize the width in proportion
                // to the new height
                config.currentWidth = config.currentHeight * config.RATIO;

                // this will create some extra space on the
                // page, allowing us to scroll pass
                // the address bar, and thus hide it.
                if (config.android || config.ios) {
                    document.body.style.height = (window.innerHeight + 50) + 'px';
                }

                // set the new canvas style width & height
                // note: our canvas is still 320x480 but
                // we're essentially scaling it with CSS
                canvas.style.width = config.currentWidth + 'px';
                canvas.style.height = config.currentHeight + 'px';

                // the amount by which the css resized canvas
                // is different to the actual (480x320) size.
                config.scale = config.currentWidth / config.WIDTH;
                // position of canvas in relation to
                // the screen
                config.offset.top = canvas.offsetTop;
                config.offset.left = canvas.offsetLeft;

                // we use a timeout here as some mobile
                // browsers won't scroll if there is not
                // a small delay
                window.setTimeout(function() {
                        window.scrollTo(0,1);
                }, 1);
            };

            // this is where all entities will be moved
            // and checked for collisions etc
            this.update = function() {
                var i,
                    hit,
                    entity,
                    checkCollision = false; // we only need to check for a collision
                                        // if the user tapped on this game tick

                // decrease our nextBubble counter
                config.nextBubble -= 1;
                // if the counter is less than zero
                if (config.nextBubble < 0) {
                    // put a new instance of bubble into our entities array                
                    entities.push(new Bubble(draw));
                    // reset the counter with a random value
                    config.nextBubble = ( Math.random() * 100 ) + 100;
                }

                // spawn a new instance of Touch
                // if the user has tapped the screen
                if (input.tapped) {
                    // keep track of taps; needed to 
                    // calculate accuracy
                    config.score.taps += 1;
                    // add a new touch
                    entities.push(new touch(input.x, input.y, draw));                                
                    // set tapped back to false
                    // to avoid spawning a new touch
                    // in the next cycle
                    input.tapped = false;
                    checkCollision = true;
                }

                // cycle through all entities and update as necessary
                for (i = 0; i < entities.length; i += 1) {
                    entity = entities[i];
                    entity.update();

                    if (entity.type === 'bubble' && checkCollision) {
                        hit = collides(entities[i], 
                                            {x: input.x, y: input.y, r: 7});
                        if (hit) {
                            // spawn an exposion
                            for (var n = 0; n < 5; n +=1 ) {
                                entities.push(new particle(
                                    entity.x, 
                                    entity.y, 
                                    2, 
                                    // random opacity to spice it up a bit
                                    'rgba(255,255,255,'+Math.random()*1+')',
                                    draw
                                )); 
                            }
                            config.score.hit++;
                            draw.clearAfterEntity(entity.prevX, entity.prevY, entity.r);
                            player.play('BaloonPop');
                        }

                        entity.remove = hit;
                    }

                    // delete from array if remove property
                    // flag is set to true
                    if(entity.remove && !hit && entity.type === 'bubble')
                        player.play('BaloonMissed');

                    if (entity.remove) {                                     
                        entities.splice(i, 1);
                    }
                }

                // update wave offset
                // feel free to play with these values for
                // either slower or faster waves
                wave.time = new Date().getTime() * 0.002;
                wave.offset = Math.sin(wave.time * 0.8) * 5;

                // calculate accuracy
                config.score.accuracy = (config.score.hit / config.score.taps) * 100;
                config.score.accuracy = isNaN(config.score.accuracy) ?
                    0 :
                    ~~(config.score.accuracy); // a handy way to round floats

            };


            // this is where we draw all the entities
            this.render = function() {

                var i;

                //sucks
                //game.Draw.rect(0, 0, game.WIDTH, game.HEIGHT, '#036');
                //game.Draw.clear();

                // display snazzy wave effect
                // sucks it will be in the top thingy
                //for (i = 0; i < game.wave.total; i++) {


                    // game.Draw.circle(
                    //             game.wave.x + game.wave.offset +  (i * game.wave.r), 
                    //             game.wave.y,
                    //             game.wave.r, 
                    //             '#fff'); 
                //}

                    // cycle through all entities and render to canvas
                    for (i = 0; i < entities.length; i += 1) {
                        entities[i].render();
                }

                // display config.scores
                //to be separated in a component
                hitField.innerHTML = 'Hit: ' + config.score.hit;
                missedField.innerHTML = 'Missed: ' + config.score.escaped;
                accuracyField.innerHTML = 'Hit: ' + config.score.accuracy + '%';
                //sucks
                // game.Draw.text('Hit: ' + game.config.score.hit, 20, 30, 14, '#fff');
                // game.Draw.text('Escaped: ' + game.config.score.escaped, 20, 50, 14, '#fff');
                // game.Draw.text('Accuracy: ' + game.config.score.accuracy + '%', 20, 70, 14, '#fff');

            };


            // the actual loop
            // requests animation frame
            // then proceeds to update
            // and render
            this.loop = function() {                               
                var that = this;
                requestAnimFrame( function(){
                    that.loop();
                });                
                this.update();
                this.render();
            };     
                      

            // http://paulirish.com/2011/requestanimationframe-for-smart-animating
            // shim layer with setTimeout fallback
            window.requestAnimFrame = (function(){ 
                return  window.requestAnimationFrame       || 
                    window.webkitRequestAnimationFrame || 
                    window.mozRequestAnimationFrame    || 
                    window.oRequestAnimationFrame      || 
                    window.msRequestAnimationFrame     || 
                    function( callback ){
                        window.setTimeout(callback, 1000 / 60);
                    };
            })(); 

		this.init();
		
        window.addEventListener('load', this.init, false);
        window.addEventListener('resize', this.resize, false);
    }
	
    return Manager
});