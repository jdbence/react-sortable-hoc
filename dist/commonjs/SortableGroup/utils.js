'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.moveGroupItems = moveGroupItems;
exports.closestNodeIndex = closestNodeIndex;
exports.center = center;
exports.distance = distance;
exports.distanceRect = distanceRect;
exports.overlap = overlap;
exports.translateRect = translateRect;

var _utils = require('../utils');

// TODO: Implement using slice instead of splice to avoid side-effects
function moveGroupItems(items, _ref) {
  var oldIndex = _ref.oldIndex,
      oldKey = _ref.oldKey,
      newIndex = _ref.newIndex,
      newKey = _ref.newKey;

  var oldItems = items[oldKey];
  var newItems = items[newKey];
  var switchItem = oldItems[oldIndex];

  // item found
  if (switchItem) {
    // remove from old list
    oldItems.splice(oldIndex, 1);

    // add to new list
    newItems.splice(newIndex, 0, switchItem);
  }

  return items;
}

function closestNodeIndex(x, y, nodes) {
  if (nodes.length > 0) {
    var closestIndex = void 0,
        closestDistance = void 0,
        d = void 0,
        rect = void 0,
        i = void 0;

    // above last item in list
    rect = nodes[nodes.length - 1].getBoundingClientRect();
    closestDistance = rect.bottom;

    if (y < closestDistance) {
      closestDistance = 999999999;
      // closest node
      for (i = 0; i < nodes.length; i++) {
        rect = center(nodes[i].getBoundingClientRect());
        d = distance(x, y, rect.x, rect.y);
        if (d < closestDistance) {
          closestDistance = d;
          closestIndex = i;
        }
      }
      return closestIndex;
    }
  }
  // default last node
  return nodes.length;
}

function center(rect) {
  return {
    x: rect.left + (rect.right - rect.left) * 0.5,
    y: rect.top + (rect.bottom - rect.top) * 0.5
  };
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
}

function distanceRect(x, y, rect) {
  var dx = x - (0, _utils.clamp)(x, rect.left, rect.right);
  var dy = y - (0, _utils.clamp)(y, rect.top, rect.bottom);

  return Math.sqrt(dx * dx + dy * dy);
}

function overlap(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
}

function translateRect(translateX, translateY, rect) {
  var width = rect.width,
      height = rect.height;


  return {
    left: translateX,
    top: translateY,
    right: width + translateX,
    bottom: height + translateY,
    width: width,
    height: height
  };
}