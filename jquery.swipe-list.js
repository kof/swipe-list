'use strict'

var SwipeList = require('./index'),
    slice = [].slice

/**
 * jQuery plugin binding.
 *
 * @param {Object} options, see SwipeList.defaults
 * @return {jQuery}
 * @api public
 */
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

// Expose constructor to jquery namespace.
$.fn.swipeList.SwipeList = SwipeList
