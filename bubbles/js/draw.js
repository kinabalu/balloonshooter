    define(function (require) {
    // abstracts various canvas operations into
        // standalone functions
        var config = require("./config");
        var Draw = function(ctx){
            this.ctx = ctx;

            this.clear = function() {
                this.ctx.clearRect(0, 0, config.WIDTH, config.HEIGHT);
            };

            this.rect = function(x, y, w, h, col) {
                this.ctx.fillStyle = col;
                this.ctx.fillRect(x, y, w, h);
            };

            this.circle = function(x, y, r, col) {
                this.ctx.fillStyle = col;
                this.ctx.beginPath();
                this.ctx.arc(x + 5, y + 5, r, 0,  Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            };

            this.clearAfterEntity = function(prevX, prevY, r){
                this.ctx.clearRect(prevX - r, prevY - r, r * 2 + 6, r * 2 + 6);    
            };

        }; 

        return Draw;
    });