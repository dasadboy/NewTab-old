var backgrounds = ['1.jpg', 'animal-branch-cat-35888.jpg', 'italian-landscape-mountains-nature.jpg', 'pexels-photo-1054289.jpeg', 'pexels-photo-1324803.jpeg', 'pexels-photo-917494.jpeg']

function setBackground() {
  const bgImage =
  `backgrounds/${backgrounds[Math.floor(Math.random()*backgrounds.length)]}`;

  document.querySelector(".background").style.backgroundImage =
   `url(${bgImage})`;
}
