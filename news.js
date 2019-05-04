let allCategories = {},
    activeArticles = {},
    inactiveCategories = 0,
    feeds, currentFeed, proxy;

const getFeeds = () => {
  chrome.storage.local.get(["newsfeeds", "proxy"], result => {
    feeds = result.newsfeeds;
    currentFeed = feeds[0];
    proxy = result.proxy;
    buildFeedsList();
  });
}

function loadRSS(feedURL, proxy = "") {
  fetch(proxy + feedURL).then((res) => {
    res.text().then((xmlTxt) => {
      var domParser = new DOMParser();
      let doc = domParser.parseFromString(xmlTxt, 'text/xml');

      return buildNewsItems(doc);
    });
  }).catch((e) => console.error('Error fetching website.\n' + e));
}

const buildNewsItems = doc => {
  var newsDiv = document.querySelector("#news");

  allCategories = {};
  activeArticles = {};
  inactiveCategories = 0;

  doc.querySelectorAll("item").forEach((item, index) => {
    let newsArticle = document.createElement('div'),
        articleTitleElem = document.createElement("a"),
        articleTitle = item.querySelector("title"),
        descriptionElem = document.createElement("p"),
        description = item.querySelector("description"),
        pubdateElem = document.createElement("p"),
        pubdate = item.querySelector("pubDate"),
        more = document.createElement("a"),
        link = item.querySelector("link"),
        thumbnailSrc = item.querySelector("thumbnail") &&
        (item.querySelector("thumbnail").url
        || item.querySelector("thumbnail").textContent),
        thumbnail = thumbnailSrc && document.createElement("img"),
        articleCategories = getCategories(item);

    // Individual News Article
    newsArticle.className = "article";

    // Article Title
    if (articleTitle !== null) {
      articleTitleElem.className = "articleTitle";
      articleTitleElem.textContent = item.querySelector("title").textContent;
      articleTitleElem.target = "_blank";
      newsArticle.appendChild(articleTitleElem); // Append to element
    }

    // Publication Date
    if (pubdate !== null) {
      pubdateElem.className = "pubdate";
      pubdateElem.textContent = pubdate.textContent;
      newsArticle.appendChild(pubdateElem); // Append to article
                                                       // element.
    }

    // Description
    if (description !== null) {
      descriptionElem.className = "description";
      descriptionElem.innerHTML = description.textContent;
      thumbnail && (thumbnail.src = thumbnailSrc);
      formatDescription(descriptionElem, thumbnail);
      newsArticle.appendChild(descriptionElem); // Append to article Element
    }

    if (link !== null) {
      more.textContent = "MORE >";
      more.href = link.textContent;
      more.className = "more"
      newsArticle.appendChild(more);
      articleTitleElem.href = link.textContent;
    }

    if (articleCategories) {
      articleCategories.forEach(cat => {
        if (!allCategories[cat]) {
          allCategories[cat] = [];
        }
        if (!activeArticles[index]) {
          activeArticles[index] = 0;
        }
        allCategories[cat].push(index);
        activeArticles[index]++;
      });
    }
    newsDiv.appendChild(newsArticle);
  });

  if (Object.entries(allCategories).length > 0) {
    const all = document.createElement("div"),
          container = document.querySelector("#categories")
          button = document.querySelector("#categoriesbtn");

    all.className = "item";
    all.innerHTML = "All";
    all.addEventListener("click", (event) => toggleAll(event.target));
    all.style.backgroundColor = "rgb(0, 164, 0, 0.9)"
    container.appendChild(all);
    button.className = "newsbtn";

    Object.entries(allCategories).forEach(([cat, articles]) => {
      const category = document.createElement("div");
      category.className = "item";
      category.setAttribute("data-category", cat);
      category.innerHTML = cat;
      category.style.backgroundColor = "rgb(0, 164, 0, 0.9)"
      category.addEventListener("click",
      event => toggleCategory(event.target));
      container.appendChild(category);
    });
  } else {
    document.querySelector("#categoriesbtn").className = "newsbtn disabled";
  }
}

function clearNews() {
  document.querySelector("#news").innerHTML = "";
  document.querySelector("#categories").innerHTML = "";
}

function formatDescription(description, image) {
  const img = image || description.querySelector("img");

  description.querySelectorAll("img").forEach((item) => {
    description.removeChild(item);
  });

  description.textContent = description.textContent.replace(
    /(<br>|<br\/>|<br \/>)+/ig,
    "<br>"
  );

  (img !== null) && description.prepend(img);
}

function getCategories(article) {
  var categories = [];
  // An article may pertain to multiple categories
  article.querySelectorAll("category").forEach((cat1) => {
    const splitter = /\s*[;\/\\\|\n\[\]\{\}\(\)]+\s*/;
    // Some category lists are multiple <category> tags whereas others are a
    // single tag and the categories are split by some character
    // ("/", ",", etc.)
    cat1.textContent.split(splitter).filter(x => /\S+/.test(x))
    .forEach(cat2 => {
      !categories.includes(cat2) && categories.push(cat2);
    });
  });

  return (categories.length > 0) && categories;
}

function hideCategory(box) {
  const articleList = allCategories[box.getAttribute("data-category")];
  articleList.forEach(index => {
    activeArticles[index]--;
    (activeArticles[index] === 0) &&
    (document.querySelector("#news").childNodes[index].style.display = "none");
  });

  inactiveCategories++;
  box.style.backgroundColor = "";
  box.parentNode.querySelector("div").style.backgroundColor = "";
}

function showCategory(box) {
  const articleList = allCategories[box.getAttribute("data-category")];

  articleList.forEach(index => {
    activeArticles[index]++;
    document.querySelector("#news").childNodes[index].style.display = "";
  });

  inactiveCategories--;
  box.style.backgroundColor = "rgb(0, 164, 0, 0.9)";
  if (inactiveCategories === 0) {
    document.querySelector("#categories div").style.backgroundColor =
    "rgba(0, 164, 0, 0.9)";
  }
}

function dropOnClickOutside(button, element, func) {
  const outsideClickListener = event => {
    if (event.target.parentNode !== element &&
    !button.contains(event.target) && isVisible(element)) {
      func(element);
      button.className = "newsbtn";
      removeClickListener();
    }
  }

  const removeClickListener = () => {
    document.removeEventListener("click", outsideClickListener);
  }

  document.addEventListener("click", outsideClickListener);
}

const isVisible = elem => !!elem && !!elem.offsetHeight;


function toggleAll(box) {
  const categories = document.querySelectorAll("#categories div"),
        len = categories.length,
        state = !!box.style.backgroundColor;
  for (i = 1; i < len; i++) {
    const category = categories[i];
    if (state && !!category.style.backgroundColor) {
      hideCategory(category);
    } else if (!state && !category.style.backgroundColor){
      showCategory(category);
    }
  }
}

function toggleCategory(box) {
  if (!!box.style.backgroundColor) {
    hideCategory(box);
  } else {
    showCategory(box);
  }
}

function hideModal(elem) {
  elem.className = "modalbg hide";
}

var nex;

const openFeeds = elem => {
  let items = elem.querySelectorAll("div"),
      i = 0,
      m = items.length;

  clearInterval(nex);
  elem.className = "itemslist open";
  nex = setInterval(() => {
    items[i].classList.add("out");
    i++;
    (i >= m) && clearInterval(nex);
  }, 100);
}

const closeFeeds = elem => {
  let items = elem.querySelectorAll("div");
      m = items.length;

  clearInterval(nex);
  nex = setInterval(() => {
    if (m > 0) {
      m--;
      items[m].classList.remove("out");
    } else {
      clearInterval(nex);
      nex = setTimeout(() => elem.className = "itemslist", 1000);
    }
  }, 100);
}

var nex2;

const openCategories = elem => {
  let items = elem.querySelectorAll("div"),
      i = 0,
      m = items.length;

  clearInterval(nex2);
  elem.className = "itemslist open";
  nex2 = setInterval(() => {
    items[i].classList.add("out");
    i++;
    (i === m) && clearInterval(nex2);
  }, 100);
}

const closeCategories = elem => {
  let items = elem.querySelectorAll("div");
      m = items.length;

  clearInterval(nex2);
  nex2 = setInterval(() => {
    if (m > 0) {
      m--;
      items[m].classList.remove("out");
    } else {
      clearInterval(nex2)
      nex2 = setTimeout(() => elem.className = "itemslist", 1000);
    }
  }, 100);
}

function toggleItems(button, elem) {
  if (button.className === "newsbtn open") {
    if (button.id === "feedbtn") {
      closeFeeds(elem);
    } else {
      closeCategories(elem);
    }
    button.className = "newsbtn";
  } else if (button.className === "newsbtn") {
    if (button.id === "feedbtn") {
      dropOnClickOutside(button, document.querySelector('#feeds'),
      closeFeeds);
      openFeeds(elem);
    } else {
      dropOnClickOutside(button, document.querySelector('#categories'),
      closeCategories);
      openCategories(elem);
    }
    button.className = "newsbtn open";
  }
}

const buildFeedsList = () => {
  // Populate list of RSS feeds
  var feedsDiv = document.querySelector("#feeds");

  feeds.forEach(item => {
    let feedItem = document.createElement("div");

    feedItem.textContent = item[0];
    feedItem.className = "item";
    if (item === currentFeed) {
      feedItem.className = "item active";
    }
    feedItem.addEventListener("click", () => {
      feedAddress = item[1];
      clearNews();
      loadRSS(item[1], proxy);
      document.querySelector(".active").classList.remove("active");
      feedItem.classList.add("active");
    });

    feedsDiv.appendChild(feedItem);
  });
}

(() => {
  window.addEventListener("load", getFeeds);
  document.querySelector("#newsbutton").addEventListener("click", 
  () => loadRSS(currentFeed[1], proxy));
  document.querySelector("#feedbtn").addEventListener("click", event => 
  toggleItems(event.currentTarget, document.querySelector("#feeds")));
  document.querySelector("#categoriesbtn").addEventListener("click", event => 
  toggleItems(event.currentTarget, document.querySelector("#categories")));
})();