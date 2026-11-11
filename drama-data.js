// drama-data.js
// ============================================================================
// 剧目数据源：drama.html 读取 dramaData 并按演出时间先后渲染列表。
//
// 本文件是【唯一数据源】，日后增删剧目只需改此处的数组，drama.html 的
// 渲染逻辑不动。
//
// 字段约定（刻意保持扁平，便于手工维护）：
//   titleZh  剧目中文名（含剧种，如"音乐剧《宝玉》"）
//   titleEn  剧目英文名（剧种可省，用括号标注）
//   date     ISO 格式日期时间（"2026-10-06T19:00"），仅用于排序，不直接展示
//   dateZh   中文展示（如"2026年10月6日晚"）
//   dateEn   英文展示（如"Evening, October 6, 2026"）
//   venueZh  演出地点中文
//   venueEn  演出地点英文
//   note     可选备注（一句话，无则留空字符串）
//
// 渲染顺序：按 `date` 升序（从早到晚）；如需倒序，改 drama.html 的
// sort 比较符即可。
// ============================================================================

const dramaData = [
  {
    titleZh: "长江的记忆——音乐舞蹈剧",
    titleEn: "Memory of the Yangtze: A Musical Dance Drama",
    date: "2025-12-10T19:00",
    dateZh: "2025年12月10日晚",
    dateEn: "Evening, December 10, 2025",
    venueZh: "江苏大学本部小礼堂",
    venueEn: "Small Auditorium, Main Campus, Jiangsu University",
    note: "An original Jiangsu University musical telling the story of Pearl S. Buck and Zhenjiang"
  },
  {
    titleZh: "戏剧《蒋公的面子》新版",
    titleEn: "The Face of Chiang Kai-shek",
    date: "2026-05-02T14:30",
    dateZh: "2026年5月2日下午",
    dateEn: "Afternoon, May 2, 2026",
    venueZh: "江苏紫金大剧院",
    venueEn: "Jiangsu Zijin Grand Theatre",
    note: "Three professors recalling their debate in a Chongqing teahouse over whether to accept Chiang Kai-shek's dinner invitation"
  },
  {
    titleZh: "山东歌舞剧院舞剧《大染坊》",
    titleEn: "Dye House",
    date: "2026-05-03T19:00",
    dateZh: "2026年5月3日晚",
    dateEn: "Evening, May 3, 2026",
    venueZh: "江苏大剧院",
    venueEn: "Jiangsu Centre for the Performing Arts",
    note: "A dance drama about Chen Shouting, a dyeing tycoon who rose from a beggar to a national entrepreneur"
  },
  {
    titleZh: "音乐剧《宝玉》",
    titleEn: "Baoyu",
    date: "2026-10-06T19:00",
    dateZh: "2026年10月6日晚",
    dateEn: "Evening, October 6, 2026",
    venueZh: "南京保利大剧院",
    venueEn: "Nanjing Grand Theatre",
    note: "Adapted from selected chapters of Jia Baoyu in Dream of the Red Chamber"
  },
  {
    titleZh: "音乐剧《粉丝来信》",
    titleEn: "Fan Letters",
    date: "2027-01-16T14:00",
    dateZh: "2027年1月16日下午",
    dateEn: "Afternoon, January 16, 2027",
    venueZh: "南京保利大剧院",
    venueEn: "Nanjing Grand Theatre",
    note: "Musicians from across the country leave home to chase their dreams, growing through hardships and finding love and friendship in an inspiring youth story with both laughs and tears; after they gain fans, letters arrive from all over the country and many stories begin. Note: one audience member greatly enjoyed this show and saw two performances on the same day; since tickets for one of them were sold out, a companion attended only the other. That audience member has watched the production several times."
  }
];

// 同时挂到 window，便于同页面直接复用；非浏览器环境忽略此行。
if (typeof window !== "undefined") window.dramaData = dramaData;
