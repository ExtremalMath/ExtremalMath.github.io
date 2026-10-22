/* ============================================================
   data/registry.js
   ------------------------------------------------------------
   Semester data registry.

   Share "window.SEMESTER_DATA[id] = data" style registration
   back to a guarded, in-registry-only store:

     SemesterRegistry.register(id, data)   -> 写
     SemesterRegistry.get(id)              -> 读
     SemesterRegistry.clear()              -> 清空
     SemesterRegistry.isRegistered(id)     -> 是否存在

   - 每一次只写一次（不允许重复 id 覆盖）
   - id 必须通过格式 + 黑名单校验（屏蔽 __proto__ / constructor / prototype）
   - 所有数据只读冻结（Object.freeze）
   - 使用 Object.create(null) 作为内核，不会污染原型链
   - 通过以后，所有消费方使用 SemesterRegistry.get(id) 读取（而非直接读取 window）
   ============================================================ */
(function () {
  "use strict";

  var STORE = null;          // Object.create(null) at first access

  // 禁止作为 id 的串（原型 / 构造器 / 属性破坏）
  var PROTO_KEYS = /^(?:__proto__|proto|constructor|prototype)$/;
  // 允许的格式：安全的标识符（字母、数字、下划线、连字符、点、斜杠）
  var VALID_ID = /^[a-zA-Z0-9_\-./]+$/;

  function store() {
    if (!STORE) {
      STORE = Object.create(null);
    }
    return STORE;
  }

  function hasRawKey(id) {
    var s = store();
    return Object.prototype.hasOwnProperty.call(s, id);
  }

  function isValidId(id) {
    return (
      typeof id === "string" &&
      id.length > 0 &&
      id === id.trim() &&              // 不允许前后空格
      !PROTO_KEYS.test(id) &&
      VALID_ID.test(id)
    );
  }

  function register(id, data) {
    if (!isValidId(id)) {
      throw new TypeError(
        "SemesterRegistry.register: " + JSON.stringify(String(id)) +
        " is not a valid semester id"
      );
    }
    if (hasRawKey(id)) {
      throw new Error(
        "SemesterRegistry.register: '" + id + "' is already registered"
      );
    }
    if (data === null || typeof data !== "object") {
      throw new TypeError("SemesterRegistry.register: data must be an object");
    }

    // 只读冻结的浅拷贝（不修改原始传入的数据字面量）
    var copy = Object.create(null);
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = Object.freeze(data[key]);
      }
    }
    STORE[id] = copy;
    return copy;
  }

  function get(id) {
    // 不受信任的 id：不返回任何数据
    if (!isValidId(id)) {
      return null;
    }
    var s = store();
    if (hasRawKey(id)) {
      return Object.freeze(s[id]);
    }
    // 向后兼容：旧的数据文件如果仍然 "window.SEMESTER_DATA[id] = ..." 仍可读
    var legacy = (window.SEMESTER_DATA &&
                  Object.prototype.hasOwnProperty.call(window.SEMESTER_DATA, id))
      ? window.SEMESTER_DATA[id] : null;
    return legacy;
  }

  function isRegistered(id) {
    if (!isValidId(id)) {
      return false;
    }
    return hasRawKey(id);
  }

  function ids() {
    return Object.keys(store());
  }

  function clear() {
    STORE = Object.create(null);
  }

  // 只暴露只读接口
  if (typeof window !== "undefined") {
    window.SemesterRegistry = {
      register: register,
      get: get,
      isRegistered: isRegistered,
      ids: ids,
      clear: clear
    };
  }
})();
