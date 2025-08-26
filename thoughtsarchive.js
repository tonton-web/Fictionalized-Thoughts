// Initialize Supabase client
const supabaseUrl = "https://oblabtwrbdmrglcwfxgl.supabase.co"; // replace with your Supabase project URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGFidHdyYmRtcmdsY3dmeGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNTAwNjYsImV4cCI6MjA3MTYyNjA2Nn0.YgB8gRZJ0TiwXWo-I_LgYUdeY-gyy936k70-lm7vUOI"; // replace with your Supabase anon key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Function to open category page
function openCategory(categoryName) {
    // Redirect to category page with query string
    window.location.href = `categorypage.html?category=${encodeURIComponent(categoryName)}`;
}

// Example: Load thoughts (if you want to fetch from Supabase later)
async function loadThoughts(category) {
    try {
        const { data, error } = await supabase
            .from("thoughts")
            .select("*")
            .eq("category", category);

        if (error) throw error;

        console.log("Thoughts loaded:", data);
        return data;
    } catch (err) {
        console.error("Error loading thoughts:", err.message);
        return [];
    }
}

// Helper: get query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
