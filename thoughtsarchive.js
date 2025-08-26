// Select elements
const entryTitle = document.getElementById("entry-title");
const entryText = document.getElementById("entry-text");
const postButton = document.getElementById("post-button");
const entryList = document.getElementById("entry-list");

// Default profile info (later we can make this dynamic per user)
const defaultProfile = {
  name: "Guest User",
  avatar: "https://via.placeholder.com/40" // placeholder profile image
};

// Handle post button click
postButton.addEventListener("click", () => {
  const title = entryTitle.value.trim();
  const text = entryText.innerHTML.trim(); // capture HTML for rich text

  if (!title && !text) return; // don't post empty entries

  displayEntry(defaultProfile, title, text);

  // Clear inputs
  entryTitle.value = "";
  entryText.innerHTML = "";
});

// Display a new entry
function displayEntry(profile, title, text) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("entry");

  // Collapsible logic
  const contentId = "content-" + Date.now();

  entryDiv.innerHTML = `
    <div class="entry-header">
      <img src="${profile.avatar}" class="avatar" alt="Profile">
      <div>
        <h4 class="entry-name">${profile.name}</h4>
        <h5 class="entry-title">${title}</h5>
      </div>
    </div>
    <div class="entry-body collapsed" id="${contentId}">
      ${text}
    </div>
    <button class="toggle-btn" data-target="${contentId}">Show more</button>
  `;

  entryList.prepend(entryDiv);

  // Add toggle functionality
  const toggleBtn = entryDiv.querySelector(".toggle-btn");
  toggleBtn.addEventListener("click", () => {
    const body = document.getElementById(contentId);
    if (body.classList.contains("collapsed")) {
      body.classList.remove("collapsed");
      toggleBtn.textContent = "Show less";
    } else {
      body.classList.add("collapsed");
      toggleBtn.textContent = "Show more";
    }
  });
}
