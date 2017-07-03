/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

class Resizable {
  constructor(element, options) {
    this.wrapper = '<div class="resizable"></div>';
    this._scale = (options && options.scale) ? options.scale : 1.0;
    this.handles = '';

    this.rotation = 0;
    this.angle = 0;
    this.keepRatio = false;

    // custom handles
    if (options && options.handles) {
      this.handles += '<span class="resize-handle resize-handle-rotate"></span>';
      options.handles.map(handle => {
        this.handles += '<span class="resize-handle resize-handle-' + handle + '"></span>';
      });
    } else {
      this.handles = '<span class="resize-handle resize-handle-rotate"></span>\
                      <span class="resize-handle resize-handle-n"></span>\
                      <span class="resize-handle resize-handle-ne"></span>\
                      <span class="resize-handle resize-handle-e"></span>\
                      <span class="resize-handle resize-handle-se"></span>\
                      <span class="resize-handle resize-handle-s"></span>\
                      <span class="resize-handle resize-handle-sw"></span>\
                      <span class="resize-handle resize-handle-w"></span>\
                      <span class="resize-handle resize-handle-nw"></span>';
    }

    // wrapper min-height and min-width
    this.wrapperMinHeight = this.wrapperMinWidth = 30 / this._scale;

    // create necessary DOM elements
    this.createDOMElements(element);

    // apply styles to the element and the wrapper
    this.applyStyles(element);

    // on init events
    this.attachInitEvents(element);

    let parentStyles = getComputedStyle(this.wrapper.parentElement);
    if (parentStyles.position === 'static') {
      this.parentClientRect = {
        left: 0,
        top: 0
      };
    } else {
      this.parentClientRect = {
        left: this.wrapper.parentElement.offsetLeft,
        top: this.wrapper.parentElement.offsetTop
      };
    }

    this.rotatedClientRect = this.wrapper.getBoundingClientRect();
    this.wrapperClientRect = {
      left: this.rotatedClientRect.left / this._scale - this.parentClientRect.left,
      top: this.rotatedClientRect.top / this._scale - this.parentClientRect.top,
      height: this.rotatedClientRect.height / this._scale,
      width: this.rotatedClientRect.width / this._scale
    };

    this.wrapperCenter = {
      x: this.wrapperClientRect.left + this.wrapperClientRect.width / 2,
      y: this.wrapperClientRect.top + this.wrapperClientRect.height / 2
    };

    // track element mutations
    let elementObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        let elementHeight = element.offsetHeight;
        let elementWidth = element.offsetWidth;
        let wrapperHeight = this.wrapper.offsetHeight;
        let wrapperWidth = this.wrapper.offsetWidth;

        if (elementHeight !== wrapperHeight) {
          this.wrapper.style.height = element.style.height = elementHeight + 'px';
        }

        if (elementWidth !== wrapperWidth) {
          this.wrapper.style.width = element.style.width = elementWidth + 'px';
        }
      });
    });

    elementObserver.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: ['style']
    });

    // track wrapper mutations
    let wrapperObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        let elementHeight = element.offsetHeight;
        let elementWidth = element.offsetWidth;
        let wrapperHeight = this.wrapper.offsetHeight;
        let wrapperWidth = this.wrapper.offsetWidth;

        if (wrapperHeight !== elementHeight) {
          this.wrapper.style.height = element.style.height = wrapperHeight + 'px';
        }

        if (wrapperWidth !== elementWidth) {
          this.wrapper.style.width = element.style.width = wrapperWidth + 'px';
        }
      });
    });

    wrapperObserver.observe(this.wrapper, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: ['style']
    });
  }

  set scale(scale) {
    this._scale = scale;
  }

  get DOMElement() {
    return this.wrapper;
  }

  createDOMElements(element) {
    // add wrapper before element
    element.insertAdjacentHTML('beforebegin', this.wrapper);

    // get wrapper DOM element
    this.wrapper = element.previousSibling;

    // insert handles into the wrapper
    this.wrapper.insertAdjacentHTML('beforeend', this.handles);

    // insert element into the wrapper
    this.wrapper.appendChild(element);
  }

  applyStyles(element) {
    // apply styles to the wrapper
    Object.assign(this.wrapper.style, {
      position: 'absolute',
      left: element.offsetLeft + 'px',
      top: element.offsetTop + 'px',
      height: (element.offsetHeight > this.wrapperMinHeight) ? element.offsetHeight + 'px' : this.wrapperMinHeight + 'px',
      width: (element.offsetWidth > this.wrapperMinWidth) ? element.offsetWidth + 'px' : this.wrapperMinWidth + 'px'
    });

    // apply styles to the element
    Object.assign(element.style, {
      position: 'relative',
      left: 0,
      top: 0,
      height: this.wrapper.style.height,
      width: this.wrapper.style.width
    });
  }

  attachInitEvents(element) {
    // allow resize after click
    document.addEventListener('mousedown', e => {
      let allowed = e.target === element;
      allowed = allowed || e.target === this.wrapper;

      // BTDT: handle click event on the wrapper or the element
      if (this.onClickCallback && allowed) {
        this.onClickCallback(e);
      }

      // show handles only on the active element
      allowed = allowed || (e.target.classList.contains('resize-handle') && this.wrapper.classList.contains('active'));

      if (allowed) {
        this.wrapper.classList.add('active');
      } else {
        this.wrapper.classList.remove('active');
      }
    });

    this.handles = [...this.wrapper.querySelectorAll('.resize-handle')];
    this.handles.map(handle => {
      // disable default drag start event handler
      handle.addEventListener('dragstart', {});

      // add custom mouse down event handler
      this.mouseDown = this.mouseDown.bind(this);
      handle.addEventListener('mousedown', this.mouseDown);
    });
  }

  mouseDown(e) {
    // disable selection (Safari)
    e.preventDefault();

    // get handle direction
    this.handle = e.target.className.slice('resize-handle resize-handle-'.length);

    // calculate ratio
    this.ratio = this.wrapper.offsetHeight / this.wrapper.offsetWidth;

    // scale min-height and min-width
    this.wrapperMinHeight = this.wrapperMinWidth = 30 / this._scale;

    if (this.keepRatio) {
      if (this.wrapper.offsetHeight > this.wrapper.offsetWidth) {
        this.wrapperMinHeight = this.wrapperMinWidth * this.ratio;
      } else {
        this.wrapperMinWidth = this.wrapperMinHeight / this.ratio;
      }
    }

    let parentStyles = getComputedStyle(this.wrapper.parentElement);
    if (parentStyles.position === 'static') {
      this.parentClientRect = {
        left: 0,
        top: 0
      };
    } else {
      this.parentClientRect = {
        left: this.wrapper.parentElement.offsetLeft,
        top: this.wrapper.parentElement.offsetTop
      };
    }

    // bind `this` to event listeners
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);

    // add `mousemove` and `mouseup` event listeners
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);

    // disable selection
    return false;
  }

  mouseMove(e) {
    let wrapperNewHeight, wrapperNewWidth;

    switch (this.handle) {
      case 'rotate': {
        let x = e.pageX / this._scale - this.parentClientRect.left;
        let y = e.pageY / this._scale - this.parentClientRect.top;
        let newAngle = Math.atan2(x - this.wrapperCenter.x, -y + this.wrapperCenter.y) * (180 / Math.PI);

        // discontinuous rotate effect
        let angles = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
        angles.map(angle => {
          if (angle - 5 < newAngle && newAngle < angle + 5) {
            newAngle = angle;
          }
        });

        this.rotation = newAngle - this.angle;

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + 'px',
          top: this.wrapperClientRect.top + 'px',
          transform: 'rotate(' + newAngle + 'deg)',
          transformOrigin: 'center center'
        });
        break;
      }
      case 'n': {
        let x = e.pageX / this._scale - this.parentClientRect.left;
        let y = e.pageY / this._scale - this.parentClientRect.top;
        let alpha = Math.atan2(x - this.wrapperCenter.x, -y + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(y - this.wrapperCenter.y, 2) + Math.pow(x - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewHeight = dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        let top = this.wrapperClientRect.top - dh + dy;
        if (top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 + dy - this.wrapperMinHeight) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 + dy - this.wrapperMinHeight;
        }

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: top + 'px',
          transformOrigin: 'left bottom'
        });
        break;
      }
      case 'ne': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        wrapperNewHeight = this.keepRatio ? this.ratio * wrapperNewWidth : dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        let top = this.wrapperClientRect.top + dy;
        top += this.keepRatio ? this.wrapperClientRect.height / 2 - wrapperNewHeight : -dh;

        if (!this.keepRatio && top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + dy) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + dy;
        }

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: top + 'px',
          transformOrigin: 'left bottom'
        });
        break;
      }
      case 'e': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: this.wrapperClientRect.top - this.wrapperClientRect.height / 2 + dy + 'px',
          transformOrigin: 'left bottom'
        });
        break;
      }
      case 'se': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        wrapperNewHeight = this.keepRatio ? this.ratio * wrapperNewWidth : -dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'left top'
        });
        break;
      }
      case 's': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewHeight = -dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'left top'
        });
        break;
      }
      case 'sw': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);

        // TODO: dx and dy are not the same
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = -dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        wrapperNewHeight = this.keepRatio ? wrapperNewWidth * this.ratio : -dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        let left = this.wrapperClientRect.left + dx + dw;
        if (left > this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx) {
          left = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx;
        }

        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'right top'
        });
        break;
      }
      case 'w': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = -dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        let left = this.wrapperClientRect.left + dw + dx;
        if (left > this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx) {
          left = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx;
        }

        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'right top'
        });
        break;
      }
      case 'nw': {
        let alpha = Math.atan2(e.pageX / this._scale - this.wrapperCenter.x, -e.pageY / this._scale + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY / this._scale - this.wrapperCenter.y, 2) + Math.pow(e.pageX / this._scale - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        wrapperNewWidth = -dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < this.wrapperMinWidth ? this.wrapperMinWidth : wrapperNewWidth;

        wrapperNewHeight = this.keepRatio ? this.ratio * wrapperNewWidth : dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < this.wrapperMinHeight ? this.wrapperMinHeight : wrapperNewHeight;

        let left = this.wrapperClientRect.left + dx + dw;
        if (left > this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx) {
          left = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + dx;
        }

        let top = this.wrapperClientRect.top + dy;
        top += this.keepRatio ? this.wrapperClientRect.height / 2 - wrapperNewHeight : -dh;

        if (top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + dy) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + dy;
        }

        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: top + 'px',
          transformOrigin: 'right bottom',
        });
        break;
      }
    }

    if (this.handle !== 'rotate') {
      Object.assign(this.wrapper.style, {
        height: wrapperNewHeight + 'px',
        width: wrapperNewWidth + 'px',
      });
    }
  }

  mouseUp(e) {
    // remove `mousemove` and `mouseup` event listeners
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);

    let parentStyles = getComputedStyle(this.wrapper.parentElement);
    if (parentStyles.position === 'static') {
      this.parentClientRect = {
        left: 0,
        top: 0
      };
    } else {
      this.parentClientRect = {
        left: this.wrapper.parentElement.offsetLeft,
        top: this.wrapper.parentElement.offsetTop
      };
    }

    this.rotatedClientRect = this.wrapper.getBoundingClientRect();
    this.wrapperClientRect = {
      left: this.rotatedClientRect.left / this._scale - this.parentClientRect.left + (this.rotatedClientRect.width / this._scale - this.wrapper.offsetWidth) / 2,
      top: this.rotatedClientRect.top / this._scale - this.parentClientRect.top + (this.rotatedClientRect.height / this._scale - this.wrapper.offsetHeight) / 2,
      height: this.wrapper.offsetHeight,
      width: this.wrapper.offsetWidth
    };

    if (this.handle === 'rotate') {
      this.angle += this.rotation;
    } else {
      this.wrapperCenter = {
        x: this.wrapperClientRect.left + this.wrapperClientRect.width / 2,
        y: this.wrapperClientRect.top + this.wrapperClientRect.height / 2
      };

      if (this.onResizeCallback) {
        this.onResizeCallback();
      }
    }
  }

  onClick(callback) {
    this.onClickCallback = callback;
  }

  onResize(callback) {
    this.onResizeCallback = callback;
  }
}
