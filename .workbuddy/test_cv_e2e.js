const fs = require('fs');
const path = require('path');
const { JSDOM } = require('C:/Users/video/.workbuddy/binaries/node/workspace/node_modules/jsdom');

const ROOT = 'D:/Workbuddyworkspace/mywebsite';
const aboutHtml = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
const talksHtml = fs.readFileSync(path.join(ROOT, 'talks/talks.html'), 'utf8');
const aboutDataSrc = fs.readFileSync(path.join(ROOT, 'about-data.js'), 'utf8');
const genSrc = fs.readFileSync(path.join(ROOT, 'cv-pdf-generator/cv-generator.js'), 'utf8');

function run(about, talks, aboutData, lang) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="cv-status"></div><div id="cv-root"></div></body></html>`, {
    url: 'https://extremalmath.github.io/cv-pdf-generator/cv-en.html',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  window.fetch = (url) => {
    const u = String(url);
    let body;
    if (u.indexOf('talks') >= 0) body = talks;
    else if (u.indexOf('about-data') >= 0) body = aboutData;
    else body = about;
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(body) });
  };
  window.alert = (m) => { window.__alert = m; };
  window.print = () => { window.__printed = true; };
  window.eval(genSrc);
  return window;
}

let fails = 0;
function assert(cond, msg) {
  if (cond) { console.log('  PASS: ' + msg); }
  else { fails++; console.log('  FAIL: ' + msg); }
}

async function main() {
  for (const lang of ['en', 'zh']) {
    console.log('=== lang=' + lang + ' ===');
    const w = run(aboutHtml, talksHtml, aboutDataSrc, lang);
    await w.CVGenerator.generateCV({ fetchPages: ['../about.html', '../talks/talks.html'], showPreview: true, lang: lang });
    const rootHtml = w.document.getElementById('cv-root').innerHTML;
    assert(rootHtml.indexOf('cv-sheet') >= 0, '生成简历 sheet 存在');
    if (lang === 'zh') {
      assert(rootHtml.indexOf('李元博') >= 0, '中文姓名已抽取为「李元博」');
      assert(rootHtml.indexOf('Yuanbo') < 0, '中文简历不再泄漏英文名 Yuanbo');
      assert(rootHtml.indexOf('免H图问题') >= 0, 'H-free graph problems → 免H图问题');
      assert(rootHtml.indexOf('紫金草志愿者团队') >= 0, 'Purple Grass → 紫金草志愿者团队');
      assert(rootHtml.indexOf('大眼睛公益团队') >= 0, '中文名「大眼睛公益团队」');
      assert(rootHtml.indexOf('H-自由图') < 0 && rootHtml.indexOf('紫草') < 0, '旧译名已替换');
    } else {
      assert(rootHtml.indexOf('Yuanbo Li') >= 0, '英文姓名已抽取');
      assert(rootHtml.indexOf('Bright Eyes') >= 0, '英文名 Bright Eyes Volunteer Team');
      assert(rootHtml.indexOf('Big Eyes') < 0, '旧英文名 Big Eyes 已替换');
    }
    assert(/course talk|homework|coursework|课程作业/i.test(rootHtml) === false, '无课程作业/作业内容泄漏');
    assert(rootHtml.indexOf('private/profile') < 0, '不含 private 头像引用');
    assert(rootHtml.indexOf('↗') < 0, '简历不含不可点开的外链提示 ↗');
    assert(rootHtml.indexOf('feature article') < 0 && rootHtml.indexOf('专题报道') < 0, '无外链提示文字残留');
    assert(rootHtml.indexOf('http://') < 0 && rootHtml.indexOf('https://') < 0 && rootHtml.indexOf('www.') < 0, '正文无 URL 形式链接');
    assert(w.__alert === undefined, '无 alert 报错');
    w.close();
  }
  console.log(fails === 0 ? '\nALL PASS' : '\n' + fails + ' FAILURES');
  process.exit(fails === 0 ? 0 : 1);
}
main();
