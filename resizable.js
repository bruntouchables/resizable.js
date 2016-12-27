/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

let Resizable = (() => {
  let handle;
  let wrapper = '<div class="resizable"></div>';
  let handles = '<span class="resize-handle resize-handle-rotate"></span>\
                 <span class="resize-handle resize-handle-n"></span>\
                 <span class="resize-handle resize-handle-ne"></span>\
                 <span class="resize-handle resize-handle-e"></span>\
                 <span class="resize-handle resize-handle-se"></span>\
                 <span class="resize-handle resize-handle-s"></span>\
                 <span class="resize-handle resize-handle-sw"></span>\
                 <span class="resize-handle resize-handle-w"></span>\
                 <span class="resize-handle resize-handle-nw"></span>';
  let onInitCallback;

  // element min height and min width
  let wrapperMinHeight = 50;
  let wrapperMinWidth = 50;

  // remember element height and width to detect change
  let wrapperOldHeight;
  let wrapperOldWidth;

  /**
   * Start element resize, add mouse move and mouse up event listeners
   * @param event: {Object} mouse down event
   */
  function _mouseDown(event) {
    // get handle side
    handle = event.target.className.slice('resize-handle resize-handle-'.length);

    // add event listeners to mouse move and mouse up
    document.addEventListener('mousemove', _mouseMove);
    document.addEventListener('mouseup', _mouseUp);

    // disable selection
    return false;
  }

  /**
   * Calculate wrapper new height and new width on mouse move
   * @param event: {Object} mouse move event
   */
  function _mouseMove(event) {
    let left = wrapper.getBoundingClientRect().left + document.body.scrollLeft;
    let right = window.innerWidth - left - parseInt(wrapper.style.width, 10);
    let top = wrapper.getBoundingClientRect().top + document.body.scrollTop;
    let bottom = window.innerHeight - top - parseInt(wrapper.style.height, 10);
    let wrapperNewHeight, wrapperNewWidth;

    switch (handle) {
      case 'rotate': {
        
        break;
      }
      case 'n': {
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        break;
      }
      case 'ne': {
        wrapper.style.left = left + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 'e': {
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 'se': {
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = event.pageX - left;
        break;
      }
      case 's': {
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        break;
      }
      case 'sw': {
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
      case 'w': {
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
      case 'nw': {
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      }
    }

    // don't let wrapper height become less than wrapper min height
    if (wrapperNewHeight && wrapperNewHeight < wrapperMinHeight) {
      wrapperNewHeight = wrapperMinHeight;
    }

    // don't let wrapper width become less than wrapper min width
    if (wrapperNewWidth && wrapperNewWidth < wrapperMinWidth) {
      wrapperNewWidth = wrapperMinWidth;
    }

    // set new wrapper height
    wrapper.style.height = wrapperNewHeight + 'px';
    wrapper.style.width = wrapperNewWidth + 'px';
  }

  /**
   * Finish element resize, remove mouse move and mouse up event listeners
   * @param event: {Object} mouse up event
   */
  function _mouseUp(event) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', _mouseMove);
    document.removeEventListener('mouseup', _mouseUp);

    let wrapperNewHeight = wrapper.offsetHeight;
    let wrapperNewWidth = wrapper.offsetWidth;

    // if nothing changed
    if (wrapperNewHeight === wrapperOldHeight && wrapperNewWidth === wrapperOldWidth) {
      return;
    }

    // redefine wrapper old height and old width
    wrapperOldHeight = wrapperNewHeight;
    wrapperOldWidth = wrapperNewWidth;
  }

  /**
   * Wrap an element with handles and make it resizable
   * @param element: {Object} DOM element
   * @param callback: {Function} on init callback
   * @return: {Object} module (allow chaining)
   */
  let init = (element, callback) => {
    // add wrapper near element
    element.insertAdjacentHTML('beforebegin', wrapper);
    wrapper = element.previousSibling;

    // insert handles into wrapper
    wrapper.insertAdjacentHTML('beforeend', handles);

    // insert element into wrapper
    wrapper.appendChild(element);

    // style wrapper
    wrapper.style.left = element.style.left;
    wrapper.style.top = element.style.top;

    // set wrapper height
    if (parseInt(element.offsetHeight, 10) > wrapperMinHeight) {
      wrapper.style.height = element.offsetHeight + 'px';
    } else {
      wrapper.style.height = wrapperMinHeight + 'px'
    }

    // set wrapper width
    if (parseInt(element.offsetWidth, 10) > wrapperMinWidth) {
      wrapper.style.width = element.offsetWidth + 'px';
    } else {
      wrapper.style.width = wrapperMinWidth + 'px'
    }

    // set wrapper min height and min width
    wrapper.style.minHeight = wrapperMinHeight + 'px';
    wrapper.style.minWidth = wrapperMinWidth + 'px';

    // style element
    element.style.position = 'relative';
    element.style.left = '0px';
    element.style.top = '0px';
    element.style.height = '100%';
    element.style.width = '100%';

    wrapperOldHeight = wrapper.offsetHeight;
    wrapperOldWidth = wrapper.offsetWidth;

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
    for (let i = 0; i < handles.length; i++) {
      // disable default drag start event handler
      // FF bug here
      handles[i].addEventListener('dragstart', false);
      // add custom mouse down event handler
      handles[i].addEventListener('mousedown', _mouseDown);
    }

    // assign on init callback
    onInitCallback = callback;

    // callback call
    if (onInitCallback) {
      onInitCallback();
    }

    return Resizable;
  };

  return {
    init: init
  };
})();
