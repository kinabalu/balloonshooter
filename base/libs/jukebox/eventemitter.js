/**
 * Simple Browser implementation of NodeJS EventEmitter class + more
 *
 * @author Ivailo Hristov
 * @module EventEmitter
 * @main EventEmitter
 *
 */

(function( exports ){
    'use strict';

    // Locals
    var undefined,
        $a = [],
        slice = $a.slice;

    if( !String.prototype.trim ){
        var lTrim = /^\s\s*/;
        var rTrim = /\s\s*$/;

        String.prototype.trim = function(){
            return this.replace( lTrim, '' ).replace( rTrim, '' );
        };
    }

    if( !Array.prototype.forEach ){
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope || this, this[i], i, this);
            }
        }
    }

    /**
     * @class EventEmitter
     * @constructor
     */
    var EventEmitter = function(){
        /**
         * @property _listeners
         * @type {Object}
         * @private
         */
        this._listeners = {};

        /**
         * @property _chains
         * @type {Object}
         * @private
         */
        this._chains = {};

        /**
         * @property _holdEvents
         * @type {Object}
         * @private
         */
        this._holdEvents = {};

        /**
         * @property _behaviours
         * @type {Object}
         * @private
         */
        this._behaviours = {};

        /**
         * @property _maxListeners
         * @type {Number}
         * @default 10
         * @private
         */
        this._maxListeners = 10;

        /**
         * @property _currentEvent
         * @type {String}
         * @private
         */
        this._currentEvent = "";

        /**
         * @property _currentListener
         * @type {Function}
         * @private
         */
        this._currentListener = null;
    };

    // Create shorter prototype reference
    EventEmitter.fn = EventEmitter.prototype = {};

    /**
     * Add event listener at the end of listeners array
     *
     * @method addEventListener
     * @param {String} event or multiple events separated by interval
     * @param {Function} listener
     */
    EventEmitter.fn.addEventListener = function( event, listener ){
        if( !event ){
            throw 'Event parameter is undefined';
        } else if( !listener ){
            throw 'Listener parameter is undefined';
        }

        var multiple = event.trim().split(/\s\s*/),
            emitter = this;

        if( multiple.length > 1 ){
            multiple.forEach(function( event ){
                emitter.addEventListener( event, listener );
            });

            return;
        }

        var list = (this._listeners[event] || (this._listeners[event] = []));

        if( list.indexOf( listener ) === -1 ){
            list.push( listener );
        } else {
            throw "Trying to add callback multiple times for event `" + event + "`!";
        }

        if( this._listeners[event].length > this._maxListeners ){
            throw 'Maximum number of event listeners exceeded for `' + event + '` event';
        }

        // Emit newListener event on every new listener
        // NOTE: do not emits newListener event for its own listeners
        if( event !== 'newListener' ) this.emit( 'newListener', event, listener );
    };

    /**
     * Add event listener at the end of listeners array
     *
     * @method on
     * @param {String} event
     * @param {Function} listener
     */
    EventEmitter.fn.on = EventEmitter.fn.addEventListener;

    /**
     * Adds a one time listener for the event. This listener is invoked only
     *  the next time the event is fired, after which it is removed.
     *
     * @method once
     * @param {String} event
     * @param {Function} listener
     */
    EventEmitter.fn.once = function( event, listener ){
        if( listener ) listener._invokeOnce = true; // NOTE: error will be thrown in addEventListener

        this.addEventListener( event, listener );
    };

    /**
     * Holds event, preventing it`s emits, until it is released.
     *
     * @method holdEvent
     * @param {String} event
     */
    EventEmitter.fn.holdEvent = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        if( !this._holdEvents[ event ] ){
            this._holdEvents[ event ] = [];
        }
    };

    /**
     * Releases hold event, running all holded emits.
     *
     * @method releaseEvent
     * @param {String} event
     */
    EventEmitter.fn.releaseEvent = function( event, preventEmit ){
        if( !this._holdEvents[ event ] ){
            throw "Trying to release not holded event '" + event + "'";
        }

        // Save emit history
        var history = this._holdEvents[ event ];

        // Delete holdEvents data here to allow emitting of the event
        delete this._holdEvents[ event ];

        if( !preventEmit ){
            history.forEach(function( args ){
                this.emit.apply( this, args );
            }, this );
        }
    };

    /**
     * Checks if event is holded
     *
     * @method isHold
     * @param {String} event
     */
    EventEmitter.fn.isHold = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        return !!this._holdEvents[ event ];
    };


    /**
     * Set default event behaviour(listener), which will be applied after custom listeners.
     *
     * @method setDefaultBehaviour
     * @param {String} event
     * @param {Function} listener
     */
    EventEmitter.fn.setDefaultBehaviour = function( event, listener ){
        this._behaviours[event] = listener;
    };

    /**
     * Remove default event behaviour(listener) if there is any.
     *
     * @method removeDefaultBehaviour
     * @param {String} event
     */
    EventEmitter.fn.removeDefaultBehaviour = function( event ){
        delete this._behaviours[event];
    };

    /**
     * Remove a listener from the listener array for the specified event.
     *
     * @method removeEventListener
     * @param {String} event
     * @param {Function} listener
     */
    EventEmitter.fn.removeEventListener = function( event, listener ){
        if( !event ){
            throw 'Event parameter is undefined';
        } else if( !listener ){
            throw 'Listener parameter is undefined';
        }

        var listeners = this._listeners[event] || $a;

        for( var i = -1, ls; ls = listeners[++i]; ){
            if( ls === listener ){
                listeners.splice( i, 1 );
                return;
            }
        }
    };

    /**
     * Removes all listeners, or those of the specified event.
     *
     * @method removeAllListeners
     * @param {String} event
     */
    EventEmitter.fn.removeAllListeners = function( event ){
        if( event !== undefined ){
            this._listeners[event] = [];
        } else {
            this._listeners = [];
        }
    };

    /**
     * Returns an array of listeners for the specified event. This array can be manipulated, e.g. to remove listeners.
     *
     * @method listeners
     * @param {String} event
     * @return {Array} listeners array
     */
    EventEmitter.fn.listeners = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        return this._listeners[event] || (this._listeners[event] = []);
    };

    /**
     * Execute each of the listeners in order with the supplied arguments.
     *
     * @method emit
     * @param {String} event
     */
    EventEmitter.fn.emit = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        var listeners = this._listeners[event],
            args = slice.call( arguments, 1 ),
            preventDefault = false,
            ret, behaviour, i, ls;

        // If event is holded, save current arguments and do not emit
        if( this._holdEvents[ event ] ){
            this._holdEvents[ event ].push( slice.call( arguments ) );

            return;
        }

        // Set current event
        this._currentEvent = event;

        // Run all custom listeners
        if( listeners && listeners.length ){
            for( i = -1, ls; ls = listeners[++i]; ){
                // Set current listener
                this._currentListener = ls;

                ret = ls.apply( this, args );

                if( ls._invokeOnce ){
                    this.removeEventListener( event, ls );

                    i--; // decrease counter, because listeners are one less now
                }

                // NOTE: if listener return false, don`t execute default listener.
                if( !preventDefault && ret === false ){ // false !== undefined
                    preventDefault = true;
                }
            }
        }

        // Clear current event and listener
        this._currentEvent = '';
        this._currentListener = null;

        // Call default listener if there is any
        if( !preventDefault && (behaviour = this._behaviours[event]) ){
            behaviour.apply( this, args );
        }

        // Emit chained event it there is any
        if( (event = this.getChainedEvent( event )) ){
            this.emit( event );
        }
    };

    /**
     * Set maximum number of event listeners that can be added to particular event
     *
     * @method setMaxListeners
     * @param {Number} n
     */
    EventEmitter.fn.setMaxListeners = function( n ){
        if( typeof n !== "number" ){
            throw 'setMaxListeners(n) expects parameter to be number';
        }

        this._maxListeners = n;
    };

    /**
     * Return currently emitted event
     *
     * @method getCurrentEvent
     * @return {String}
     */
    EventEmitter.fn.getCurrentEvent = function(){
        return this._currentEvent;
    };

    /**
     * Return currently executed listener
     *
     * @method getCurrentListener
     * @return {Function}
     */
    EventEmitter.fn.getCurrentListener = function(){
        return this._currentListener;
    };

    /**
     *  Set event which will be emitted after all listeners from other event,
     * this method makes possible to create event chains such as DOM event chains.
     *
     * Example: mouseUp -> click
     *
     * @method setChainEvent
     * @param {string} event
     * @param {string} chainEvent
     */
    EventEmitter.fn.setChainEvent = function( event, chainEvent ){
        if( event === undefined ){
            throw '"event" parameter is undefined';
        } else if( chainEvent === undefined ){
            throw '"chainEvent" parameter is undefined';
        }

        this._chains[ event ] = chainEvent;
    };

    /**
     *  Get chained event for current one
     *
     * @method getChainedEvent
     * @param {string} event
     * @return {string}
     */
    EventEmitter.fn.getChainedEvent = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        return this._chains[ event ];
    };

    /**
     *  Remove chained event for passed event
     *
     * @method removeChainedEvent
     * @param {string} event
     * @return {boolean}
     */
    EventEmitter.fn.removeChainedEvent = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        return delete this._chains[ event ];
    };

    /**
     *  Emit chained event for current one
     *
     * @method emitChainedEvent
     * @param {string} event
     */
    EventEmitter.fn.emitChainedEvent = function( event ){
        if( event === undefined ){
            throw 'Event parameter is undefined';
        }

        if( (event = this.getChainedEvent(event)) )
            this.emit( event );
    };

    /**
     * Creates a clone of current EventEmitter`s listeners
     *
     * @method cloneListeners
     * @return {Object} listeners clone
     */
    EventEmitter.fn.cloneListeners = function(){
        var events = this._listeners,
            clone = {},
            listeners, event, i, ls;

        for( event in events ){
            if( events.hasOwnProperty(event) ){
                clone[event] = [];

                for( i = -1, listeners = events[event]; ls = listeners[++i]; ){
                    clone[event].push( ls );
                }
            }
        }

        return clone;
    };

    /**
     * Creates a clone of current EventEmitter`s chains
     *
     * @method cloneChains
     * @return {Object} chains clone
     */
    EventEmitter.fn.cloneChains = function(){
        var chains = this._chains,
            clone = {},
            event;

        for( event in chains ){
            if( chains.hasOwnProperty( event ) ){
                clone[ event ] = chains[ event ];
            }
        }

        return clone;
    };
    /**
     * Creates a clone of current EventEmitter`s behaviours
     *
     * @method cloneChains
     * @return {Object} behaviours clone
     */
    EventEmitter.fn.cloneBehaviours = function(){
        var behaviours = this._behaviours,
            clone = {},
            event;

        for( event in behaviours ){
            if( behaviours.hasOwnProperty( event ) ){
                clone[ event ] = behaviours[ event ];
            }
        }

        return clone;
    };
    
    /**
     * Creates a clone of current EventEmitter`s holdEvents
     *
     * @method cloneHolds
     * @return {Object} holds clone
     */
    EventEmitter.fn.cloneHolds = function(){
        var holds = this._holdEvents,
            clone = {},
            event;

        for( event in holds ){
            if( holds.hasOwnProperty( event ) ){
                clone[ event ] = holds[ event ];
            }
        }

        return clone;
    };

    /**
     * Creates a clone of current EventEmitter`s data and add them instead.
     * This is used when EventEmitter is used for base class in inference and
     * data should not be shared across the instances.
     *
     * @method cloneEventsData
     */
    EventEmitter.fn.cloneEventsData = function(){
        this._listeners = this.cloneListeners();
        this._chains = this.cloneChains();
        this._holdEvents = this.cloneHolds();
        this._behaviours = this.cloneBehaviours();
    };

    // If AMD is used make it module,
    //  otherwise export it globally
    if ( typeof exports.define === "function" && exports.define.amd ) {
        define(function(){
            return EventEmitter;
        });
    }

    exports.EventEmitter = EventEmitter;
})( typeof window !== "undefined" ? window : exports );
