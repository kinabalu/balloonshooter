// Setting the base URL
require.config({
    baseUrl: "../",
    paths: {
        game: "./bubbles"
    }
});

var player;

require(["base/preloader", "game/js/manager", "game/js/config", "base/libs/zepto.min"], function(
    p, manager, config
){


    var initPlayer = function() {            
            player = new jukebox.Player(config.sound);            
            player.play('startGame');
            preloader.remove();
            $('#game').css('display', 'block');			
            //manager.resize();
        },
        preloader = new Preloader({
            preloader: document.getElementById('preloader'),
            gameStart: document.getElementById('start'),
            progress_percent: document.getElementById('percent'),            
        }, 
		function(){},
		function() {
            setTimeout(function() {
                manager(preloader);			
            }, 0);
        });        
    preloader.elements.gameStart.addEventListener(config.versatileEvents.CLICK, initPlayer);
});

