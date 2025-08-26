// Thoughts Archive Script

document.addEventListener("DOMContentLoaded", () => {
    const addThoughtBtn = document.getElementById("add-thought-btn");
    const uploadContainer = document.getElementById("upload-container");
    const closeBtn = document.querySelector(".close-btn");
    const postEntryBtn = document.getElementById("post-entry-btn");
    const archiveContainer = document.getElementById("archive-container");
    const sortBtn = document.getElementById("sort-btn");
    const sortDropdown = document.getElementById("sort-dropdown");

    // Ensure modal stays hidden on page load
    if (uploadContainer) {
        uploadContainer.style.display = "none";
    }

    // Toggle modal open
    if (addThoughtBtn) {
        addThoughtBtn.addEventListener("click", () => {
            uploadContainer.style.display = "flex";
        });
    }

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            uploadContainer.style.display = "none";
        });
    }

    // Post a new thought
    if (postEntryBtn) {
        postEntryBtn.addEventListener("click", () => {
            const title = document.getElementById("thought-title").value.trim();
            const content = document.getElementById("thought-content").innerHTML.trim();

            if (title && content) {
                const entry = document.createElement("div");
                entry.classList.add("thought-entry");

                entry.innerHTML = `
                    <h3>${title}</h3>
                    <p>${content}</p>
                    <small>${new Date().toLocaleString()}</small>
                `;

                archiveContainer.prepend(entry);

                // Reset inputs
                document.getElementById("thought-title").value = "";
                document.getElementById("thought-content").innerHTML = "";

                // Hide modal after posting
                uploadContainer.style.display = "none";
            } else {
                alert("Please enter both a title and content.");
            }
        });
    }

    // Sorting dropdown toggle
    if (sortBtn) {
        sortBtn.addEventListener("click", () => {
            sortDropdown.style.display = sortDropdown.style.display === "block" ? "none" : "block";
        });
    }

    // Hide sort dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.style.display = "none";
        }
    });

    // Sorting functionality
    if (sortDropdown) {
        sortDropdown.addEventListener("click", (e) => {
            if (e.target.tagName === "A") {
                const sortType = e.target.getAttribute("data-sort");
                const entries = Array.from(archiveContainer.getElementsByClassName("thought-entry"));

                entries.sort((a, b) => {
                    const aDate = new Date(a.querySelector("small").textContent);
                    const bDate = new Date(b.querySelector("small").textContent);

                    if (sortType === "newest") {
                        return bDate - aDate;
                    } else if (sortType === "oldest") {
                        return aDate - bDate;
                    }
                });

                // Re-append sorted entries
                archiveContainer.innerHTML = "";
                entries.forEach(entry => archiveContainer.appendChild(entry));
            }
        });
    }

    // Resize modal functionality
    const resizeHandle = document.querySelector(".resize-handle");
    if (resizeHandle && uploadContainer) {
        let isResizing = false;

        resizeHandle.addEventListener("mousedown", (e) => {
            isResizing = true;
            document.body.style.userSelect = "none"; // Prevent text highlighting
        });

        window.addEventListener("mousemove", (e) => {
            if (isResizing) {
                const newHeight = e.clientY - uploadContainer.getBoundingClientRect().top;
                if (newHeight > 200 && newHeight < window.innerHeight - 50) {
                    uploadContainer.style.height = `${newHeight}px`;
                }
            }
        });

        window.addEventListener("mouseup", () => {
            isResizing = false;
            document.body.style.userSelect = ""; // Reset text selection
        });
    }
});
