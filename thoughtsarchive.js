import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// This function now lives outside the event listener to be used on index.html
function openCategory(name) {
  window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

// All other functions for categorypage.html are inside the listener
let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
let currentSortBy = "newest";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const POSTS_TO_SHOW = 50;

// *** UPDATED: Now gets thoughts from Supabase ***
async function displayEntries(categoryName, sortBy = "newest") {
  const entryList = document.getElementById("entry-list");
  entryList.innerHTML = "";
  
  const { data: thoughts, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('category', categoryName) // Fetch only thoughts for the current category

  if (error) {
    console.error('Error fetching thoughts:', error);
    return;
  }
  
  let sortedEntries = thoughts;
  if (sortBy === "oldest") {
      sortedEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created.at));
  } else {
      sortedEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  
  sortedEntries.slice(0, POSTS_TO_SHOW).forEach(entry => {
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

    displayEntries(categoryName, currentSortBy);

    textInput.addEventListener("paste", (event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, text);
    });

    addThoughtBtn.addEventListener("click", () => {
        uploadSection.style.display = "flex";
    });

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

    closeBtn.addEventListener("click", () => {
      uploadSection.style.display = "none";
    });

    sortBtn.addEventListener("click", () => {
        sortDropdown.classList.toggle("active");
    });
    
    document.addEventListener("click", (e) => {
      if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.classList.remove("active");
      }
    });

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

// *** UPDATED: Now saves to Supabase ***
async function addEntry() {
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
  
  const { data, error } = await supabase
    .from('thoughts')
    .insert([
      { category: categoryName, title: entryTitle, text: entryText },
    ])
    .select()

  if (error) {
    console.error('Error adding entry:', error);
    alert('There was an error saving your thought. Please try again.');
    return;
  }

  // Redisplay all entries after adding a new one
  displayEntries(categoryName, currentSortBy);

  titleInput.value = "";
  textInput.innerHTML = "";
  uploadSection.style.display = "none";
}

// *** UPDATED: Now deletes from Supabase ***
async function deleteEntry(categoryName, entryTitle, entryText) {
  if (confirm("Are you sure you want to delete this thought?")) {
    const { error } = await supabase
      .from('thoughts')
      .delete()
      .eq('category', categoryName)
      .eq('title', entryTitle)

    if (error) {
      console.error('Error deleting entry:', error);
      alert('There was an error deleting your thought. Please try again.');
      return;
    }
    
    displayEntries(categoryName, currentSortBy);
  }
}

// Function to display an entry (no change)
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

  entryList.prepend(entryDiv);
}
