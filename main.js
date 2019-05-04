(() => {
  window.addEventListener("load", displayDateTime);
  window.addEventListener("load", setBackground);

  document.querySelector("#menu").addEventListener("mouseover", peekMenu);
  document.querySelector(".background")
  .addEventListener("mouseover", unpeekMenu);
})();