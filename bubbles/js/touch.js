 define(function (require) {
    var Touch = function(x, y, draw) {

            this.type = 'touch';    // we'll need this later
            this.x = x;             // the x coordinate
            this.y = y;             // the y coordinate
            this.r = 5;             // the radius
            this.opacity = 1;       // inital opacity. the dot will fade out
            this.fade = 0.05;       // amount by which to fade on each game tick
            // this.remove = false;    // flag for removing this entity. game.update
                                    // will take care of this

            this.update = function() {
                // reduct the opacity accordingly
                this.opacity -= this.fade; 
                // if opacity if 0 or less, flag for removal
                this.remove = (this.opacity < 0) ? true : false;
                    
            };

            this.render = function() {                        
                draw.clearAfterEntity(this.x, this.y, this.r);                
                if(this.remove !== true)
                    draw.circle(this.x, this.y, this.r, 'rgba(255,0,0,'+this.opacity+')');
            };

        }; 
        return Touch;
    });