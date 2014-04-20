## Infinite scroll for old and weak mobile devices

Typical scroll animation requires a lot of performance, while there are some different ui patterns which can solve the same problem on any device really fast and effective.

Swipe list implements a pattern where you scroll/swipe the entire page. This way we can animate just 1 page at once and render only 3 pages at the same time. This technique allows a fluent infinite scroll on any device.


## Require/instantiate

    // Commonjs
    var SwipeList = require('SwipeList')

    var list = new SwipeList($elem, options)

    // jquery
    $(container).swipeList(options)

## Options/defaults

    {
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

## License MIT
