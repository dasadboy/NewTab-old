let bookmarksTree, favouriteIDs,
    history = [];

const getBookmarksTree = () => {
  chrome.bookmarks.getTree(rslt => {
    bookmarksTree = rslt[0];
    populateBookmarks(bookmarksTree);
  });
}

const getFavourites = () => {
  chrome.storage.local.get("fav_ids", rslt => {
    favouriteIDs = rslt["fav_ids"];
    !!favouriteIDs.length && populateFavourites();
  });
}

const buildBookmark = bookmarkTree => {
  const bookmark = document.createElement("div"),
        link = document.createElement("a"),
        icon = document.createElement("img"),
        name = document.createElement("span"),
        menuBtn = document.createElement("span");
  
  bookmark.className = "bookmark";
  icon.className = "icon";
  name.className = "name";
  menuBtn.className = "menuBtn";
  if (bookmarkTree.children) {
    icon.src = "bookmarkfolder.ico";
    link.addEventListener("click", () => {
      bookmark.parentNode.style.display = "none";
      populateBookmarks(bookmarkTree);
    });
    link.className = "link folder";
  } else {
    icon.src = `https://www.google.com/s2/favicons?domain=${bookmarkTree.url}`;
    link.href = bookmarkTree.url;
    link.className = "link page";
  }
  let i;
  for (i = 0; i < 3; i++) {
    menuBtn.appendChild(document.createElement("div"));
  }
  name.textContent = bookmarkTree.title;
  link.appendChild(icon);
  link.appendChild(name);
  bookmark.appendChild(link);
  bookmark.appendChild(menuBtn);
  return bookmark
}

const populateBookmarks = bookmarkTree => {
  const bookmarksContainer = document.querySelector("#bookmarks"),
        folder = document.createElement("div");

  folder.className = "folderContents";
  if (bookmarkTree.title !== "") {
    const back = document.createElement("div");
    back.appendChild(document.createElement("div"));
    back.className = "back";
    back.addEventListener("click", () => {
      folder.previousElementSibling.style.display = "";
      folder.remove();
    })
    folder.appendChild(back);
  }

  for (child of bookmarkTree.children) {
    folder.appendChild(buildBookmark(child));
  }
  bookmarksContainer.appendChild(folder);
}

const populateFavourites = () => {
  const container = document.querySelector("#favourites");

  chrome.bookmarks.get(favouriteIDs, results => {
    for (result of results) {
      container.appendChild(buildBookmark(result));
    }
  });
}

const openMenu = (bookmark, bookmarkContainer) => {
  const menu = document.createElement("span");

  menu.className = "menu";
  if (bookmarkContainer.parentNode.id === "bookmarks") {
    const addToFavourites = document.createElement("button");
    addToFavourites.textContent = "Add To Favourites";

    addToFavourites.addEventListener("click", () => {
      favouriteIDs.push(bookmark.id);
      saveFavouriteIDs();
    });
    menu.appendChild(addToFavourites);
  } else {
    const removeFromFavourites = document.createElement("button");
    removeFromFavourites.textContent = "Remove"
  }

  const disappearOnClick = () => {
    menu.remove();
    removeClickListener();
  }

  const removeClickListener = () => {
    window.removeEventListener("click", disappearOnClick);
  }

  setTimeout(() => window.addEventListener("click", disappearOnClick), 1);
}

const saveFavouriteIDs = () => {
  chrome.storage.set({"fav_ids": favouriteIDs});
}

(() => {
  window.addEventListener("load", () => {
    getBookmarksTree();
    getFavourites();
  });
})();