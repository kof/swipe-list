!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SwipeList=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

var styles = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];

var el = document.createElement('p');
var style;

for (var i = 0; i < styles.length; i++) {
  style = styles[i];
  if (null != el.style[style]) {
    module.exports = style;
    break;
  }
}

},{}],2:[function(_dereq_,module,exports){
/**
 * Infinite scroll for weak devices.
 *
 * @author Oleg Slobodskoi 2014
 */

'use strict'

var transform = _dereq_('transform-property'),
    vendor = transform.substr(0, transform.length - 9),
    $ = jQuery

function SwipeList($container, options) {
    this.elements = {container: $container}
    this.options = $.extend({}, SwipeList.defaults, options)
    this._currentVirtualPage = 0
    this._itemsPerPage = 0
    this._moving = false
}

module.exports = SwipeList

SwipeList.defaults = {
    // Elements selector or jquery collection.
    items: null,
    pages: 3,
    render: $.noop,
    data: [],
    swipeThreshold: 10,
    easing: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    duration: 500,
    swipeBeforeRelease: true
}

SwipeList.prototype.init = function() {
    this.elements.items = this.elements.container.find(this.options.items)
    this.elements.container.addClass('swipe-list')
    this.refresh()
    this._bind()
    this.data(this.options.data)
}

SwipeList.prototype.refresh = function() {
    this._calcDimensions()
    this._splitPages()
    this._insertPages()
    return this
}

SwipeList.prototype.data = function(data) {
    if (!data) return this.options.data
    if (!data.length) return this
    this.options.data = data
    this._renderPage(0)
    this._renderPage(1)
    if (this._currentVirtualPage > 0) this._renderPage(2)

    return this
}

SwipeList.prototype._bind = function() {
    this.elements.container
        .on('movestart', this._onMoveStart.bind(this))
        .on('moveend', this._onMoveEnd.bind(this))
        .on('swipeup', this._onSwipeUp.bind(this))
        .on('swipedown', this._onSwipeDown.bind(this))
}

SwipeList.prototype._calcDimensions = function() {
    this._containerHeight = this.elements.container.height()
    this._itemHeight = this.elements.items.eq(0).outerHeight()
    this._itemsPerPage = Math.floor(this._containerHeight / this._itemHeight)
}

SwipeList.prototype._splitPages = function() {
    var self = this,
        $items = this.elements.items,
        pageNr, itemNr = 0, itemNrInPage, $page,
        $pages = $()

    if (this._itemsPerPage < 1) return

    for (pageNr = 0; pageNr < this.options.pages; pageNr++) {
        $page = $('<div class="swipe-list-page swipe-list-page-'+ pageNr +'"></div>')
        $pages = $pages.add($page)

        for (itemNrInPage = 0; itemNrInPage < this._itemsPerPage; itemNrInPage++) {
            if ($items[itemNr]) $items.eq(itemNr).appendTo($page)
            itemNr++
        }
    }

    this._setTranslateY($pages[1], this._containerHeight, true)
    this._setTranslateY($pages[2], this._containerHeight, true)
    this.elements.pages = $pages
    this._setZIndexes($pages.eq(0))
}

SwipeList.prototype._insertPages = function() {
    this.elements.container.html(this.elements.pages)
}

SwipeList.prototype._renderPage = function(virtualPageNr) {
    var o = this.options,
        realPageNr = virtualPageNr % o.pages,
        realElemNr = realPageNr * this._itemsPerPage,
        virtualElemNr = virtualPageNr *  this._itemsPerPage,
        i, $item

    for (i = 0; i < this._itemsPerPage; i++) {
        $item = this.elements.items.eq(realElemNr)
        o.render($item, o.data[virtualElemNr])
        realElemNr++
        virtualElemNr++
    }
}

SwipeList.prototype._move = function($el, callback) {
    var self = this,
        o = this.options

    this._moving = true
    this._onceTransitionEnd($el[0], o.duration, function() {
        self._moving = false
        callback()
    })

    requestAnimationFrame(function() {
        self._setTranslateY($el[0], 0)
    })
}

SwipeList.prototype._setTranslateY = function(el, y, removeTransition) {
    var self = this,
        o = this.options

    if (removeTransition) this._setTransition(el, null)

    // Always wait after applying transition to ensure it has been applied.
    requestAnimationFrame(function() {
        el.style[transform] = 'translateY(' + y + 'px)'
        removeTransition && requestAnimationFrame(function() {
            self._setTransition(el, o.duration + 'ms ' + o.easing)
        })
    })
}

/**
 * Set transition property.
 *
 * @param {Element} el
 * @param {String} value
 * @return {iPanel}
 * @api private
 */
SwipeList.prototype._setTransition = function(el, value) {
    el.style[vendor + 'Transition'] = value || ''

    return this
}

SwipeList.prototype._setZIndexes = function($current) {
    this.elements.pages.css('z-index', 1)
    $current.css('z-index', 0)
}

SwipeList.prototype._hasNext = function() {
    return Boolean(this.options.data[(this._currentVirtualPage + 1) * this._itemsPerPage])
}

SwipeList.prototype._hasPrev = function() {
    return Boolean(this.options.data[(this._currentVirtualPage - 1) * this._itemsPerPage])
}

SwipeList.prototype._getNextPageEl = function() {
    var curRealPage = this._getRealPage(),
        nextRealPage = curRealPage + 1 >= this.options.pages ? 0 : curRealPage + 1

    return this.elements.pages.eq(nextRealPage)
};

SwipeList.prototype._getPrevPageEl = function() {
    var curRealPage = this._getRealPage(),
        prevRealPage = curRealPage - 1 < 0 ? this.options.pages - 1 : curRealPage - 1

    return this.elements.pages.eq(prevRealPage)
}

SwipeList.prototype._getRealPage = function() {
    return this._currentVirtualPage % this.options.pages
}

/**
 * Call back once when transition end
 *
 * @param {Element} el
 * @param {Number} duration
 * @param {Function} [callback]
 * @return {iPanel}
 * @api private
 */
SwipeList.prototype._onceTransitionEnd = function(el, duration, callback) {
    el.addEventListener(vendor + 'TransitionEnd', function onTransitionEnd() {
        el.removeEventListener(vendor + 'TransitionEnd', onTransitionEnd)
        if (callback) callback()
        callback = null
    }, false)

    // For the case we don't get the event.
    setTimeout(function() {
        if (callback) callback()
        callback = null
    }, duration + 50)

    return this
}

SwipeList.prototype._checkSwipe = function(e) {
    var event

    this._currentY = e.pageY
    this._dist = Math.abs(this._currentY - this._startY)
    if (this._dist > this.options.swipeThreshold) {
        event = this._currentY > this._startY ? 'swipedown' : 'swipeup'
        this.elements.container.triggerHandler(event)
        if (this.options.swipeBeforeRelease) {
            this.elements.container.off('move')
        }
    }
}

SwipeList.prototype._onMoveStart = function(e) {
    this._startY = e.pageY
    if (this.options.swipeBeforeRelease) {
        this.elements.container.on('move', this._onMove.bind(this))
    }
}

SwipeList.prototype._onMove = SwipeList.prototype._checkSwipe

SwipeList.prototype._onMoveEnd = function(e) {
    if (this.options.swipeBeforeRelease) {
        this.elements.container.off('move')
    } else {
        this._checkSwipe(e)
    }
}

SwipeList.prototype._onSwipeUp = function() {
    var self = this,
        o = this.options,
        $next

    if (this._moving || !this._hasNext()) return

    $next = this._getNextPageEl()
    this._currentVirtualPage++
    this._move($next, function() {
        var $prev = self._getPrevPageEl(),
            $current = $next

        self._setTranslateY($prev[0], -self._containerHeight, true)
        if (self._hasNext()) {
            $next = self._getNextPageEl()
            self._setTranslateY($next[0], self._containerHeight, true)
            self._renderPage(self._currentVirtualPage + 1)
        }

        requestAnimationFrame(function() {
            self._setZIndexes($current)
        })
    })
}

SwipeList.prototype._onSwipeDown = function() {
    var self = this,
        o = this.options,
        $prev

    if (this._moving || !this._hasPrev()) return

    $prev = this._getPrevPageEl()
    this._currentVirtualPage--
    this._move($prev, function() {
        var $next = self._getNextPageEl(),
            $current = $prev

        self._setTranslateY($next[0], self._containerHeight, true)
        if (self._hasPrev()) {
            $prev = self._getPrevPageEl()
            self._setTranslateY($prev[0], -self._containerHeight, true)
            self._renderPage(self._currentVirtualPage - 1)
        }

        requestAnimationFrame(function() {
            self._setZIndexes($current)
        })
    })
}

},{"transform-property":1}]},{},[2])
(2)
});