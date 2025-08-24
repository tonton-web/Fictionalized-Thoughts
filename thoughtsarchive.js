let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
let currentSortBy = "newest";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const POSTS_TO_SHOW = 50;

function openCategory(name) {
  window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

function displayEntries(categoryName, sortBy = "newest") {
  const entryList = document.getElementById("entry-list");
  entryList.innerHTML = "";

  const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
  
  let sortedEntries;
  if (sortBy === "oldest") {
    // Sort by oldest: slice the start of the array
    sortedEntries = savedEntries.slice(0, POSTS_TO_SHOW);
  } else {
    // Default to newest: slice the end of the array and reverse it
    sortedEntries = savedEntries.slice(-POSTS_TO_SHOW).reverse();
  }
  
  sortedEntries.forEach(entry => {
    displayEntry(entry.title, entry.text);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name");

  if (categoryName) {
    const title = document.getElementById("category-title");
    const content = document.getElementById("category-content");
    const entryList = document.getElementById("entry-list");
    const uploadSection = document.getElementById("upload-section");
    const addThoughtBtn = document.getElementById("add-thought-btn");
    const textInput = document.getElementById("entry-text");
    const dragHandle = document.querySelector("#upload-header");
    const resizeHandle = document.querySelector(".resize-handle");
    const closeBtn = document.querySelector(".close-btn");
    const sortBtn = document.getElementById("sort-btn");
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortOptions = document.querySelectorAll(".sort-option");

    title.textContent = categoryName;
    content.innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;

    // Load and display saved entries, with a limit and default sort
    displayEntries(categoryName, currentSortBy);

    // Handle pasting plain text
    textInput.addEventListener("paste", (event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
    });

    // Show the upload window when the button is clicked
    addThoughtBtn.addEventListener("click", () => {
        uploadSection.style.display = "flex";
    });

    // Draggable functionality
    dragHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      offsetX = e.clientX - uploadSection.offsetLeft;
      offsetY = e.clientY - uploadSection.offsetTop;
      uploadSection.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        uploadSection.style.left = (e.clientX - offsetX) + "px";
        uploadSection.style.top = (e.clientY - offsetY) + "px";
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      uploadSection.style.cursor = "default";
    });

    // Resizable functionality
    resizeHandle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isResizing = true;
      e.stopPropagation();
      initialWidth = uploadSection.offsetWidth;
      initialHeight = uploadSection.offsetHeight;
      initialX = e.clientX;
      initialY = e.clientY;
    });

    document.addEventListener("mousemove", (e) => {
      if (isResizing) {
        const deltaX = e.clientX - initialX;
        const deltaY = e.clientY - initialY;
        const newWidth = initialWidth + deltaX;
        const newHeight = initialHeight + deltaY;

        if (newWidth >= MIN_WIDTH) {
          uploadSection.style.width = newWidth + "px";
        }
        if (newHeight >= MIN_HEIGHT) {
          uploadSection.style.height = newHeight + "px";
        }
      }
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
    });

    // Close button functionality
    closeBtn.addEventListener("click", () => {
      uploadSection.style.display = "none";
    });

    // Toggle sort dropdown on button click
    sortBtn.addEventListener("click", () => {
        sortDropdown.classList.toggle("active");
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
          sortDropdown.classList.remove("active");
      }
    });

    // Handle sort option clicks
    sortOptions.forEach(option => {
      option.addEventListener("click", (e) => {
        currentSortBy = e.target.dataset.sortBy;
        sortBtn.textContent = `Sort By: ${e.target.textContent}`;
        displayEntries(categoryName, currentSortBy);
        sortDropdown.classList.remove("active");
      });
    });
  }
});

// Function to add new entry
function addEntry() {
  const params = new URLSearchParams(window.location.search);
  const categoryName = params.get("name");
  const titleInput = document.getElementById("entry-title");
  const textInput = document.getElementById("entry-text");
  const uploadSection = document.getElementById("upload-section");

  const entryTitle = titleInput.value.trim();
  const entryText = textInput.innerHTML.trim();

  if (!entryTitle || !entryText) {
    alert("Please enter both a title and content.");
    return;
  }

  const newEntry = { title: entryTitle, text: entryText };
  const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
  savedEntries.push(newEntry);
  localStorage.setItem(categoryName, JSON.stringify(savedEntries));

  // Redisplay all entries after adding a new one
  displayEntries(categoryName, currentSortBy);

  titleInput.value = "";
  textInput.innerHTML = "";
  uploadSection.style.display = "none";
}

// Function to delete an entry
function deleteEntry(categoryName, entryTitle, entryText) {
  if (confirm("Are you sure you want to delete this thought?")) {
    const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
    const updatedEntries = savedEntries.filter(entry => entry.title !== entryTitle || entry.text !== entryText);
    localStorage.setItem(categoryName, JSON.stringify(updatedEntries));
    displayEntries(categoryName, currentSortBy);
  }
}


// Function to display an entry
function displayEntry(title, text) {
  const entryList = document.getElementById("entry-list");
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");

  const formattedText = text.replace(/\n/g, "<br>");
  entryDiv.innerHTML = `<h4>${title}</h4><p>${formattedText}</p>`;

  const readMoreBtn = document.createElement("button");
  readMoreBtn.textContent = "Read More";
  readMoreBtn.classList.add("read-more-btn");
  readMoreBtn.addEventListener("click", () => {
    entryDiv.classList.add("expanded");
  });

  const collapseBtn = document.createElement("button");
  collapseBtn.textContent = "Collapse";
  collapseBtn.classList.add("collapse-btn");
  collapseBtn.addEventListener("click", () => {
    entryDiv.classList.remove("expanded");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    deleteEntry(categoryName, title, text);
  });

  entryDiv.appendChild(readMoreBtn);
  entryDiv.appendChild(collapseBtn);
  entryDiv.appendChild(deleteBtn);

  entryList.prepend(entryDiv);
}