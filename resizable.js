/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 7/21/16.
 */


'use strict';

class Resizable {
  constructor(element, options) {
    this.wrapper = '<div class="resizable"></div>';
    // this._scale = (options && options.scale) ? options.scale : 1.0;
    this.handles = '';

    this.rotation = 0;
    this.angle = 0;

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

    // wrapper min height and min width
    this.wrapperMinHeight = 30;
    this.wrapperMinWidth = 30;

    // create necessary DOM elements
    this.createDOMElements(element);

    // apply styles to the element and the wrapper
    this.applyStyles(element);

    // attach on init events
    this.attachInitEvents(element);

    this.rotatedClientRect = this.wrapper.getBoundingClientRect();
    this.wrapperClientRect = {
      left: this.rotatedClientRect.left,
      top: this.rotatedClientRect.top,
      height: this.rotatedClientRect.height,
      width: this.rotatedClientRect.width
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
        let wrapperHeight = this.wrapper.offsetHeight;
        let elementWidth = element.offsetWidth;
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

  // set scale(scale) {
  //   this._scale = scale;
  // }

  // get DOMElement() {
  //   return this.wrapper;
  // }

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
    let elementHeight = parseInt(element.offsetHeight, 10);
    let elementWidth = parseInt(element.offsetWidth, 10);

    // apply styles to the wrapper
    Object.assign(this.wrapper.style, {
      height: (elementHeight > this.wrapperMinHeight) ? elementHeight + 'px' : this.wrapperMinHeight + 'px',
      left: '200px',
      // left: element.style.left,
      position: 'absolute',
      top: '200px',
      // top: element.style.top,
      width: (elementWidth > this.wrapperMinWidth) ? elementWidth + 'px' : this.wrapperMinWidth + 'px'
    });

    // apply styles to the element
    Object.assign(element.style, {
      height: this.wrapper.style.height,
      left: '0',
      position: 'relative',
      top: '0',
      width: this.wrapper.style.width
    });

    this.wrapperOldHeight = this.wrapper.offsetHeight;
    this.wrapperOldWidth = this.wrapper.offsetWidth;
  }

  attachInitEvents(element) {
    // allow resize after click
    document.addEventListener('mousedown', e => {
      let allowed = e.target === element;
      allowed = allowed || e.target === this.wrapper;

      // show handles only on the active element
      allowed = allowed || (e.target.classList.contains('resize-handle') && this.wrapper.classList.contains('active'));

      if (allowed) {
        this.wrapper.classList.add('active');
      } else {
        this.wrapper.classList.remove('active');
      }
    });

    this.handles = this.wrapper.querySelectorAll('.resize-handle');
    Array.prototype.map.call(this.handles, handle => {
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

    // // calculate ratio
    // let {height, width} = this.wrapper.getBoundingClientRect();
    // this.ratio = height / width;

    // add event listeners to mouse move and mouse up
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    document.addEventListener('mousemove', this.mouseMove);
    document.addEventListener('mouseup', this.mouseUp);

    // disable selection
    return false;
  }

  mouseMove(e) {
    let parentStyle = window.getComputedStyle(this.wrapper.parentElement);
    if (parentStyle.position === 'static') {
      this.parent = {
        left: 0,
        top: 0,
        height: window.innerHeight,
        width: window.innerWidth
      };
    } else {
      this.parent = this.wrapper.parentElement.getBoundingClientRect();
    }

    let {height, width, left, top} = this.wrapper.getBoundingClientRect();
    left = left - this.parent.left;
    top = top - this.parent.top;
    // let right = this.parent.width - left - width;
    // let bottom = this.parent.height - top - height;

    // this.wrapperOldHeight = height / this._scale;
    // this.wrapperOldWidth = width / this._scale;

    // let wrapperNewHeight, wrapperNewWidth;
    // let keepRatio = false;

    // BTDT: styles are sorted in clockwise order
    switch (this.handle) {
      case 'rotate': {
        let newAngle = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y,) * (180 / Math.PI);
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
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        // don't let wrapper's height become smaller than wrapperMinHeight
        let top = this.wrapperClientRect.top - dh + dy;
        let mdy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;
        
        let wrapperNewHeight = dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < 30 ? 30 : wrapperNewHeight;
        
        if (top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy;
        }

        Object.assign(this.wrapper.style, {
          height: wrapperNewHeight + 'px',
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: top + 'px',
          transformOrigin: 'left bottom'
        });

        // Object.assign(this.wrapper.style, {
        //   left: left / this._scale + 'px',
        //   top: 'auto',
        //   right: right / this._scale + 'px',
        //   bottom: bottom / this._scale + 'px'
        // });
        // wrapperNewHeight = (this.parent.height - bottom + this.parent.top - e.pageY) / this._scale;
        break;
      }
      case 'ne': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        // TODO: element jumps
        // don't let wrapper's height become smaller than wrapperMinHeight
        let top = this.wrapperClientRect.top - dh + dy;
        let mdy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        let wrapperNewHeight = dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < 30 ? 30 : wrapperNewHeight;

        if (top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy;
        }

        // don't let wrapper's width become smaller than wrapperMinWidth
        let left = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx;
        let mdx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;

        let wrapperNewWidth = dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < 30 ? 30 : wrapperNewWidth;

        if (left > this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + mdx) {
          top = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + mdx;
        }

        Object.assign(this.wrapper.style, {
          height: wrapperNewHeight + 'px',
          left: left + 'px',
          top: top + 'px',
          transformOrigin: 'left bottom',
          width: wrapperNewWidth + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: left / this._scale + 'px',
        //   top: 'auto',
        //   right: 'auto',
        //   bottom: bottom / this._scale + 'px'
        // });
        // wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
        // wrapperNewHeight = this.ratio * wrapperNewWidth;
        // keepRatio = true;
        // }
        break;
      }
      case 'e': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        // don't let wrapper's width become smaller than wrapperMinWidth
        let left = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx;
        let mdx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        
        let wrapperNewWidth = dw + this.wrapperClientRect.width / 2;
        wrapperNewWidth = wrapperNewWidth < 30 ? 30 : wrapperNewWidth;

        if (left > this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + mdx) {
          top = this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - this.wrapperMinWidth + mdx;
        }

        Object.assign(this.wrapper.style, {
          left: left + 'px',
          top: this.wrapperClientRect.top - this.wrapperClientRect.height / 2 + dy + 'px',
          transformOrigin: 'left bottom',
          width: wrapperNewWidth + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: left / this._scale + 'px',
        //   top: top / this._scale + 'px',
        //   right: 'auto',
        //   bottom: bottom / this._scale + 'px'
        // });
        // wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
        break;
      }
      case 'se': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        Object.assign(this.wrapper.style, {
          height: -dh + this.wrapperClientRect.height / 2 + 'px',
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'left top',
          width: dw + this.wrapperClientRect.width / 2 + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: left / this._scale + 'px',
        //   top: top / this._scale + 'px',
        //   right: 'auto',
        //   bottom: 'auto'
        // });
        // wrapperNewWidth = (e.pageX - left - this.parent.left) / this._scale;
        // wrapperNewHeight = this.ratio * wrapperNewWidth;
        // keepRatio = true;
        break;
      }
      case 's': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        // TODO: element jumps
        // don't let wrapper's height become smaller than wrapperMinHeight
        let top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy;
        let mdy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        let wrapperNewHeight = -dh + this.wrapperClientRect.height / 2;
        wrapperNewHeight = wrapperNewHeight < 30 ? 30 : wrapperNewHeight;

        if (top > this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy) {
          top = this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - this.wrapperMinHeight + mdy;
        }
        
        Object.assign(this.wrapper.style, {
          height: wrapperNewHeight + 'px',
          left: this.wrapperClientRect.left + this.wrapperClientRect.width / 2 - dx + 'px',
          top: top + 'px',
          transformOrigin: 'left top'
        });

        // Object.assign(this.wrapper.style, {
        //   left: left / this._scale + 'px',
        //   top: top / this._scale + 'px',
        //   right: right / this._scale + 'px',
        //   bottom: 'auto'
        // });
        // wrapperNewHeight = (e.pageY - top - this.parent.top) / this._scale;
        break;
      }
      case 'sw': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        // TODO: dx and dy are not the same
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        Object.assign(this.wrapper.style, {
          height: -dh + this.wrapperClientRect.height / 2 + 'px',
          left: this.wrapperClientRect.left + dx + dw + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'right top',
          width: -dw + this.wrapperClientRect.width / 2 + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: 'auto',
        //   top: top / this._scale + 'px',
        //   right: right / this._scale + 'px',
        //   bottom: 'auto'
        // });
        // wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
        // wrapperNewHeight = this.ratio * wrapperNewWidth;
        // keepRatio = true;
        break;
      }
      case 'w': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 + Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = -Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        Object.assign(this.wrapper.style, {
          left: this.wrapperClientRect.left + dw + dx + 'px',
          top: this.wrapperClientRect.top + this.wrapperClientRect.height / 2 - dy + 'px',
          transformOrigin: 'right top',
          width: -dw + this.wrapperClientRect.width / 2 + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: 'auto',
        //   top: top / this._scale + 'px',
        //   right: right / this._scale + 'px',
        //   bottom: bottom / this._scale + 'px'
        // });
        // wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
        break;
      }
      case 'nw': {
        let alpha = Math.atan2(e.pageX - this.wrapperCenter.x, -e.pageY + this.wrapperCenter.y);
        let angle = this.angle * (Math.PI / 180);
        let d = Math.sqrt(Math.pow(e.pageY - this.wrapperCenter.y, 2) + Math.pow(e.pageX - this.wrapperCenter.x, 2));
        let dh = d * Math.cos(alpha - angle);
        let dw = d * Math.sin(alpha - angle);
        let dx = Math.cos(angle) * this.wrapperClientRect.width / 2 - Math.sin(angle) * this.wrapperClientRect.height / 2;
        let dy = Math.sin(angle) * this.wrapperClientRect.width / 2 + Math.cos(angle) * this.wrapperClientRect.height / 2;

        Object.assign(this.wrapper.style, {
          height: dh + this.wrapperClientRect.height / 2 + 'px',
          left: this.wrapperClientRect.left + dw + dx + 'px',
          top: this.wrapperClientRect.top - dh + dy + 'px',
          transformOrigin: 'right bottom',
          width: -dw + this.wrapperClientRect.width / 2 + 'px'
        });

        // Object.assign(this.wrapper.style, {
        //   left: 'auto',
        //   top: 'auto',
        //   right: right / this._scale + 'px',
        //   bottom: bottom / this._scale + 'px'
        // });
        // wrapperNewWidth = (this.parent.width - right + this.parent.left - e.pageX) / this._scale;
        // wrapperNewHeight = this.ratio * wrapperNewWidth;
        // keepRatio = true;
        break;
      }
    }

    // if (!this.rotate) {
    //   // don't let wrapper's height become less than wrapper min height
    //   if (wrapperNewHeight !== undefined && wrapperNewHeight < this.wrapperMinHeight) {
    //     wrapperNewHeight = this.wrapperMinHeight;
    //     if (keepRatio) {
    //       wrapperNewWidth = wrapperNewHeight / this.ratio;
    //     }
    //   }
    //
    //   // don't let wrapper's width become less than wrapper min width
    //   if (wrapperNewWidth !== undefined && wrapperNewWidth < this.wrapperMinWidth) {
    //     wrapperNewWidth = this.wrapperMinWidth;
    //     if (keepRatio) {
    //       wrapperNewHeight = this.ratio * wrapperNewWidth;
    //     }
    //   }
    //
    //   // set new wrapper height and width
    //   Object.assign(this.wrapper.style, {
    //     height: (wrapperNewHeight !== undefined) ? wrapperNewHeight + 'px' : this.wrapperOldHeight + 'px',
    //     width: (wrapperNewWidth !== undefined) ? wrapperNewWidth + 'px' : this.wrapperOldWidth + 'px'
    //   });
    //
    //   // recalculate position
    //   ({left, top} = this.wrapper.getBoundingClientRect());
    //
    //   Object.assign(this.wrapper.style, {
    //     bottom: '',
    //     left: (left - this.parent.left) / this._scale + 'px',
    //     right: '',
    //     top: (top - this.parent.top) / this._scale + 'px'
    //   });
    // }
  }

  mouseUp(e) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', this.mouseMove);
    document.removeEventListener('mouseup', this.mouseUp);

    this.rotatedClientRect = this.wrapper.getBoundingClientRect();
    this.wrapperClientRect = {
      left: this.rotatedClientRect.left + (this.rotatedClientRect.width - this.wrapper.offsetWidth) / 2,
      top: this.rotatedClientRect.top + (this.rotatedClientRect.height - this.wrapper.offsetHeight) / 2,
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
    }

    let wrapperNewHeight = this.wrapper.offsetHeight;
    let wrapperNewWidth = this.wrapper.offsetWidth;

    // if nothing has changed
    if (wrapperNewHeight === this.wrapperOldHeight && wrapperNewWidth === this.wrapperOldWidth) {
      return;
    }

    // set wrapper old height and old width
    this.wrapperOldHeight = wrapperNewHeight;
    this.wrapperOldWidth = wrapperNewWidth;
  }
}
