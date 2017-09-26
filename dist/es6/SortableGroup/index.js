import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _Object$keys from 'babel-runtime/core-js/object/keys';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import { Component, PropTypes } from 'react';
import debounce from 'lodash/debounce';
import { closestNodeIndex, center, distanceRect, overlap, translateRect } from './utils';
import { closestChild, clamp } from '../utils';

var SortableGroup = function (_Component) {
  _inherits(SortableGroup, _Component);

  function SortableGroup() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, SortableGroup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SortableGroup.__proto__ || _Object$getPrototypeOf(SortableGroup)).call.apply(_ref, [this].concat(args))), _this), _this.dragInfo = {
      pageX: 0,
      pageY: 0,
      delta: {
        x: 0,
        y: 0
      },
      currentKey: null,
      target: null,
      rect: null
    }, _this.lists = {}, _this.onSortStart = function (key) {
      return function (item, e) {
        var target = item.node.getBoundingClientRect();
        var event = e.touches ? e.touches[0] : e;

        _this.dragInfo.pageX = event.pageX;
        _this.dragInfo.pageY = event.pageY;
        _this.dragInfo.target = target;
        _this.dragInfo.currentKey = key;
        _this.dragInfo.delta = {
          x: target.left - event.clientX,
          y: target.top - event.clientY
        };
      };
    }, _this.onSortMove = function (e) {
      var event = e.touches ? e.touches[0] : e;

      _this.dragInfo.pageX = event.pageX;
      _this.dragInfo.pageY = event.pageY;

      _this.findTargetContainer();
    }, _this.onSortEnd = function (_ref2, e) {
      var oldIndex = _ref2.oldIndex,
          newIndex = _ref2.newIndex;
      var _this$dragInfo = _this.dragInfo,
          currentKey = _this$dragInfo.currentKey,
          delta = _this$dragInfo.delta,
          pageX = _this$dragInfo.pageX,
          pageY = _this$dragInfo.pageY,
          target = _this$dragInfo.target;

      var targetRect = translateRect(pageX + delta.x, pageY + delta.y, target);
      var t = center(targetRect);
      var closestKey = _this.closestContainer(t.x, t.y);
      var isDoneDragging = e && e.type === 'mouseup';

      // Moved within current list
      if (currentKey === closestKey) {
        _this.props.onMove({
          oldIndex: oldIndex,
          oldKey: currentKey,
          newIndex: newIndex,
          newKey: closestKey,
          isDoneDragging: isDoneDragging
        });

        _this.dragInfo.currentKey = closestKey;
      } else if (currentKey !== closestKey) {
        // Moved different list
        // Find the closest index in new list
        newIndex = closestNodeIndex(t.x, t.y, _this.lists[closestKey].container.childNodes);

        _this.props.onMove({
          oldIndex: oldIndex,
          oldKey: currentKey,
          newIndex: newIndex,
          newKey: closestKey,
          isDoneDragging: isDoneDragging
        });
        _this.dragInfo.currentKey = closestKey;
      }

      // Stop the debounce if it hasn't fired yet
      _this.findTargetContainer.cancel();
    }, _this.findTargetContainer = debounce(function () {
      var _this$dragInfo2 = _this.dragInfo,
          currentKey = _this$dragInfo2.currentKey,
          delta = _this$dragInfo2.delta,
          pageX = _this$dragInfo2.pageX,
          pageY = _this$dragInfo2.pageY,
          target = _this$dragInfo2.target;

      var targetRect = translateRect(pageX + delta.x, pageY + delta.y, target);
      var t = center(targetRect);

      var closestKey = _this.closestContainer(t.x, t.y);
      var closest = _this.lists[closestKey];

      // closest list is not the current list
      if (currentKey !== closestKey) {
        // overlap closest
        var list = closest.container.getBoundingClientRect();

        if (overlap(targetRect, list)) {
          t = center(targetRect);
          var newIndex = closestNodeIndex(t.x, t.y, closest.container.childNodes);

          // stop dragging from the prev list (calls onSortEnd)
          _this.lists[currentKey].handleSortEnd();

          // start dragging from the closest list
          _this.startDragging(closest, newIndex, delta, pageX, pageY);

          _this.dragInfo.currentKey = closestKey;
        }
      }
    }, 50, { maxWait: 200 }), _this.startDragging = function (list, index, delta, pageX, pageY) {
      var newIndex = clamp(index, 0, list.container.childNodes.length - 1);
      var target = list.container.childNodes[newIndex];
      var rect = target.getBoundingClientRect();
      var handle = closestChild(target, function (el) {
        return el.sortableHandle;
      });

      // start dragging item
      list.handleStart({
        target: handle || target,
        clientX: rect.left - delta.x,
        clientY: rect.top - delta.y,
        preventDefault: function preventDefault() {}
      });

      // force update item position
      list.handleSortMove({
        target: list.helper,
        clientX: pageX,
        clientY: pageY,
        pageX: pageX,
        pageY: pageY,
        preventDefault: function preventDefault() {}
      });
    }, _this.connectGroupTarget = function (key) {
      var items = _this.props.items;


      return {
        ref: function ref(instance) {
          return _this.registerRef(key, instance);
        },
        onSortStart: _this.onSortStart(key),
        onSortMove: _this.onSortMove,
        onSortEnd: _this.onSortEnd,
        items: items[key]
      };
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(SortableGroup, [{
    key: 'registerRef',
    value: function registerRef(key, instance) {
      this.lists[key] = instance;
    }
  }, {
    key: 'closestContainer',
    value: function closestContainer(x, y) {
      var _this2 = this;

      var keys = _Object$keys(this.lists);
      var distances = keys.map(function (key) {
        var list = _this2.lists[key];
        return list ? distanceRect(x, y, list.container.getBoundingClientRect()) : Infinity;
      });

      return keys[distances.indexOf(Math.min.apply(Math, _toConsumableArray(distances)))];
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;


      return children(this.connectGroupTarget);
    }
  }]);

  return SortableGroup;
}(Component);

SortableGroup.propTypes = {
  children: PropTypes.func,
  items: PropTypes.array,
  onMove: PropTypes.func
};
export default SortableGroup;