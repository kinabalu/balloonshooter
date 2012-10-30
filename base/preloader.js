/**
 * @description Preloader class
 * @package Cayetano Game Framework
 * @author Kristiyan Ivanov
 * @copyright Cayetano Technologies Ltd. 2012 All rights reserved.
 *
 */
var Preloader = (function() {

	/**
	 * @function
	 * @description Returns a list with the items in the cache manifest file.
	 */
    var getManifestList = (function(){
        var list = null,
            // Regular Expressions
            stripSectionsExpr = new RegExp(
                "(NETWORK|FALLBACK):" +
                    "((?!(NETWORK|FALLBACK|CACHE):)[\\w\\W]*)",
                "gi"
            ),
            stripCommentsExpr = new RegExp( "#[^\\r\\n]*(\\r\\n?|\\n)", "g"),
            stripManifestHeader = new RegExp( "CACHE MANIFEST\\s*|\\s*$", "g"),
            stripLineBreaks = new RegExp( "[\\r\\n]+", "g" );


        return function(){
            if( list ){
                return list;
            }

            $.ajax({
                type: "get",
                url: document.documentElement.getAttribute('manifest'),
                dataType: "text",
                cache: false,
                async: false,
                success: function( totalFiles ){
                    // Strip out the non-cache sections.
                    // NOTE: The line break here is only to prevent
                    // wrapping in the BLOG.
                    totalFiles = totalFiles
                        .replace( stripSectionsExpr, "" )
                        // Strip out all comments.
                        .replace( stripCommentsExpr, "" )
                        // Strip out the cache manifest header and
                        // trailing slashes.
                        .replace( stripManifestHeader, "" )
                        // Strip out extra line breaks and replace with
                        // a hash sign that we can break on.
                        .replace( stripLineBreaks, "#" );

                    // Get array of files.
                    list = totalFiles.split("#");
                },
                error: function(){
                    // In case of error, get data from cache
                    list = false;
                }
            });

            return list;
        };
    })();


	/**
	 * @class
	 * @property {object} elements The elements that contain the preloader display
	 * @description Creates preloader with the given selected elements
	 */
	var preload = function(elements, finishedLoadingCallback, removedCallback) {
        this.STATUSES = {
            NOT_READY: 0, // it's still not loaded
            OBSOLETE: 1, // there was an error
            ERROR: 2, // there was an error - output the error message
            READY: 3, // the cache is loaded and ready for use
            UPDATE: 4 // has to reload the page, to get the new cache
        }

		/**
		 * @field
		 */
        this.isFF = /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);

        var cache = getManifestList();

        this.cachedItems = cache ? cache.length : 30;

        this.progressCalled = 0;

        this.status = this.STATUSES.NOT_READY;
        this._isFinished = false;

		this.elements = elements;
        this._finishedLoadingCallback = finishedLoadingCallback;
		this._removedCallback = removedCallback;
		this._init();
	};

	/**
	 * @description Adding methods to the prototype
	 */
    preload.prototype._init = function() {
        this.elements.preloader.style.display = 'block';

		this.isUsedAppCache = !!document.documentElement.hasAttribute('manifest');        

        this.update(0,1);

		if (this.isUsedAppCache) {
            this.load();
		} else {
			this.finished();
		}
    };

    preload.prototype.load = function() {
        var that = this, isChecked = false;

        //
        //  Opera seems to ignore app cache events sometimes,
        // if there is cache update - everything is ok, but ...
        // when game is cached after a couple of reloads opera stops
        // emitting of cache events.
        //
        window.opera && setTimeout(function(){
            that.finished();
            that.status = that.STATUSES.READY;
        }, 2000);

        // Checking for an update. Always the first event fired in the sequence.
        applicationCache.addEventListener('checking', function(){
            isChecked = true;
        }, false);

        applicationCache.addEventListener('progress', function(e) {
            if (!e.loaded || !e.total) {
                // firefox doesn't support e.loaded and e.total
                that.update(that.progressCalled++, that.cachedItems);
            } else {
                that.update(e.loaded, e.total);
            }
        }, false);

        applicationCache.addEventListener('cached', function() {
            that.status = that.STATUSES.READY;
            that.finished();
        }, false);

        applicationCache.addEventListener('noupdate', function() {
            that.status = that.STATUSES.READY;
            that.finished();
        });

        applicationCache.addEventListener('updateready', function() {
            if( applicationCache.status == applicationCache.UPDATEREADY ){
                that.status = that.STATUSES.UPDATE;
            } else {
                that.status = that.STATUSES.READY;
            }
            try{window.applicationCache.swapCache();} catch(e){};
            that.status = that.STATUSES.UPDATE;
            that.finished();
        }, false);

        applicationCache.addEventListener('obsolete', function() {
            that.status = that.STATUSES.OBSOLETE;
            that.finished();
        }, false);

        applicationCache.addEventListener('error', function() {
            that.status = that.STATUSES.ERROR;
            that.finished();
        }, false);

        if (applicationCache.status === applicationCache.IDLE) {
            // the status is IDLE, so the appcache is the newest
            if (!that.isFF) {
                that.status = that.STATUSES.READY;
                that.finished();
            }
        }
    }

    preload.prototype.activateButton = function(onclick) {
        if (typeof onclick !== 'function') {
            var onclick = function(){};
        }
        var that = this;
        var _onclick = function() {
            onclick();
            that.elements.gameStart.removeEventListener('click', _onclick);
        }        
        this.elements.gameStart.className = 'active';
        this.elements.gameStart.style.display = 'block';
        this.elements.gameStart.addEventListener('click', _onclick);
    };

    preload.prototype.deactivateButton = function() {
        this.elements.gameStart.style.display = 'none';
    };

    preload.prototype.remove = function() {        
        this.elements.preloader.parentNode.removeChild(this.elements.preloader);
        
		this._removedCallback();
    }

    preload.prototype.update = function(loaded, total) {
        if(loaded === total)
            this.activateButton();
    }

    preload.prototype.finished = function() {
        // preloader is ready
        if (this._isFinished) {
            return;
        }
        this._isFinished = true;
        this.update(100, 100);
        this._finishedLoadingCallback();
    }

	return preload;
})();
