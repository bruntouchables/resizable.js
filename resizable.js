/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

function Resizable(element) {
  /**
   * Wrap element with handles and make it resizable
   * Remark: element must have an id attribute
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

  // element custom min sizes
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

  // style element
  element.style.left = '0px';
  element.style.top = '0px';
  element.style.height = (parseInt(element.offsetHeight, 10) > wrapper_min_height) ? '100%' : wrapper_min_height + 'px';
  element.style.width = (parseInt(element.offsetWidth, 10) > wrapper_min_width) ? '100%' : wrapper_min_width + 'px';

  var wrapper_old_height = wrapper.offsetHeight;
  var wrapper_old_width = wrapper.offsetWidth;
}
