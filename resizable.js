/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

function Resizable(element) {
  /**
   * Wrap an element with handles and make it resizable
   * Remark: an element must have an id attribute
   *
   * @param element: {Object} DOM element
   * @return: undefined
   */

  if (!element.id) {
    console.warn("An element must have an id attribute.");
    return;
  }

  var wrapper = '<div class="resizable" id="resizable_' + element.id + '"></div>';
  var handles = '\
    <span class="resize-handle resize-handle-n"></span>\
    <span class="resize-handle resize-handle-ne"></span>\
    <span class="resize-handle resize-handle-e"></span>\
    <span class="resize-handle resize-handle-se"></span>\
    <span class="resize-handle resize-handle-s"></span>\
    <span class="resize-handle resize-handle-sw"></span>\
    <span class="resize-handle resize-handle-w"></span>\
    <span class="resize-handle resize-handle-nw"></span>\
    ';
  var handle;

  // element min height and min width
  // modify them according to your needs
  var wrapper_min_height = 50;
  var wrapper_min_width = 50;

  // add wrapper near element
  element.insertAdjacentHTML('beforebegin', wrapper);
  wrapper = document.getElementById('resizable_' + element.id);

  // insert handles into wrapper
  wrapper.insertAdjacentHTML('beforeend', handles);

  // insert element into wrapper
  wrapper.appendChild(element);

  // style wrapper
  wrapper.style.left = element.style.left;
  wrapper.style.top = element.style.top;
  wrapper.style.height = (parseInt(element.offsetHeight, 10) > wrapper_min_height) ? element.offsetHeight + 'px' : wrapper_min_height + 'px';
  wrapper.style.width = (parseInt(element.offsetWidth, 10) > wrapper_min_width) ? element.offsetWidth + 'px' : wrapper_min_width + 'px';

  // set wrapper min height and min width
  wrapper.style.minHeight = wrapper_min_height + 'px';
  wrapper.style.minWidth = wrapper_min_width + 'px';

  // style element
  element.style.position = 'relative';
  element.style.left = '0px';
  element.style.top = '0px';
  element.style.height = '100%';
  element.style.width = '100%';

  var wrapper_old_height = wrapper.offsetHeight;
  var wrapper_old_width = wrapper.offsetWidth;

  handles = wrapper.querySelectorAll('.resize-handle');
  for (var i = 0; i < handles.length; i++) {
    // disable default drag start event handler
    handles[i].addEventListener('dragstart', false);
    // add custom mouse down event handler
    handles[i].addEventListener('mousedown', mouse_down);
  }

  function mouse_down(event) {
    /**
     * Start element resize, add listeners to mouse move and mouse up events.
     *
     * @param event: {Object} mouse down event
     * @return: undefined
     */

    // get handle side
    handle = event.target.className.slice('resize-handle resize-handle-'.length);

    // add event listeners to mouse move and mouse up
    document.addEventListener('mousemove', mouse_move);
    document.addEventListener('mouseup', mouse_up);

    // add active class
    wrapper.classList.add('active');

    // disable selection
    return false;
  }

  function mouse_move(event) {
    /**
     * Calculate wrapper new height and new width on mouse move
     *
     * @param event: {Object} mouse move event
     * @return: undefined
     */

    var left = wrapper.getBoundingClientRect().left + document.body.scrollLeft;
    var right = window.innerWidth - left - parseInt(wrapper.style.width, 10);
    var top = wrapper.getBoundingClientRect().top + document.body.scrollTop;
    var bottom = window.innerHeight - top - parseInt(wrapper.style.height, 10);
    var wrapper_new_height, wrapper_new_width;

    switch (handle) {
      case 'n':
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapper_new_height = window.innerHeight - bottom - event.pageY;
        break;
      case 'ne':
        wrapper.style.left = left + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapper_new_height = window.innerHeight - bottom - event.pageY;
        wrapper_new_width = event.pageX - left;
        break;
      case 'e':
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapper_new_width = event.pageX - left;
        break;
      case 'se':
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapper_new_height = event.pageY - top;
        wrapper_new_width = event.pageX - left;
        break;
      case 's':
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapper_new_height = event.pageY - top;
        break;
      case 'sw':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapper_new_height = event.pageY - top;
        wrapper_new_width = window.innerWidth - right - event.pageX;
        break;
      case 'w':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapper_new_width = window.innerWidth - right - event.pageX;
        break;
      case 'nw':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapper_new_height = window.innerHeight - bottom - event.pageY;
        wrapper_new_width = window.innerWidth - right - event.pageX;
        break;
    }

    // if wrapper new height is less than wrapper min height
    if (wrapper_new_height && wrapper_new_height < wrapper_min_height) {
      wrapper_new_height = wrapper_min_height;
    }

    // if wrapper new width is less than wrapper min width
    if (wrapper_new_width && wrapper_new_width < wrapper_min_width) {
      wrapper_new_width = wrapper_min_width;
    }

    // set new wrapper height
    wrapper.style.height = wrapper_new_height + 'px';
    wrapper.style.width = wrapper_new_width + 'px';
  }

  function mouse_up(event) {
    /**
     * Finish element resize, remove mouse move and mouse up events.
     *
     * @param event: {Object} mouse up event
     * @return: undefined
     */

    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', mouse_move);
    document.removeEventListener('mouseup', mouse_up);

    // remove active class
    wrapper.classList.remove('active');

    var wrapper_new_height = wrapper.offsetHeight;
    var wrapper_new_width = wrapper.offsetWidth;

    // if nothing changed
    if (wrapper_new_height === wrapper_old_height && wrapper_new_width === wrapper_old_width) {
      return;
    }

    // redefine wrapper old height and old width
    wrapper_old_height = wrapper_new_height;
    wrapper_old_width = wrapper_new_width;
  }
}
