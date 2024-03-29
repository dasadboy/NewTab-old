function setBackground() {
  const bgImage =
  `backgrounds/${backgrounds[Math.floor(Math.random()*backgrounds.length)]}`;

  document.querySelector(".background").style.backgroundImage =
   `url(${bgImage})`;
}

(() => {
  window.addEventListener("load", displayDateTime);
  window.addEventListener("load", setBackground);

  document.querySelector("#menu").addEventListener("mouseover", peekMenu);
  document.querySelector(".background")
  .addEventListener("mouseover", unpeekMenu);
})();