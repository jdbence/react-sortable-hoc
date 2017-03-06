import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import { debounce, each } from 'lodash';
import { closestChild } from '../utils';

var SortableGroup = function () {
    function SortableGroup(onMove, getRefs) {
        var _this = this;

        _classCallCheck(this, SortableGroup);

        this.onSortStart = function (item, e, listName) {
            var target = item.node.getBoundingClientRect();
            _this.dragInfo.target = target;
            _this.dragInfo.current = listName;
            _this.dragInfo.delta = {
                x: target.left - e.clientX,
                y: target.top - e.clientY
            };
        };

        this.onSortMove = function (e) {
            _this.dragInfo.pageX = e.pageX;
            _this.dragInfo.pageY = e.pageY;
            _this.dragInfo.target = e.target.getBoundingClientRect();

            // limit the amount of times checkList() can be called
            _this.debounceCheckList();
        };

        this.onSortEnd = function (_ref) {
            var oldIndex = _ref.oldIndex,
                newIndex = _ref.newIndex;

            var lists = _this.getRefs();
            var _dragInfo = _this.dragInfo,
                target = _dragInfo.target,
                current = _dragInfo.current;

            var t = _this.center(target);
            var closest = _this.closestList(t.x, t.y, lists);

            // Moved within current list
            if (current == closest && oldIndex != newIndex) {
                _this.onMove(oldIndex, current, newIndex, closest);

                _this.dragInfo.current = closest;
            }
            // Moved different list
            else if (current != closest) {

                    // Find the closest index in new list
                    newIndex = _this.closestNodeIndex(t.x, t.y, lists[closest].container.childNodes);

                    _this.onMove(oldIndex, current, newIndex, closest);
                    _this.dragInfo.current = closest;
                }

            // Stop the debounce if it hasn't fired yet
            _this.debounceCheckList.cancel();
        };

        this.checkList = function () {
            var lists = _this.getRefs();
            var _dragInfo2 = _this.dragInfo,
                target = _dragInfo2.target,
                current = _dragInfo2.current,
                delta = _dragInfo2.delta,
                pageX = _dragInfo2.pageX,
                pageY = _dragInfo2.pageY;

            var t = _this.center(target);
            var closest = _this.closestList(t.x, t.y, lists);

            // closest list is not the current list
            if (current != closest) {

                // overlap closest
                var list = lists[closest].container.getBoundingClientRect();
                if (_this.overlap(target, list)) {
                    t = _this.center(target);
                    var newIndex = _this.closestNodeIndex(t.x, t.y, lists[closest].container.childNodes);

                    // stop dragging from the prev list (calls onSortEnd)
                    lists[current].handleSortEnd({});

                    // start dragging from the closest list
                    _this.startDragging(closest, newIndex, delta, pageX, pageY);

                    _this.dragInfo.current = closest;
                }
            }
        };

        this.startDragging = function (listName, index, delta, pageX, pageY) {
            var lists = _this.getRefs();
            var list = lists[listName];
            var newIndex = _this.clamp(index, 0, list.container.childNodes.length - 1);
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
            list.helper.dispatchEvent(_this.mouseMove(pageX, pageY));
        };

        this.debounceCheckList = debounce(this.checkList, 250, { 'maxWait': 500 });
        this.dragInfo = {
            pageX: 0,
            pageY: 0,
            delta: { x: 0, y: 0 },
            current: null,
            target: null
        };
        this.onMove = onMove;
        this.getRefs = getRefs;
    }

    _createClass(SortableGroup, [{
        key: 'mouseMove',
        value: function mouseMove(x, y) {
            return new MouseEvent('mousemove', {
                clientX: x,
                clientY: y,
                bubbles: true,
                cancelable: true,
                view: window
            });
        }
    }, {
        key: 'closestList',
        value: function closestList(x, y, lists) {
            var _this2 = this;

            var d = 0;
            var sd = 999999999;
            var listName = void 0;

            each(lists, function (c, key) {
                d = _this2.distanceRect(x, y, c.container.getBoundingClientRect());
                if (d < sd) {
                    sd = d;
                    listName = key;
                }
            });
            return listName;
        }
    }, {
        key: 'closestNodeIndex',
        value: function closestNodeIndex(x, y, nodes) {
            if (nodes.length > 0) {
                var si = void 0,
                    sd = void 0,
                    d = void 0,
                    r = void 0,
                    i = void 0;

                // above last item in list
                r = nodes[nodes.length - 1].getBoundingClientRect();
                sd = r.bottom;

                if (y < sd) {
                    sd = 999999999;
                    // closest node
                    for (i = 0; i < nodes.length; i++) {
                        r = this.center(nodes[i].getBoundingClientRect());
                        d = this.distance(x, y, r.x, r.y);
                        if (d < sd) {
                            sd = d;
                            si = i;
                        }
                    }
                    return si;
                }
            }
            // default last node
            return nodes.length;
        }
    }, {
        key: 'center',
        value: function center(rect) {
            return {
                x: rect.left + (rect.right - rect.left) * 0.5,
                y: rect.top + (rect.bottom - rect.top) * 0.5
            };
        }
    }, {
        key: 'clamp',
        value: function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
    }, {
        key: 'distanceRect',
        value: function distanceRect(x, y, rect) {
            var dx = x - this.clamp(x, rect.left, rect.right);
            var dy = y - this.clamp(y, rect.top, rect.bottom);
            return Math.sqrt(dx * dx + dy * dy);
        }
    }, {
        key: 'distance',
        value: function distance(x1, y1, x2, y2) {
            return Math.sqrt((x2 -= x1) * x2 + (y2 -= y1) * y2);
        }
    }, {
        key: 'overlap',
        value: function overlap(a, b) {
            return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom;
        }
    }]);

    return SortableGroup;
}();

export default SortableGroup;