// updates.js
// 在这里记录你网站的大板块更新。最新的写在最上面。
// 格式：{ date: "YYYY-MM-DD", text: "更新内容" }

const siteUpdates = [
   {
        date: "2026-10-29",
        text: "Added a Partial Differential Equations course page (study/pde_course.html) for the 2026 autumn term, covering heat, wave and Laplace equations and methods; the course-notes PDF (notes/pde_course_note_example.pdf) is in place and linked from the About Core Coursework tag list. Moved the AI Output section into a new page (study/ai_output.html) linked from the Materials res-list as AI Output; intro in CET4 English and a 1.7 MB SVM essay PDF. Updated dates on both pages to Oct 29, 2026.",
    },
   {
        date: "2026-10-27",
        text: "Added a Stock Photo Sites section (Pexels, Unsplash) to the Academic Sites page, both free high-quality photo resources, sourcing from Topbook-知乎. Updated the Academic Sites footer date.",
    },
   {
        date: "2026-10-23",
        text: "Added a Cartoons page (cartoons.html), a light-hearted 'Beyond Mathematics' slot on the About page, featuring the anime Yuanqi Star Soul: The Divine Dragon Rescue Team, its theme song Meteora (with a 163.com player and a local .mp3 backup), and credits for the Yaoyuetu (耀乐团) trio. A Cartoons link is added to the About page's Beyond Mathematics section. Updated dates across the site.",
    },
   {
        date: "2026-10-22",
        text: "Added a Code page (code/index.html) listing source files, rendered via code-data.js with a local UTF-8 syntax-highlighted viewer; linked from Study Materials and home page. Now page renders a five-module card (Study, Tools, Thoughts, Events, Status) driven by data/2026autumn.js. Switched data registration from unsafe window.SEMESTER_DATA[id] = data to a guarded SemesterRegistry: validated ids, frozen read-only data, no prototype pollution, clear() cleanup. Updated all pages' hyperlink hover style (deep red #8B0000 with skewX(-10deg) tilt, 0.2s ease), keeping 'Back to ...' links intact; registered in style-guide.txt.",
    },
   {
        date: "2026-10-21",
        text: "Added a site-wide Aleph (א) favicon set — ICO, SVG, and PNG at 16/32/192/512 plus the 180×180 Apple touch icon — stored in picture/ and linked from every page. Also moved the File Migration Log link out of the Materials list to the bottom of the page, widened the log page to 960px with a fixed-layout table so long paths wrap, and rebuilt the Academic Sites page as a data-driven list (study/sites.js) with five new entries grouped by category.",
    },
   {
        date: "2026-10-20",
        text: "Added a Theatre page (drama.html) listing plays and musicals I have watched, with a Theatre link in the About page's Beyond Mathematics section. Also added a Theatre Reviews page (drama_repo.html) as a placeholder for future thoughts.",
    },

   {
        date: "2026-10-18",
        text: "Refreshed the site: renamed 11 published PDFs to lowercase-with-underscores and synced every page link; reorganized code into code/c and code/cpp, archived superseded notes, fixed a misspelled talk file, and moved CV process docs out of the published tree. Added a Competitions page (2026 CUMCM Problem A, anonymized, team-approved). Launched a data-driven File Migration Log (migrations.html) mapping old→new paths that auto-updates from migrations-data.js, linked from the 404 page and site nav. Old URLs now 404 and point visitors to the log.",
    },
   {
        date: "2026-10-17",
        text: "Refactored the About page Research Interests and Awards & Honors sections into a data-driven format. Content now lives in about-data.js (single source of truth) and is rendered by a small inline script on About; the CV generator (cv-generator.js) also reads about-data.js so the page and the CV stay in sync. Editing about-data.js updates both the page and the CV.",
    },
   {
        date: "2026-10-17",
        text: "Added a Research Directions page, a published Style Guide, and picture rules with an aleph placeholder system. Rebuilt the Books page with a full catalog and a study-use notice, added a bilingual CV generator, and posted Finite Fields Chapter 1 exercise notes on the Homework page. Applied the design review: centered the index hero with a short rule line, split Core Coursework into its own About section, flattened the CV chooser cards, and added focus-visible plus reduced-motion rules across every page.",
    },
   {
        date: "2026-10-16",
        text: "Added Talks &amp; Reports with a Tuza-theorem talk summary, unified the materials pages into a compact click-to-open style, added Finite Fields notes and the Feng &amp; Liao textbook with reorganized homework, added a Statement page and a C++ data-structure code section, reorganized the site into study/ and research/, refreshed update dates, and removed obsolete, duplicate, and misplaced files.",
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
