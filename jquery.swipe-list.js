/**
 * Scroll container replacement for weak devices.
 *
 * @author Oleg Slobodskoi 2014
 */
(function(factory) {
    if (typeof define == 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory)
    } else {
        // Browser globals
        factory(jQuery)
    }
})(function($, undefined) {
    'use strict'

    var transform = transformProperty(),
        vendor = transform.substr(0, transform.length - 9),
        slice = [].slice


    function transformProperty() {
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
            return style;
          }
        }
    }

    function SwipeList($container, options) {
        this.elements = {container: $container}
        this.options = $.extend({}, SwipeList.defaults, options)
        this._currentVirtualPage = 0
        this._itemsPerPage = 0
    }

    SwipeList.defaults = {
        // Elements selector or jquery collection.
        items: null,
        pages: 3,
        render: $.noop,
        data: [],
        swipeThreshold: 10,
        easing: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
        duration: 500
    }

    SwipeList.prototype.init = function() {
        this.elements.items = this.elements.container.find(this.options.items)
        this.elements.container.addClass('swipe-list')
        this._calcDimensions()
        this._splitPages()
        this._insertPages()
        this._renderPage(0)
        this._renderPage(1)
        this._bind()
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
        var $items = this.elements.items,
            pageNr, itemNr = 0, itemNrInPage, $page,
            $pages = $()

        for (pageNr = 0; pageNr < this.options.pages; pageNr++) {
            $page = $('<div class="swipe-list-page swipe-list-page-'+ pageNr +'"></div>')
            $pages = $pages.add($page)
            for (itemNrInPage = 0; itemNrInPage < this._itemsPerPage; itemNrInPage++) {
                if ($items[itemNr]) $items.eq(itemNr).appendTo($page)
                itemNr++
            }
        }

        this._setTranslateY($pages[1], this._containerHeight)
        this._setTranslateY($pages[2], this._containerHeight)
        this.elements.pages = $pages
    }

    SwipeList.prototype._insertPages = function() {
        this.elements.container.html(this.elements.pages)
    }

    SwipeList.prototype._renderPage = function(virtualPageNr) {
        var o = this.options,
            realPageNr = virtualPageNr % o.pages,
            realElemNr = realPageNr * this._itemsPerPage,
            virtualElemNr = virtualPageNr *  this._itemsPerPage,
            i, $item, data

        for (i = 0; i < this._itemsPerPage; i++) {
            $item = this.elements.items.eq(realElemNr)
            data = o.data[virtualElemNr]
            if (data) o.render($item, data)
            realElemNr++
            virtualElemNr++
        }
    }

    SwipeList.prototype._onMoveStart = function(e) {
        this._startY = e.pageY
    }

    SwipeList.prototype._onMoveEnd = function(e) {
        var event

        this._currentY = e.pageY
        this._dist = Math.abs(this._currentY - this._startY)
        if (this._dist > this.options.swipeThreshold) {
            event = this._currentY > this._startY ? 'swipedown' : 'swipeup'
            this.elements.container.triggerHandler(event)
        }
    }

    SwipeList.prototype._onSwipeUp = function() {
        var self = this,
            o = this.options,
            curRealPage = this._currentVirtualPage % o.pages,
            $next

        if (this._hasNext()) {
            $next = this._getNextPageEl()
            this._setZIndexes($next)
            this._currentVirtualPage++
            this._animate($next, 'up', function() {
                var $prev = self._getPrevPageEl()
                self._setTranslateY($prev[0], -self._containerHeight)
                if (self._hasNext()) self._renderPage(self._currentVirtualPage + 1)
            })
        }

    }

    SwipeList.prototype._onSwipeDown = function() {

    }

    SwipeList.prototype._animate = function($el, dir, callback) {
        var self = this,
            o = this.options

        this._onceTransitionEnd($el[0], o.duration, function() {
            self._setTransition($el[0], null)
            callback()
        })
        this._setTransition($el[0], o.duration + 'ms ' + o.easing)
        this._setTranslateY($el[0], dir == 'up' ? 0 : this._containerHeight)
    }

    SwipeList.prototype._setTranslateY = function(el, y) {
        el.style[transform] = 'translateY(' + y + 'px)'
    }

    SwipeList.prototype._setZIndexes = function($next) {
        this.elements.pages.css('z-index', 0)
        $next.css('z-index', '1')
    }

    SwipeList.prototype._hasNext = function() {
        return Boolean(this.options.data[this._currentVirtualPage + 1])
    }

    SwipeList.prototype._getNextPageEl = function() {
        var curRealPage = this._currentVirtualPage % this.options.pages,
            nextRealPage = curRealPage + 1 >= this.options.pages ? 0 : curRealPage + 1

        return this.elements.pages.eq(nextRealPage)
    }

    SwipeList.prototype._getPrevPageEl = function() {
        var curRealPage = this._currentVirtualPage % this.options.pages,
            prevRealPage = curRealPage - 1 < 0 ? this.options.pages - 1 : curRealPage - 1

        return this.elements.pages.eq(prevRealPage)
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
        }, duration + 20)

        return this
    }

    $.fn.swipeList = function(options) {
        var ret, args = slice.call(arguments, 1)

        this.each(function() {
            var $this = $(this),
                inst = $this.data('swipeList')

            if (inst) {
                ret = inst[options].apply(inst, args)
                if (ret === inst) ret = null
            } else {
                inst = new SwipeList($this, options)
                inst.init()
                $this.data('swipeList', inst)
            }
        })

        return ret != null ? ret : this
    }


    $.fn.swipeList.SwipeList = SwipeList
});
