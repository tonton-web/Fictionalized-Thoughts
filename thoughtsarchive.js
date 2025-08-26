const SUPABASE_URL = 'https://oblabtwrbdmrglcwfxgl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGFidHdyYmRtcmdsY3dmeGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTAwNjYsImV4cCI6MjA3MTYyNjA2Nn0.YgB8gRZJ0TiwXWo-I_LgYUdeY-gyy936k70-lm7vUOI'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function openCategory(name) {
  window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
let currentSortBy = "newest";

async function displayEntries(categoryName, sortBy = "newest") {
  const entryList = document.getElementById("entry-list");
  if (!entryList) return;
  entryList.innerHTML = "";
  
  const { data: thoughts, error } = await supabaseClient
    .from('thoughts')
    .select('*')
    .eq('category', categoryName);

  if (error) {
    console.error('Error fetching thoughts:', error);
    return;
  }
  
  let sortedEntries = thoughts;
  if (sortBy === "oldest") {
      sortedEntries.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else {
      sortedEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    const uploadSection = document.getElementById("upload-section");
    const addThoughtBtn = document.getElementById("add-thought-btn");
    const closeBtn = document.querySelector(".close-btn");
    const dragHandle = document.querySelector("#upload-header");
    const resizeHandle = document.querySelector(".resize-handle");
    const textInput = document.getElementById("entry-text");
    const sortBtn = document.getElementById("sort-btn");
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortOptions = document.querySelectorAll(".sort-option");

    if (title) title.textContent = categoryName;
    if (content) content.innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;
    
    displayEntries(categoryName, currentSortBy);
    
    // Paste functionality
if (textInput) {
    textInput.addEventListener("paste", (event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
    });
}

    if (addThoughtBtn) {
        addThoughtBtn.addEventListener("click", () => {
            if (uploadSection) uploadSection.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            if (uploadSection) uploadSection.style.display = "none";
        });
    }
    
    // Drag functionality
    if (dragHandle && uploadSection) {
        dragHandle.addEventListener("mousedown", (e) => {
          e.preventDefault();
          isDragging = true;
          offsetX = e.clientX - uploadSection.offsetLeft;
          offsetY = e.clientY - uploadSection.offsetTop;
          uploadSection.style.cursor = "grabbing";
        });
    }

    // Resize functionality
    if (resizeHandle && uploadSection) {
        resizeHandle.addEventListener("mousedown", (e) => {
          e.preventDefault();
          isResizing = true;
          e.stopPropagation();
          initialWidth = uploadSection.offsetWidth;
          initialHeight = uploadSection.offsetHeight;
          initialX = e.clientX;
          initialY = e.clientY;
        });
    }

    document.addEventListener("mousemove", (e) => {
      if (isDragging && uploadSection) {
        uploadSection.style.left = (e.clientX - offsetX) + "px";
        uploadSection.style.top = (e.clientY - offsetY) + "px";
      }
      if (isResizing && uploadSection) {
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
      isDragging = false;
      isResizing = false;
      if (uploadSection) uploadSection.style.cursor = "default";
    });

    // Post entry button
    const postBtn = document.getElementById("post-entry-btn");
    if (postBtn) {
        postBtn.addEventListener('click', addEntry);
    }
    
    // Sort functionality
    if (sortBtn && sortDropdown && sortOptions) {
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
  }
});

async function addEntry() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    // Check if the user is logged in
    if (!user) {
        alert("You must be logged in to post a thought.");
        return;
    }

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
    
    // Include the user's ID in the insert query
    const { data, error } = await supabaseClient
        .from('thoughts')
        .insert([
            {
                category: categoryName,
                title: entryTitle,
                text: entryText,
                user_id: user.id  // This is the new, crucial line
            },
        ])
        .select();

    if (error) {
        console.error('Error adding entry:', error);
        alert('There was an error saving your thought. Please try again.');
        return;
    }

    displayEntries(categoryName, currentSortBy);

    titleInput.value = "";
    textInput.innerHTML = "";
    if (uploadSection) uploadSection.style.display = "none";
}

async function deleteEntry(id) {
  if (confirm("Are you sure you want to delete this thought?")) {
    const { error } = await supabaseClient
      .from('thoughts')
      .delete()
      .eq('category', categoryName)
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      alert('There was an error deleting your thought. Please try again.');
      return;
    }
    
    displayEntries(categoryName, currentSortBy);
  }
}

function displayEntry(title, text, id) {
  const entryList = document.getElementById("entry-list");
  if (!entryList) return;

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
    deleteEntry(id);
  });
  
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("entry-buttons");
  buttonContainer.appendChild(readMoreBtn);
  buttonContainer.appendChild(collapseBtn);
  buttonContainer.appendChild(deleteBtn);
  entryDiv.appendChild(buttonContainer);

  entryList.prepend(entryDiv);
}





