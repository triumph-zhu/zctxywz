/*
 * Future Career Bootcamp — 数据加载器
 * 优先通过 fetch 从 /data 目录加载 JSON 文件；
 * 若 fetch 失败（如 file:// 协议），回退到 data.js 中的 DATA_FALLBACK。
 */
(function () {
  var JSON_PATHS = {
    cohorts: "data/cohorts.json",
    courses: "data/courses.json",
    messages: "data/messages.json",
  };

  function deriveMeta(data) {
    // 从课程和寄语数据中自动推导分类与标签，确保与数据一致
    if (!data.categories || !data.categories.length) {
      var catSet = [];
      data.courses.forEach(function (c) {
        if (c.category && catSet.indexOf(c.category) === -1) catSet.push(c.category);
      });
      data.categories = catSet;
    }
    if (!data.tags || !data.tags.length) {
      var tagSet = [];
      data.courses.forEach(function (c) {
        (c.tags || []).forEach(function (t) {
          if (tagSet.indexOf(t) === -1) tagSet.push(t);
        });
      });
      data.tags = tagSet;
    }
    if (!data.messageTags || !data.messageTags.length) {
      var mtSet = [];
      data.messages.forEach(function (m) {
        (m.tags || []).forEach(function (t) {
          if (mtSet.indexOf(t) === -1) mtSet.push(t);
        });
      });
      data.messageTags = mtSet;
    }
    return data;
  }

  window.loadData = function () {
    // 如果已有数据（如 data.js 直接设置了 window.DATA），直接返回
    if (window.DATA) return Promise.resolve(window.DATA);

    // 尝试 fetch 加载 JSON
    var entries = Object.keys(JSON_PATHS);
    var promises = entries.map(function (key) {
      return fetch(JSON_PATHS[key])
        .then(function (r) {
          if (!r.ok) throw new Error("fetch failed: " + JSON_PATHS[key]);
          return r.json();
        })
        .then(function (json) {
          return { key: key, data: json };
        });
    });

    return Promise.all(promises)
      .then(function (results) {
        var data = {};
        results.forEach(function (r) {
          data[r.key] = r.data;
        });
        data = deriveMeta(data);
        window.DATA = data;
        return data;
      })
      .catch(function () {
        // fetch 失败，使用 data.js 中的回退数据
        var fallback = window.DATA_FALLBACK || {};
        window.DATA = deriveMeta(fallback);
        return window.DATA;
      });
  };
})();
