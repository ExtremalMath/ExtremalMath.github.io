PICTURES
Every picture of the site lives in this folder. The full rules are in
style-guide.txt, section PICTURES.

STRUCTURE

  picture/           pictures used by pages
  picture/private/   personal pictures (the avatar, photos of me)

NAMING

- English, lower case, _ between words: profile.png, tour_map.png
- .png or .jpg preferred; .jpeg and .webp also load
- A file name, once published, stays the same: a rename breaks links

THE ALEPH PLACEHOLDER

A slot whose picture is not placed yet shows the letter aleph in a round
frame. In code:

  <div class="aleph" data-pic="private/profile" role="img" aria-label="Profile picture">ℵ</div>

- data-pic is the path under picture/ without the extension
- aria-label becomes the alt text of the real picture
- picture.js swaps the mark for the picture when a file answers at
  picture/<data-pic>.png (then .jpg, .jpeg, .webp). No page edit needed.
- Manual way: write <img src="picture/private/profile.png" alt="...">
  straight into the page and drop the placeholder.

NOTE

Files under picture/private/ are public once pushed. Put there only what
you agree to share.

© 2026 ExtremalMath
Last updated Oct 17, 2026
