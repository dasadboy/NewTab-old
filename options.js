let feeds, close;

const getFeeds = func => {
  chrome.storage.local.get(["newsfeeds"], result => {
    feeds = result.newsfeeds;
    func()
  });
}

const getProxy = () => {
  chrome.storage.local.get(["proxy"], result => {
    document.querySelector("#proxy").value = result.proxy
  })
}

const saveFeeds = () => {
  chrome.storage.local.set({newsfeeds: feeds}, () => {
    peekMessage("Feeds saved.");
  });
}

const saveProxy = (newProxy) => {
  chrome.storage.local.set({proxy: newProxy}, () => {
    peekMessage("New proxy saved.")
  });
}

const addFeed = (feedName, feedSrc) => {
  feeds.push([feedName, feedSrc]);
  document.querySelector("#feeds").appendChild(newFeedDiv(feedName, feedSrc));
}

const confirmNewFeed= event => {
  const feedName = document.querySelector("#newFeedName"),
        feedSrc = document.querySelector("#newFeedSrc");
  
  if (!feedName.value) {
    alert("A name was not entered.");
  } else if (!feedSrc.value){
    alert("A source was not entered.");
  } else {
    addFeed(feedName.value, feedSrc.value);
    feedName.value = "";
    feedSrc.value = "";
  }
  event.preventDefault();
}

const newFeedDiv = (feedName, feedSrc) => {
  const feedElem = document.createElement("div"),
        feedNameElem = document.createElement("span"),
        feedSrcElem = document.createElement("span"),
        feedMenuBtnElem = document.createElement("span");

  feedNameElem.textContent = feedName;
  feedNameElem.className = "name";

  feedElem.appendChild(feedNameElem);

  feedSrcElem.textContent = feedSrc;
  feedSrcElem.className = "src";
  feedElem.appendChild(feedSrcElem);

  let i = 0;
  for (i; i < 3; i++) {
    const dot = document.createElement("div");
    
    dot.className = "dot";
    feedMenuBtnElem.appendChild(dot);
  }

  feedMenuBtnElem.className = "context";
  feedMenuBtnElem.addEventListener("click", openFeedOptions);
  feedElem.appendChild(feedMenuBtnElem);

  feedElem.className = "feed";

  return feedElem
}

const populateFeedsList = () => {
  const feedsContainer = document.getElementById("feeds");

  feedsContainer.innerHTML = "";
  for (const feed of feeds) {
    feedsContainer.appendChild(newFeedDiv(feed[0], feed[1]));
  }
}

const openFeedOptions = event => {
  const feedsContainer = document.querySelector("#feeds"),
        optionsContainer = document.createElement("div"),
        editName = document.createElement("button"),
        editSrc = document.createElement("button"),
        remove = document.createElement("button"),
        moveTop = document.createElement("button"),
        feed = event.currentTarget.parentNode,
        feedIndex = (feed.offsetTop/feed.offsetHeight);

  optionsContainer.className = "contextMenu";
  optionsContainer.style.transform = 
  `translateY(${feed.offsetTop - feedsContainer.scrollTop}px)`
  
  editName.textContent = "Edit Name";
  editName.addEventListener("click", () => {
    const textField = document.createElement("input"),
          feedNameField = feed.querySelector(".name"),
          form = document.createElement("form"),
          currentFeedName = feedNameField.textContent;
    feedNameField.textContent = "";
    textField.type = "text";
    textField.placeholder = "New Feed Name";
    form.addEventListener("submit", event => {
      const newFeedName = textField.value;
      feedNameField.textContent = newFeedName;
      feeds[feedIndex][0] = newFeedName;
      removeThis();
      event.preventDefault();
    });

    const cancelOnClickOutside = event => {
      if (!feedNameField.contains(event.target) && 
      !editName.contains(event.target) &&
      feedNameField.querySelector("form")) {
        feedNameField.textContent = currentFeedName;
        removeThis();
      }
    }

    const removeThis = () => window.removeEventListener(
      "click", cancelOnClickOutside
    );
    
    form.appendChild(textField);
    feedNameField.appendChild(form);
    textField.focus();

    setTimeout(window.addEventListener("click", cancelOnClickOutside), 50);
  });

  editSrc.textContent = "Edit Source";
  editSrc.addEventListener("click", () => {
    const textField = document.createElement("input"),
          feedSrcField = feed.querySelector(".src"),
          form = document.createElement("form"),
          currentFeedSrc = feedSrcField.textContent;
    feedSrcField.textContent = "";
    textField.type = "text";
    textField.placeholder = "New Feed Source";
    form.addEventListener("submit", event => {
      const newFeedSrc = textField.value;
      feedSrcField.textContent = newFeedSrc;
      feeds[feedIndex][1] = newFeedSrc;
      removeThis();
      event.preventDefault();
    });

    const cancelOnClickOutside = event => {
      if (!feedSrcField.contains(event.target) && 
      !editSrc.contains(event.target) &&
      feedSrcField.querySelector("form")) {
        feedSrcField.innerHTML = "";
        feedSrcField.textContent = currentFeedSrc;
        removeThis();
      }
    }

    const removeThis = () => window.removeEventListener(
      "click", cancelOnClickOutside
    );
    
    form.appendChild(textField);
    feedSrcField.appendChild(form);
    textField.focus();
    
    setTimeout(window.addEventListener("click", cancelOnClickOutside), 1);

    return false;
  });

  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    feed.remove();
    feeds.splice(feedIndex, 1);
  });

  moveTop.textContent = "Move To Top";
  moveTop.addEventListener("click", () => {
    feed.parentNode.prepend(feed);
    feeds.unshift(feeds[feedIndex])
    feeds.splice(feedIndex + 1, 1);
  });

  optionsContainer.appendChild(editName);
  optionsContainer.appendChild(editSrc);
  optionsContainer.appendChild(remove);
  optionsContainer.appendChild(moveTop);

  document.querySelector("#feedField").appendChild(optionsContainer);

  const disappearOnClick = () => {
    optionsContainer.remove();
    removeClickListener()
  }

  const removeClickListener = () => {
    window.removeEventListener("click", disappearOnClick);
  }

  setTimeout(() => window.addEventListener("click", disappearOnClick), 1);
}

const openModalMenu = menu => {
  const modalBack = document.querySelector("#modalContainer");
  
  modalBack.style.display = "block";
  setTimeout(() => modalBack.className = "on", 1);
  setTimeout(() => {
    modalBack.addEventListener("click", event => {
      if (event.target === modalBack) {
        menu.style.display = "none";
        setTimeout(() => modalBack.className = "", 200);
        setTimeout(() => modalBack.style.display = "none", 500);
      }
    });
  }, 1);

  setTimeout(() => menu.style.display = "block", 500);
}

const loadFeeds = () => {
  getFeeds(populateFeedsList);
}

const setProxy = () => {
  saveProxy(document.querySelector("#proxy").value);
}

const parseAndSubmit = () => {
  const lines =
  `${document.querySelector("#inputFeeds textarea").value}`.split("\n");

  document.querySelector("#inputFeeds textarea").value = "";
  for (line of lines) {
    if (line !== "") {
      const splitLine = line.split(/'\s*,\s*'/),
            feedName = splitLine[0].split(/\s*'\s*/)[1],
            feedSrc = splitLine[1].split(/\s*'\s*/)[0];
      
      addFeed(feedName, feedSrc);
    }
  }
}

const peekMessage = message => {
  const messageElem = document.querySelector("#hello");

  clearTimeout(close);
  messageElem.textContent = message;
  messageElem.style.transform = `translateX(-50%) translateY(-100%)`;
  close = setTimeout(() => {
    messageElem.style.transform = `translateX(-50%) translateY(0)`
  },
  2000);
}

(() => {
  document.querySelector("#modalContainer").style.display = "none";

  document.querySelector("#addFeedBtn").addEventListener("click", () => {
    openModalMenu(document.querySelector("#newFeed"));
  });

  document.querySelector("#newFeed input[type='submit']").addEventListener(
    "click", confirmNewFeed
  );

  document.querySelector("#saveFeedsBtn").addEventListener("click", 
  saveFeeds);

  document.querySelector("#feedRefresh").addEventListener("click",
  loadFeeds);

  document.querySelector("#setProxy").addEventListener("click", setProxy);

  document.querySelector("#addMultipleFeeds").addEventListener("click",
  () => {
    openModalMenu(document.querySelector("#inputFeeds"));
  });

  document.querySelector("#inputFeeds button").addEventListener("click",
  parseAndSubmit);

  document.querySelector("#inputFeeds textarea").placeholder = 
  "'Feed Name', 'Feed Source'\nFeeds are separated by lines."

  window.addEventListener("load", loadFeeds);
  window.addEventListener("load", getProxy);
})();