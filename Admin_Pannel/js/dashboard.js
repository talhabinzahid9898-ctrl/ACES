/* =========================================================
   ACES ADMIN DASHBOARD
   ========================================================= */

const API_URL = "/api/dashboard";

/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadDashboard();

    setupSidebar();

    setupModal();

});


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });


        /* ---------------------------------------------
           CHECK HTTP RESPONSE
        --------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                "Dashboard API returned HTTP " + response.status
            );

        }


        /* ---------------------------------------------
           CONVERT RESPONSE TO JSON
        --------------------------------------------- */

        const result = await response.json();


        console.log("DASHBOARD RESPONSE:", result);


        /* ---------------------------------------------
           CHECK API SUCCESS
        --------------------------------------------- */

        if (!result.success) {

            throw new Error(
                result.message || "Failed to load dashboard data."
            );

        }


        /* ---------------------------------------------
           GET DASHBOARD DATA
        --------------------------------------------- */

        const dashboardData = result.data || {};

        const stats = dashboardData.stats || {};

        const activities = dashboardData.activities || [];


        /* ---------------------------------------------
           UPDATE STATISTICS
        --------------------------------------------- */

        updateStatistics(stats);


        /* ---------------------------------------------
           UPDATE RECENT ACTIVITIES
        --------------------------------------------- */

        renderActivities(activities);


    } catch (error) {

        console.error("DASHBOARD LOAD ERROR:", error);


        /* ---------------------------------------------
           SHOW ERROR IN ACTIVITIES SECTION
        --------------------------------------------- */

        const activityContainer =
            document.getElementById("recent-activities");


        if (activityContainer) {

            activityContainer.innerHTML = `
                <div class="activity">

                    <div class="activity-icon">
                        ⚠
                    </div>

                    <div class="activity-text">

                        <strong>
                            Failed to load dashboard
                        </strong>

                        <p>
                            ${escapeHtml(error.message)}
                        </p>

                    </div>

                </div>
            `;

        }


        /* ---------------------------------------------
           SHOW TOAST IF AVAILABLE
        --------------------------------------------- */

        if (typeof toast === "function") {

            toast("Unable to load dashboard data.");

        }

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics(stats) {

    /*
       Your HTML currently has:

       1. Total Projects
       2. Services
       3. News Articles
       4. Team Members

       We select the stat-card elements in the same order.
    */


    const statCards =
        document.querySelectorAll(".stat-card");


    if (!statCards || statCards.length < 4) {

        console.warn(
            "Dashboard stat cards were not found."
        );

        return;

    }


    /* ---------------------------------------------
       TOTAL PROJECTS
    --------------------------------------------- */

    const totalProjects =
        Number(stats.totalProjects || 0);


    statCards[0]
        .querySelector("h2")
        .textContent = totalProjects;


    /* ---------------------------------------------
       ACTIVE SERVICES
    --------------------------------------------- */

    const activeServices =
        Number(stats.activeServices || 0);


    statCards[1]
        .querySelector("h2")
        .textContent = activeServices;


    /* ---------------------------------------------
       PUBLISHED BLOGS
    --------------------------------------------- */

    const publishedBlogs =
        Number(stats.publishedBlogs || 0);


    statCards[2]
        .querySelector("h2")
        .textContent = publishedBlogs;


    /* ---------------------------------------------
       ACTIVE TEAM MEMBERS
    --------------------------------------------- */

    const activeTeamMembers =
        Number(stats.activeTeamMembers || 0);


    statCards[3]
        .querySelector("h2")
        .textContent = activeTeamMembers;

}


/* =========================================================
   RENDER RECENT ACTIVITIES
========================================================= */

function renderActivities(activities) {

    const container =
        document.getElementById("recent-activities");


    if (!container) {

        console.warn(
            "#recent-activities was not found."
        );

        return;

    }


    /* ---------------------------------------------
       NO ACTIVITIES
    --------------------------------------------- */

    if (!Array.isArray(activities) || activities.length === 0) {

        container.innerHTML = `
            <div class="activity">

                <div class="activity-icon">
                    ✓
                </div>

                <div class="activity-text">

                    <strong>
                        No recent activities
                    </strong>

                    <p>
                        There are no recent changes yet.
                    </p>

                </div>

            </div>
        `;

        return;

    }


    /* ---------------------------------------------
       CREATE ACTIVITIES
    --------------------------------------------- */

    container.innerHTML = activities
        .map(function (activity) {

            return createActivityHTML(activity);

        })
        .join("");

}


/* =========================================================
   CREATE SINGLE ACTIVITY HTML
========================================================= */

function createActivityHTML(activity) {

    const type =
        activity.activity_type || "Activity";


    const title =
        activity.activity_title || "Untitled";


    const date =
        activity.activity_date;


    const formattedDate =
        formatActivityDate(date);


    const icon =
        getActivityIcon(type);


    return `
        <div class="activity">

            <div class="activity-icon">
                ${icon}
            </div>

            <div class="activity-text">

                <strong>
                    ${escapeHtml(type)}:
                    ${escapeHtml(title)}
                </strong>

                <p>
                    ${escapeHtml(formattedDate)}
                </p>

            </div>

        </div>
    `;

}


/* =========================================================
   ACTIVITY ICON
========================================================= */

function getActivityIcon(type) {

    const normalizedType =
        String(type).toLowerCase();


    switch (normalizedType) {

        case "project":
            return "▦";

        case "service":
            return "⚙";

        case "blog":
            return "▤";

        case "team":
        case "team member":
            return "♙";

        default:
            return "●";

    }

}


/* =========================================================
   FORMAT ACTIVITY DATE
========================================================= */

function formatActivityDate(dateValue) {

    if (!dateValue) {

        return "Date unavailable";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "Date unavailable";

    }


    return date.toLocaleString("en-PK", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

        hour12: true

    });

}


/* =========================================================
   REFRESH DASHBOARD
========================================================= */

async function refresh() {

    const button =
        document.querySelector(
            ".page-header .btn-secondary"
        );


    if (button) {

        const originalText =
            button.innerHTML;


        button.disabled = true;

        button.innerHTML = "↻ Loading...";


        try {

            await loadDashboard();

        } finally {

            button.disabled = false;

            button.innerHTML = originalText;

        }

    } else {

        await loadDashboard();

    }

}


/* =========================================================
   SIDEBAR / MOBILE MENU
========================================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById("sidebar");


    const overlay =
        document.getElementById("sidebar-overlay");


    const menuToggle =
        document.getElementById("menu-toggle");


    const mobileClose =
        document.getElementById("mobile-close");


    /* ---------------------------------------------
       OPEN SIDEBAR
    --------------------------------------------- */

    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function () {

                if (sidebar) {

                    sidebar.classList.add("open");

                }


                if (overlay) {

                    overlay.classList.add("show");

                }

            }
        );

    }


    /* ---------------------------------------------
       CLOSE SIDEBAR
    --------------------------------------------- */

    if (mobileClose) {

        mobileClose.addEventListener(
            "click",
            closeSidebar
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    function closeSidebar() {

        if (sidebar) {

            sidebar.classList.remove("open");

        }


        if (overlay) {

            overlay.classList.remove("show");

        }

    }

}


/* =========================================================
   MODAL SETUP
========================================================= */

function setupModal() {

    const modalBackdrop =
        document.getElementById("modal-backdrop");


    const modalClose =
        document.getElementById("modal-close");


    const modalCancel =
        document.getElementById("modal-cancel");


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalCancel) {

        modalCancel.addEventListener(
            "click",
            closeModal
        );

    }


    if (modalBackdrop) {

        modalBackdrop.addEventListener(
            "click",
            function (event) {

                if (event.target === modalBackdrop) {

                    closeModal();

                }

            }
        );

    }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    const modalBackdrop =
        document.getElementById("modal-backdrop");


    if (modalBackdrop) {

        modalBackdrop.classList.remove("show");

    }

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openModal(title, eyebrow, body) {

    const modalBackdrop =
        document.getElementById("modal-backdrop");


    const modalTitle =
        document.getElementById("modal-title");


    const modalEyebrow =
        document.getElementById("modal-eyebrow");


    const modalBody =
        document.getElementById("modal-body");


    if (modalTitle) {

        modalTitle.textContent =
            title || "";

    }


    if (modalEyebrow) {

        modalEyebrow.textContent =
            eyebrow || "";

    }


    if (modalBody) {

        modalBody.innerHTML =
            body || "";

    }


    if (modalBackdrop) {

        modalBackdrop.classList.add("show");

    }

}


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

    const toastElement =
        document.getElementById("toast");


    const toastMessage =
        document.getElementById("toast-message");


    if (!toastElement) {

        console.log(message);

        return;

    }


    if (toastMessage) {

        toastMessage.textContent =
            message;

    }


    toastElement.classList.add("show");


    clearTimeout(
        window.dashboardToastTimer
    );


    window.dashboardToastTimer =
        setTimeout(function () {

            toastElement.classList.remove("show");

        }, 3000);

}


/* =========================================================
   HTML ESCAPE
   Prevents API data from being interpreted as HTML.
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   OPTIONAL: MAKE FUNCTIONS AVAILABLE GLOBALLY
========================================================= */

window.loadDashboard = loadDashboard;

window.refresh = refresh;

window.toast = toast;

window.openModal = openModal;

window.closeModal = closeModal;