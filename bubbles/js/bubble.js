define(function (require) {
    var Bubble = function(draw) {
            
            var config  = require("./config");
            
            this.type = 'bubble';
            this.r = (Math.random() * 20) + 10;
            this.speed = (Math.random() * 3) + 1;
         
            this.prevX = this.x = (Math.random() * (config.WIDTH) - this.r);
            this.prevY = this.y = config.HEIGHT + (Math.random() * 100) + 100;

            // the amount by which the bubble
            // will move from side to side
            this.waveSize = 5 + this.r;
            // we need to remember the original
            // x position for our sine wave calculation
            this.xConstant = this.x;

            this.remove = false;


            this.update = function() {

                // a sine wave is commonly a function of time
                var time = new Date().getTime() * 0.002;

                this.prevX = this.x;
                this.prevY = this.y;        
                this.y -= this.speed;
                // the x coord to follow a sine wave
                this.x = this.waveSize * Math.sin(time) + this.xConstant;

                // if offscreen flag for removal
                if (this.y < - (this.r+5)) {
                    config.score.escaped += 1; // update score
                    this.remove = true;
                    draw.clearAfterEntity(this.prevX, this.prevY, this.r, 6); 
                }

            };

            this.render = function() {
                draw.clearAfterEntity(this.prevX, this.prevY, this.r, 6);   
                if(this.remove !== true)
                    draw.circle(this.x, this.y, this.r, 'rgba(255,255,255,1)');
            };            

        };
        return Bubble;
    });