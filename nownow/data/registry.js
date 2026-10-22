/* ============================================================
   data/registry.js
   ------------------------------------------------------------
   Semester data registry (safer replacement for "window.SEMESTER_DATA[id]")

   Shared by data/*.js 的 "注册" 和 nownow/now.html 的 "消费":

     SemesterRegistry.register(id, data)   -> 写（安全校验 + 只读冻结）
     SemesterRegistry.get(id)              -> 读（空 null-prototype 内核）
     SemesterRegistry.isRegistered(id)     -> 是否已注册
     SemesterRegistry.ids()                -> 已注册的 id 列表
     SemesterRegistry.clear()              -> 归档/注销（页面更新时手动清理）

   约束：
   - id 必须格式正确 + 不在 Object.prototye 黑名单中（结束 __proto__ / constructor
     / prototype / hasOwnProperty 等足以破坏存储链的键）
   - 计算层使用 Object.create(null)（没有 Object.prototype 链），__proto__ 赋值
     自动变成普通数据属性，不会污染原型链
   - data 只写一次（禁止重复 id 覆盖），写入后做只读冻结（不会改原来的字面量）
   - 返回只读数据，消费方（now.html）仍需对每个字段做 escapeHTML
   ============================================================ */
(function () {
  "use strict";

  var STORE = null;          // Object.create(null) in the first assignment

  // 禁止作为 id 的串：任何 Object.prototype 的成员 / 特殊串
  var DISALLOWED_KEYS = {
    "__proto__": 1, "proto": 1, "constructor": 1, "prototype": 1,
    "hasOwnProperty": 1, "isPrototypeOf": 1, "propertyIsEnumerable": 1,
    "toLocaleString": 1, "toString": 1, "valueOf": 1,
    "toDateString": 1, "toUTCString": 1, "toLocaleDateString": 1,
    "defineGetter": 1, "lookupGetter": 1, "defineSetter": 1, "lookupSetter": 1,
    "null": 1, "undefined": 1, "true": 1, "false": 1
  };
  // id 的安全格式：字母、数字、下划线、连字符（不接 / . 空格，防路径穿越）
  var VALID_ID = /^[a-zA-Z0-9_\-]+$/;

  /* ---------- 内部 ---------- */

  function store() {
    if (!STORE) {
      STORE = Object.create(null);
    }
    return STORE;
  }

  function hasRawKey(id) {
    return Object.prototype.hasOwnProperty.call(store(), id);
  }

  function isValidId(id) {
    return (
      typeof id === "string" &&
      id.length > 0 &&
      id === id.trim() &&              // 不接受前后空格
      !DISALLOWED_KEYS[id] &&
      VALID_ID.test(id)
    );
  }

  /*
   * 只读冻结的拷贝（不修改原始传入的数据字面量）
   *  freeze 的是"注册副本"：禁止消费方或注册代码再修改它。
   * 嵌套的对象 / 数组本身保持原始，但通过 registry 读到的对象
   * 是最外层不可变的（不可增、删、改）。
   */
  function safeCopy(data) {
    var copy = {};
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        copy[key] = data[key];
      }
    }
    return Object.freeze(copy);
  }

  /* ---------- 公共接口 ---------- */

  // 注册：只写一次，成功覆盖旧的不存在
  function register(id, data) {
    if (!isValidId(id)) {
      throw new TypeError(
        "SemesterRegistry.register: '" + String(id) + "' " +
        "is not a valid semester id"
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
    STORE[id] = safeCopy(data);
    return STORE[id];
  }

  // 读取：不受信任的 id 一律返回 null
  function get(id) {
    if (!isValidId(id)) {
      return null;
    }
    if (hasRawKey(id)) {
      return Object.freeze(STORE[id]);
    }
    // 向后兼容：旧文件如果仍写 "window.SEMESTER_DATA[id] = data"，可以读到
    var legacy = null;
    if (window && window.SEMESTER_DATA &&
        Object.prototype.hasOwnProperty.call(window.SEMESTER_DATA, id)) {
      legacy = window.SEMESTER_DATA[id];
    }
    return legacy;
  }

  function isRegistered(id) {
    if (!isValidId(id)) {
      return false;
    }
    return hasRawKey(id);
  }

  // 已注册 id 列表
  function ids() {
    return Object.keys(store());
  }

  // 注销/清空（未来页面迁移或测试时可重置）
  function clear() {
    STORE = Object.create(null);
  }

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
