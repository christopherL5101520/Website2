// JavaScript controls behavior and interactivity.
// HTML gives the structure.
// CSS gives the appearance.
// JavaScript gives the page actions.

// ============================================================================
// TOPICS DATA
// ============================================================================
// This is the searchable index of all study topics.
// To add more topics, just add an object to this array with title and slug.
// The slug is used in URLs and should be unique and URL-safe.
// ============================================================================

const topics = [
    {
        title: "SAT: Math",
        slug: "sat-math",
        summary:
            "Includes algebra, geometry, and data analysis. Most questions are calculator and non-calculator based, with about 58 questions total.",
        metrics: [
            { label: "Pass Rate", value: "65%" },
            { label: "Avg Time", value: "3 hrs" },
        ],
    },
    {
        title: "SAT: Reading & Writing",
        slug: "sat-reading-writing",
        summary:
            "Tests reading comprehension and grammar. The section includes passage-based reading and writing/editing questions.",
        metrics: [
            { label: "Pass Rate", value: "58%" },
            { label: "Avg Time", value: "3 hrs" },
        ],
    },
    {
        title: "AP Chemistry",
        slug: "ap-chemistry",
        summary:
            "Covers atomic structure, reactions, thermodynamics, and lab-based reasoning. The exam has multiple choice and free response sections.",
        metrics: [
            { label: "AP 5 Rate", value: "15%" },
            { label: "Avg Time", value: "5 hrs" },
        ],
    },
    {
        title: "AP Lang & Composition",
        slug: "ap-lang-comp",
        summary:
            "Focuses on rhetorical analysis, argument, and synthesis. The exam is mostly essay-based with some multiple-choice reading questions.",
        metrics: [
            { label: "AP 5 Rate", value: "10%" },
            { label: "Avg Time", value: "4 hrs" },
        ],
    },
    {
        title: "AP US History",
        slug: "ap-us-history",
        summary:
            "Tests U.S. history knowledge from pre-colonial times to the present, including documents and essay writing.",
        metrics: [
            { label: "AP 5 Rate", value: "12%" },
            { label: "Avg Time", value: "5 hrs" },
        ],
    },
    {
        title: "AP Biology",
        slug: "ap-biology",
        summary:
            "Includes molecules, cells, genetics, evolution, and ecology. The exam combines multiple-choice and free-response questions.",
        metrics: [
            { label: "AP 5 Rate", value: "21%" },
            { label: "Avg Time", value: "5 hrs" },
        ],
    },
    {
        title: "AP Calculus",
        slug: "ap-calculus",
        summary:
            "Covers limits, derivatives, integrals, and the Fundamental Theorem of Calculus. The test is calculation-heavy and concept-driven.",
    },
    {
        title: "AP Physics",
        slug: "ap-physics",
        summary:
            "Covers mechanics, electricity, waves, and thermodynamics. Often split into multiple exam variants depending on the course level.",
    },
    {
        title: "AP Government & Politics",
        slug: "ap-government",
        summary:
            "Focuses on U.S. government institutions, political behavior, and public policy. The exam combines multiple choice and free-response questions.",
    },
    {
        title: "AP Literature",
        slug: "ap-literature",
        summary:
            "Tests reading and writing skills through poetry, prose, and literary analysis. The exam includes multiple-choice and essay sections.",
    },
];

const topicStats = {
    "sat-math": { sections: "2", passRate: "65%", fiveRate: "—" },
    "sat-reading-writing": { sections: "2", passRate: "58%", fiveRate: "—" },
    "ap-chemistry": { sections: "2", passRate: "65%", fiveRate: "15%" },
    "ap-lang-comp": { sections: "2", passRate: "60%", fiveRate: "10%" },
    "ap-us-history": { sections: "3", passRate: "62%", fiveRate: "12%" },
    "ap-biology": { sections: "2", passRate: "63%", fiveRate: "21%" },
    "ap-calculus": { sections: "2", passRate: "60%", fiveRate: "24%" },
    "ap-physics": { sections: "2", passRate: "58%", fiveRate: "15%" },
    "ap-government": { sections: "2", passRate: "65%", fiveRate: "20%" },
    "ap-literature": { sections: "2", passRate: "62%", fiveRate: "10%" },
};

function getTopicStats(slug) {
    return topicStats[slug] || { sections: "N/A", passRate: "N/A", fiveRate: "N/A" };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
// Reusable utilities for DOM updates and dropdown behavior.

function updateTopbarCounters(stats) {
    const activeEl = document.getElementById("activeUsers");
    const totalEl = document.getElementById("totalUsers");
    const peakEl = document.getElementById("peakUsers");
    const visitsEl = document.getElementById("totalVisits");

    if (activeEl) activeEl.textContent = stats.activeUsers;
    if (totalEl) totalEl.textContent = stats.totalUsers;
    if (peakEl) peakEl.textContent = stats.peakUsers;
    if (visitsEl) visitsEl.textContent = stats.visits ?? 0;
}

function hideSearchDropdown(dropdown) {
    if (!dropdown) {
        return;
    }
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
}

function renderSearchResults(results, dropdown) {
    if (!dropdown) {
        return;
    }

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-no-results">No topics found</div>';
        dropdown.style.display = "block";
        return;
    }

    dropdown.innerHTML = results
        .map(
            (result) =>
                `<div class="search-result-item" role="option" data-slug="${result.slug}">${result.title}</div>`
        )
        .join("");

    dropdown.style.display = "block";

    dropdown.querySelectorAll(".search-result-item").forEach((item) => {
        item.addEventListener("click", function () {
            const slug = this.getAttribute("data-slug");
            window.location.href = `topic.html?topic=${slug}`;
        });
    });
}

// ============================================================================
// SEARCH FUNCTIONALITY (HOMEPAGE)
// ============================================================================
// Manages homepage search input, filtering, and result selection.

function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchDropdown = document.getElementById("searchDropdown");

    if (!searchInput || !searchDropdown) {
        return;
    }

    searchInput.addEventListener("input", function (event) {
        const query = event.target.value.toLowerCase().trim();

        if (query === "") {
            hideSearchDropdown(searchDropdown);
            return;
        }

        const results = topics.filter((topic) => topic.title.toLowerCase().includes(query));
        renderSearchResults(results, searchDropdown);
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            hideSearchDropdown(searchDropdown);
        }
    });

    document.addEventListener("click", function (event) {
        if (event.target !== searchInput && event.target !== searchDropdown) {
            hideSearchDropdown(searchDropdown);
        }
    });
}

// ============================================================================
// TOPIC PAGE INITIALIZATION
// ============================================================================
// Loads the selected topic information and wires the topic action buttons.

function initTopicPage() {
    const topicTitle = document.getElementById("topicTitle");

    if (!topicTitle) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const topicSlug = params.get("topic");
    const topic = topics.find((item) => item.slug === topicSlug);

    const topicSummary = document.getElementById("topicSummary");
    const topicSections = document.getElementById("topicSections");
    const topicPassRate = document.getElementById("topicPassRate");
    const topicFiveRate = document.getElementById("topicFiveRate");

    if (topic) {
        topicTitle.textContent = topic.title;
        if (topicSummary) topicSummary.textContent = topic.summary;

        const stats = getTopicStats(topic.slug);
        if (topicSections) topicSections.textContent = stats.sections;
        if (topicPassRate) topicPassRate.textContent = stats.passRate;
        if (topicFiveRate) topicFiveRate.textContent = stats.fiveRate;
        document.title = `${topic.title} | Study AI Helper`;
    } else {
        topicTitle.textContent = "Topic not found";
        if (topicSummary) {
            topicSummary.textContent = "The topic you selected does not exist yet.";
        }
        document.title = "Topic Not Found | Study AI Helper";
    }

    document.querySelectorAll(".topic-action-btn").forEach((button) => {
        button.addEventListener("click", function () {
            const method = this.getAttribute("data-method");

            if (method === "View Topics") {
                window.location.href = "index.html";
                return;
            }

            alert(`You selected: ${method}\n\nThis feature is coming soon! For now, this is a placeholder.`);
        });
    });
}

// ============================================================================
// EVENT WIRING
// ============================================================================
// Sets up page-specific behavior after the DOM finishes loading.

// document.addEventListener("DOMContentLoaded", function () {
//     initSearch();
//     initTopicPage();

//     if (document.body.classList.contains("page-home")) {
//         updateTopbarCounters({
//             activeUsers: 42,
//             totalUsers: 1284,
//             peakUsers: 96,
//         });
//     }
// });


const TRACKER_BASE = (() => {
  const origin = window.location.origin;
  if (origin === "null") return "http://127.0.0.1:5000";
  if (
    origin.startsWith("http://127.0.0.1:5000") ||
    origin.startsWith("http://localhost:5000")
  ) {
    return origin;
  }
  return "http://127.0.0.1:5000";
})();

function trackerUrl(path) {
    return `${TRACKER_BASE}${path}`;
}

const VISITOR_STORAGE_KEY = "studyAiVisitorId";

function getOrCreateVisitorId() {
    try {
        const storedId = window.localStorage.getItem(VISITOR_STORAGE_KEY);
        if (storedId) {
            return storedId;
        }

        const newId = crypto.randomUUID();
        window.localStorage.setItem(VISITOR_STORAGE_KEY, newId);
        return newId;
    } catch (error) {
        return crypto.randomUUID();
    }
}

const userId = getOrCreateVisitorId();

function recordVisit() {
    fetch(trackerUrl(`/visit/${userId}`));
}

// send initial ping
fetch(trackerUrl(`/ping/${userId}`));

// keep sending ping every 5 seconds
setInterval(() => {
    fetch(trackerUrl(`/ping/${userId}`));
}, 5000);

// function to update stats on page
async function updateStats() {
    try {
        const res = await fetch(trackerUrl("/stats"));
        if (!res.ok) {
            return;
        }

        const data = await res.json();
        updateTopbarCounters({
            activeUsers: data.activeUsers,
            totalUsers: data.totalUsers,
            peakUsers: data.peakActiveUsers,
            visits: data.visits ?? 0,
        });
    } catch (error) {
        console.warn("Unable to fetch tracker stats:", error);
    }
}

// update stats every 2 seconds
setInterval(updateStats, 2000);
if (document.body.classList.contains("page-home")) {
    recordVisit();
}
updateStats();