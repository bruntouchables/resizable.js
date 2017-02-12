/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

let Resizable = (() => {
  let wrapper = '<div class="resizable"></div>';
  let handles = '<span class="resize-handle resize-handle-n"></span>\
                 <span class="resize-handle resize-handle-ne"></span>\
                 <span class="resize-handle resize-handle-e"></span>\
                 <span class="resize-handle resize-handle-se"></span>\
                 <span class="resize-handle resize-handle-s"></span>\
                 <span class="resize-handle resize-handle-sw"></span>\
                 <span class="resize-handle resize-handle-w"></span>\
                 <span class="resize-handle resize-handle-nw"></span>';
  let handle;
  let onInitCallback;

  // wrapper min height and min width
  let wrapperMinHeight = 50;
  let wrapperMinWidth = 50;

  // remember element's height and width to detect changes
  let wrapperOldHeight, wrapperOldWidth;

  /**
   * Start element resize, add "mouse move" and "mouse up" event listeners
   * @param event: "mouse down" event
   * @private
   */
  function _mouseDown(event) {
    // disable selection (Safari)
    event.preventDefault();

    // get handle direction
    handle = event.target.className.slice('resize-handle resize-handle-'.length);
    
    // add event listeners to mouse move and mouse up
    document.addEventListener('mousemove', _mouseMove);
    document.addEventListener('mouseup', _mouseUp);

    // disable selection
    return false;
  }

  /**
   * Calculate wrapper new height and new width on mouse move
   * @param event: "mouse move" event
   * @private
   */
  function _mouseMove(event) {
    // BTDT: this is the right order
    let left = wrapper.getBoundingClientRect().left + document.body.scrollLeft;
    let right = window.innerWidth - left - parseInt(wrapper.style.width, 10);
    let top = wrapper.getBoundingClientRect().top + document.body.scrollTop;
    let bottom = window.innerHeight - top - parseInt(wrapper.style.height, 10);
    let wrapperNewHeight, wrapperNewWidth;

    // BTDT: styles are sorted in clockwise order
    switch (handle) {
      case 'n': {
        Object.assign(wrapper.style, {
          left: left + 'px',
          top: 'auto',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        break;
      }
      case 'ne': {
        Object.assign(wrapper.style, {
          left: left + 'px',
          top: 'auto',
          right: 'auto',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 'e': {
        Object.assign(wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: 'auto',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 'se': {
        Object.assign(wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: 'auto',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 's': {
        Object.assign(wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          right: right + 'px',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        break;
      }
      case 'sw': {
        Object.assign(wrapper.style, {
          left: 'auto',
          top: top + 'px',
          right: right + 'px',
          bottom: 'auto'
        });
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
      case 'w': {
        Object.assign(wrapper.style, {
          left: 'auto',
          top: top + 'px',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
      case 'nw': {
        Object.assign(wrapper.style, {
          left: 'auto',
          top: 'auto',
          right: right + 'px',
          bottom: bottom + 'px'
        });
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
    }

    // don't let wrapper height become less than wrapper min height
    if (wrapperNewHeight !== undefined && wrapperNewHeight < wrapperMinHeight) {
      wrapperNewHeight = wrapperMinHeight;
    }

    // don't let wrapper width become less than wrapper min width
    if (wrapperNewWidth !== undefined && wrapperNewWidth < wrapperMinWidth) {
      wrapperNewWidth = wrapperMinWidth;
    }

    // set new wrapper height
    Object.assign(wrapper.style, {
      height: (wrapperNewHeight !== undefined) ? wrapperNewHeight + 'px' : wrapperOldHeight + 'px',
      width: (wrapperNewWidth !== undefined) ? wrapperNewWidth + 'px' : wrapperOldWidth + 'px'
    });
  }

  /**
   * Finish element resize, remove "mouse move" and "mouse up" event listeners
   * @param event: "mouse up" event
   * @private
   */
  function _mouseUp(event) {
    // remove "mouse move" and "mouse up" events
    document.removeEventListener('mousemove', _mouseMove);
    document.removeEventListener('mouseup', _mouseUp);

    let wrapperNewHeight = wrapper.offsetHeight;
    let wrapperNewWidth = wrapper.offsetWidth;

    // if nothing has changed
    if (wrapperNewHeight === wrapperOldHeight && wrapperNewWidth === wrapperOldWidth) {
      return;
    }

    // set wrapper old height and old width
    wrapperOldHeight = wrapperNewHeight;
    wrapperOldWidth = wrapperNewWidth;
  }

  /**
   * Create DOM elements for the wrapper, element, and handles.
   * @param element: a DOM element to resize
   * @private
   */
  function _createDOMElements(element) {
    // add wrapper near element
    element.insertAdjacentHTML('beforebegin', wrapper);
    wrapper = element.previousSibling;

    // insert handles into the wrapper
    wrapper.insertAdjacentHTML('beforeend', handles);

    // insert element into the wrapper
    wrapper.appendChild(element);
  }

  /**
   * Apply styles to wrapper and element.
   * @param element: a DOM element to resize
   * @private
   */
  function _applyStyles(element) {
    let elementHeight = parseInt(element.offsetHeight, 10);
    let elementWidth = parseInt(element.offsetWidth, 10);

    // set wrapper min height and min width
    Object.assign(wrapper.style, {
      height: (elementHeight > wrapperMinHeight) ? elementHeight + 'px' : wrapperMinHeight + 'px',
      left: element.style.left,
      position: 'absolute',
      top: element.style.top,
      width: (elementWidth > wrapperMinWidth) ? elementWidth + 'px' : wrapperMinWidth + 'px'
    });

    // style element
    Object.assign(element.style, {
      height: '100%',
      left: '0',
      position: 'relative',
      top: '0',
      width: '100%'
    });

    wrapperOldHeight = wrapper.offsetHeight;
    wrapperOldWidth = wrapper.offsetWidth;
  }

  /**
   * Attach events on init.
   * @param element: a DOM element to resize
   * @private
   */
  function _attachInitEvents(element) {
    // allow resize after click
    document.addEventListener('mousedown', (event) => {
      let allowed = event.target === element;
      allowed = allowed || event.target === wrapper;
      allowed = allowed || event.target.classList.contains('resize-handle');

      if (allowed) {
        // add active class to wrapper
        wrapper.classList.add('active');
      } else {
        // remove active class from wrapper
        wrapper.classList.remove('active');
      }
    });

    handles = wrapper.querySelectorAll('.resize-handle');
    for (let i = 0; i < handles.length; ++i) {
      // disable default "drag start" event handler
      handles[i].addEventListener('dragstart', {});
      // add custom "mouse down" event handler
      handles[i].addEventListener('mousedown', _mouseDown);
    }
  }

  /**
   * Wrap an element with handles and make it resizable.
   * @param element: a DOM element to resize
   * @param callback: "on init" callback
   * @return: {*} a Resizable element
   */
  let init = (element, callback) => {
    // create necessary DOM elements
    _createDOMElements(element);

    // style wrapper and element
    _applyStyles(element);

    // attach events on init
    _attachInitEvents(element);
    
    // callback call
    if (onInitCallback = callback) {
      onInitCallback();
    }

    return Resizable;
  };

  return {
    init: init
  };
})();