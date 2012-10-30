define(function (require) {
    var Particle = function(x, y,r, col, draw) {

            this.x = x;
            this.y = y;
            this.r = r;
            this.col = col;

            // determines whether particle will
            // travel to the right of left
            // 50% chance of either happening
            this.dir = (Math.random() * 2 > 1) ? 1 : -1;

            // random values so particles do no
            // travel at the same speeds
            this.vx = ~~(Math.random() * 4) * this.dir;
            this.vy = ~~(Math.random() * 7);

            this.remove = false;

            this.update = function() {

                this.prevX = this.x;
                this.prevY = this.y;

                // update coordinates
                this.x += this.vx;
                this.y += this.vy;

                // increase velocity so particle
                // accelerates off screen
                this.vx *= 0.99;
                this.vy *= 0.99;

                // adding this negative amount to the
                // y velocity exerts an upward pull on
                // the particle, as if drawn to the
                // surface
                this.vy -= 0.25;

                // offscreen
                if (this.y < 0) {
                    this.remove = true;                    
                    draw.clearAfterEntity(this.prevX, this.prevY, this.r);                    
                }

            };


            this.render = function() {                
                draw.clearAfterEntity(this.prevX, this.prevY, this.r);                
                draw.circle(this.x, this.y, this.r, this.col);
            };

    };
    return Particle;
});