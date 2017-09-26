'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _utils = require('./utils');

var _utils2 = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SortableGroup = function (_Component) {
  _inherits(SortableGroup, _Component);

  function SortableGroup() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, SortableGroup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = SortableGroup.__proto__ || Object.getPrototypeOf(SortableGroup)).call.apply(_ref, [this].concat(args))), _this), _this.dragInfo = {
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

      var targetRect = (0, _utils.translateRect)(pageX + delta.x, pageY + delta.y, target);
      var t = (0, _utils.center)(targetRect);
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
        newIndex = (0, _utils.closestNodeIndex)(t.x, t.y, _this.lists[closestKey].container.childNodes);

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
    }, _this.findTargetContainer = (0, _debounce2.default)(function () {
      var _this$dragInfo2 = _this.dragInfo,
          currentKey = _this$dragInfo2.currentKey,
          delta = _this$dragInfo2.delta,
          pageX = _this$dragInfo2.pageX,
          pageY = _this$dragInfo2.pageY,
          target = _this$dragInfo2.target;

      var targetRect = (0, _utils.translateRect)(pageX + delta.x, pageY + delta.y, target);
      var t = (0, _utils.center)(targetRect);

      var closestKey = _this.closestContainer(t.x, t.y);
      var closest = _this.lists[closestKey];

      // closest list is not the current list
      if (currentKey !== closestKey) {
        // overlap closest
        var list = closest.container.getBoundingClientRect();

        if ((0, _utils.overlap)(targetRect, list)) {
          t = (0, _utils.center)(targetRect);
          var newIndex = (0, _utils.closestNodeIndex)(t.x, t.y, closest.container.childNodes);

          // stop dragging from the prev list (calls onSortEnd)
          _this.lists[currentKey].handleSortEnd();

          // start dragging from the closest list
          _this.startDragging(closest, newIndex, delta, pageX, pageY);

          _this.dragInfo.currentKey = closestKey;
        }
      }
    }, 50, { maxWait: 200 }), _this.startDragging = function (list, index, delta, pageX, pageY) {
      var newIndex = (0, _utils2.clamp)(index, 0, list.container.childNodes.length - 1);
      var target = list.container.childNodes[newIndex];
      var rect = target.getBoundingClientRect();
      var handle = (0, _utils2.closestChild)(target, function (el) {
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

      var keys = Object.keys(this.lists);
      var distances = keys.map(function (key) {
        var list = _this2.lists[key];
        return list ? (0, _utils.distanceRect)(x, y, list.container.getBoundingClientRect()) : Infinity;
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
}(_react.Component);

SortableGroup.propTypes = {
  children: _react.PropTypes.func,
  items: _react.PropTypes.array,
  onMove: _react.PropTypes.func
};
exports.default = SortableGroup;