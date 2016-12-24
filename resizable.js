/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

/**
 * Wrap an element with handles and make it resizable
 *
 * @param element: {Object} DOM element
 * @return: undefined
 */
function Resizable(element) {
  let handle;
  let wrapper = '<div class="resizable"></div>';
  let handles = '<span class="resize-handle resize-handle-n"></span>\
                 <span class="resize-handle resize-handle-ne"></span>\
                 <span class="resize-handle resize-handle-e"></span>\
                 <span class="resize-handle resize-handle-se"></span>\
                 <span class="resize-handle resize-handle-s"></span>\
                 <span class="resize-handle resize-handle-sw"></span>\
                 <span class="resize-handle resize-handle-w"></span>\
                 <span class="resize-handle resize-handle-nw"></span>';

  // element min height and min width
  // modify them according to your needs
  let wrapperMinHeight = 50;
  let wrapperMinWidth = 50;

  console.log(element);

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
  wrapper.style.height = (parseInt(element.offsetHeight, 10) > wrapperMinHeight) ? element.offsetHeight + 'px' : wrapperMinHeight + 'px';
  wrapper.style.width = (parseInt(element.offsetWidth, 10) > wrapperMinWidth) ? element.offsetWidth + 'px' : wrapperMinWidth + 'px';

  // set wrapper min height and min width
  wrapper.style.minHeight = wrapperMinHeight + 'px';
  wrapper.style.minWidth = wrapperMinWidth + 'px';

  // style element
  element.style.position = 'relative';
  element.style.left = '0px';
  element.style.top = '0px';
  element.style.height = '100%';
  element.style.width = '100%';

  let wrapperOldHeight = wrapper.offsetHeight;
  let wrapperOldWidth = wrapper.offsetWidth;

  handles = wrapper.querySelectorAll('.resize-handle');
  for (let i = 0; i < handles.length; i++) {
    // disable default drag start event handler
    // FF bug here
    handles[i].addEventListener('dragstart', false);
    // add custom mouse down event handler
    handles[i].addEventListener('mousedown', mouseDown);
  }

  /**
   * Start element resize, add listeners to mouse move and mouse up events.
   *
   * @param event: {Object} mouse down event
   * @return: undefined
   */
  function mouseDown(event) {
    // get handle side
    handle = event.target.className.slice('resize-handle resize-handle-'.length);

    // add event listeners to mouse move and mouse up
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);

    // add active class
    wrapper.classList.add('active');

    // disable selection
    return false;
  }

  /**
   * Calculate wrapper new height and new width on mouse move
   *
   * @param event: {Object} mouse move event
   * @return: undefined
   */
  function mouseMove(event) {
    let left = wrapper.getBoundingClientRect().left + document.body.scrollLeft;
    let right = window.innerWidth - left - parseInt(wrapper.style.width, 10);
    let top = wrapper.getBoundingClientRect().top + document.body.scrollTop;
    let bottom = window.innerHeight - top - parseInt(wrapper.style.height, 10);
    let wrapperNewHeight, wrapperNewWidth;

    switch (handle) {
      case 'n':
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        break;
      case 'ne':
        wrapper.style.left = left + 'px';
        wrapper.style.right = 'auto';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = event.pageX - left;
        break;
      case 'e':
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewWidth = event.pageX - left;
        break;
      case 'se':
        wrapper.style.left = left + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = event.pageX - left;
        break;
      case 's':
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        break;
      case 'sw':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewHeight = event.pageY - top;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      case 'w':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = top + 'px';
        wrapper.style.bottom = 'auto';
        // adjust wrapper sizes
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
      case 'nw':
        wrapper.style.left = 'auto';
        wrapper.style.right = right + 'px';
        wrapper.style.top = 'auto';
        wrapper.style.bottom = bottom + 'px';
        // adjust wrapper sizes
        wrapperNewHeight = window.innerHeight - bottom - event.pageY;
        wrapperNewWidth = window.innerWidth - right - event.pageX;
        break;
    }

    // if wrapper new height is less than wrapper min height
    if (wrapperNewHeight && wrapperNewHeight < wrapperMinHeight) {
      wrapperNewHeight = wrapperMinHeight;
    }

    // if wrapper new width is less than wrapper min width
    if (wrapperNewWidth && wrapperNewWidth < wrapperMinWidth) {
      wrapperNewWidth = wrapperMinWidth;
    }

    // set new wrapper height
    wrapper.style.height = wrapperNewHeight + 'px';
    wrapper.style.width = wrapperNewWidth + 'px';
  }

  /**
   * Finish element resize, remove mouse move and mouse up events.
   *
   * @param event: {Object} mouse up event
   * @return: undefined
   */
  function mouseUp(event) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);

    // remove active class
    wrapper.classList.remove('active');

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
}
