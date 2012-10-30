define(function (require) {
    var config = require("./config");
	var Input = {

            x: 0,
            y: 0,
            tapped :false,

            set: function(data) {                
                this.x = (data.pageX - config.offset.left) / config.scale;
                this.y = (data.pageY - config.offset.top) / config.scale;
                this.tapped = true;

            }

        };
        return Input;
    });