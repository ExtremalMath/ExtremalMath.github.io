// updates.js
// 在这里记录你网站的大板块更新。最新的写在最上面。
// 格式：{ date: "YYYY-MM-DD", text: "更新内容" }

const siteUpdates = [
   {
        date: "2026-10-17",
        text: "Refactored the About page Research Interests and Awards & Honors sections into a data-driven format. Content now lives in about-data.js (single source of truth) and is rendered by a small inline script on About; the CV generator (cv-generator.js) also reads about-data.js so the page and the CV stay in sync. Editing about-data.js updates both the page and the CV."
    },
   {
        date: "2026-10-17",
        text: "Added a Research Directions page, a published Style Guide, and picture rules with an aleph placeholder system. Rebuilt the Books page with a full catalog and a study-use notice, added a bilingual CV generator, and posted Finite Fields Chapter 1 exercise notes on the Homework page. Applied the design review: centered the index hero with a short rule line, split Core Coursework into its own About section, flattened the CV chooser cards, and added focus-visible plus reduced-motion rules across every page."
    },
   {
        date: "2026-10-16",
        text: "Added Talks &amp; Reports with a Tuza-theorem talk summary, unified the materials pages into a compact click-to-open style, added Finite Fields notes and the Feng &amp; Liao textbook with reorganized homework, added a Statement page and a C++ data-structure code section, reorganized the site into study/ and research/, refreshed update dates, and removed obsolete, duplicate, and misplaced files."
    },
   { 
        date: "2026-09-25", 
        text: "Added a 'Now' page with a semester-based archive and on-demand loading of current and past semesters, redesigned the About page with a warm color theme, a sticky sidebar, and a green Aleph avatar, and polished the personal bio while adding department experience and volunteer work." 
    },
   { 
    date: "2026-09-23", 
    text: "Summary of recent updates: added myteachers page, refreshed research logs, and uploaded math modeling resources" 
    },
    { 
        date: "2026-09-20", 
        text: "Revamped the research log format and updated several entries" 
    },
    { 
        date: "2026-09-19", 
        text: "Uploaded files related to Mathematical Modeling" 
    },
    { 
        date: "2026-09-15", 
        text: "Updated About page with new research interests" 
    },
    { 
        date: "2026-09-01", 
        text: "Initial website launch" 
    }
];
