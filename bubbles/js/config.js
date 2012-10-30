define(function(require){

	// Logic for the random and preconfigured credentials, this ensures that if a ?custID is passed as
	// a parameter this concrete predefined userId will be used, otherways randon userId will be picked
	var config = {

		'versatileEvents': {
	        'CLICK': ( "ontouchstart" in window ) ? 'touchstart' : 'click',
            'DOWN': ( "ontouchend" in window ) ? 'touchstart' : 'mousedown',
            'UP': ( "ontouchend" in window ) ? 'touchend' : 'mouseup',
            'MOVE': ( "ontouchmove" in window ) ? 'touchmove' : 'mousemove'
	    },

	    'WIDTH': 320, 
        'HEIGHT':  480, 
        'scale':  1,
        // the position of the canvas
        // in relation to the screen
        'offset': {
        	'top': 0, 
        	'left': 0
        },

        'score': {
			'taps': 0,
			'hit': 0,
			'escaped': 0,
        	'accuracy': 0
        },
        
        // the amount of game ticks until
        // we spawn a bubble
        'nextBubble': 100,        
        // we'll set the rest of these
        // in the init function
        'RATIO':  null,
        'currentWidth':  null,
        'currentHeight':  null,        
        'ua':  null,
        'android': null,
        'ios':  null,

	    'sound': {
	        resources: [
	            'sounds/all.mp3',
	            'sounds/all.ogg'
	        ],
	        // autoplay: 'Ace',
	        spritemap: {
	            "empty":{
	                "start":0.01,
	                "end":0.5,
	                "loop":false
	            },
	            "startGame": {
	                "start": 2,
	                "end": 3.6,
	                "loop": false
	            },
	            "BaloonPop": {
	                "start": 5,
	                "end": 5.4,
	                "loop": false
	            },
	            "BaloonMissed": {
	                "start": 7,
	                "end": 7.25,
	                "loop": false
	            },
	            "gameEnd": {
	                "start": 9,
	                "end": 14.8,
	                "loop": false
	            }	            
	        }
	    }
	}

	return config;
});