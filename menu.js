function peekMenu() {
  const container = document.querySelector(".container"),
  dateTimeContainer = document.querySelector(".datetimecontainer");

  if (container.className !== "container contentsout") {
    dateTimeContainer.className =  "datetimecontainer menuout";
    container.className = "container menuout";
  }
}

function unpeekMenu() {
  const container = document.querySelector(".container"),
  dateTimeContainer = document.querySelector(".datetimecontainer");

  if (container.className !== "container contentsout") {
    dateTimeContainer.className =  "datetimecontainer";
    container.className = "container";
  }
}

function openContent(button, elemID) {
  const container = document.querySelector(".container"),
        dateTimeContainer = document.querySelector(".datetimecontainer"),
        info = document.querySelector(`#info`),
        infoContent = document.querySelector(`#${elemID}`);

  info.className = "info visible";
  infoContent.className = "infocontent open";
  container.className = "container contentsout";
  button.classList.add("open");
  dateTimeContainer.className = "datetimecontainer menuout";
}

function closeContent() {
  const container = document.querySelector(".container"),
  activeButton = document.querySelector(".button.open"),
  dateTimeContainer = document.querySelector(".datetimecontainer.menuout"),
  openContent = document.querySelector(".infocontent.open"),
  openInfo = document.querySelector(".info.visible");

  clearNews();
  openInfo && (openInfo.className = "info hidden");
  activeButton && activeButton.classList.remove("open");
  openContent && (openContent.className = "infocontent closed");
  container && (container.className = "container");
  dateTimeContainer.className = "datetimecontainer";
}

// Date and Clock
function changeDateTime() {
  var d = new Date(),
  hours = d.getHours(),
  minutes = d.getMinutes(),
  seconds = d.getSeconds(),
  day = d.getDate(),
  months = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
  month = months[d.getMonth()],
  year = d.getFullYear(),
  hDiv = document.querySelector(".hours"),
  mDiv = document.querySelector(".minutes"),
  sDiv = document.querySelector(".seconds"),
  dDiv = document.querySelector(".day"),
  monthDiv = document.querySelector(".month"),
  yDiv = document.querySelector(".year");

  (hours < 10) && (hours = " " + hours);
  (minutes < 10) && (minutes = "0" + minutes);
  (seconds < 10) && (seconds = "0" + seconds);

  hDiv.innerHTML = hours;
  mDiv.innerHTML = ":" + minutes;
  sDiv.innerHTML = seconds;
  dDiv.innerHTML = day;
  monthDiv.innerHTML = month;
  yDiv.innerHTML = year;
}

function displayDateTime() {
  var d = setInterval(changeDateTime, 500);
}

(() => {
  document.querySelector("#newsbutton").addEventListener("click", event => {
    closeContent();
    openContent(event.currentTarget, "newscontainer");
  });
  document.querySelector("#bookmarksbutton").addEventListener("click",
  event =>{
    closeContent();
    openContent(event.currentTarget, "bookmarksContainer");
  });
  document.querySelector(".backarrow").addEventListener("click", closeContent);
})();
