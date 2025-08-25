const SUPABASE_URL = 'https://oblabtwrbdmrglcwfxgl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGFidHdyYmRtcmdsY3dmeGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTAwNjYsImV4cCI6MjA3MTYyNjA2Nn0.YgB8gRZJ0TiwXWo-I_LgYUdeY-gyy936k70-lm7vUOI'

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function openCategory(name) {
  window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

let currentSortBy = "newest";

async function displayEntries(categoryName, sortBy = "newest") {
  const entryList = document.getElementById("entry-list");
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

    if (title) title.textContent = categoryName;
    if (content) content.innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;
    
    displayEntries(categoryName, currentSortBy);

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

    const postBtn = document.querySelector('button[onclick="addEntry()"]');
    if (postBtn) {
        postBtn.addEventListener('click', addEntry);
    }
  }
});

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
  
  const { data, error } = await supabaseClient
    .from('thoughts')
    .insert([
      { category: categoryName, title: entryTitle, text: entryText },
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

async function deleteEntry(categoryName, entryTitle, entryText) {
  if (confirm("Are you sure you want to delete this thought?")) {
    const { error } = await supabaseClient
      .from('thoughts')
      .delete()
      .eq('category', categoryName)
      .eq('title', entryTitle);

    if (error) {
      console.error('Error deleting entry:', error);
      alert('There was an error deleting your thought. Please try again.');
      return;
    }
    
    displayEntries(categoryName, currentSortBy);
  }
}

function displayEntry(title, text) {
  const entryList = document.getElementById("entry-list");
  if (!entryList) return;

  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");

  const formattedText = text.replace(/\n/g, "<br>");
  entryDiv.innerHTML = `<h4>${title}</h4><p>${formattedText}</p>`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    deleteEntry(categoryName, title, text);
  });

  entryDiv.appendChild(deleteBtn);
  entryList.prepend(entryDiv);
}
