"use strict";


// =====================================================
// API
// =====================================================

const DASHBOARD_API =
    "/api/dashboard";


// =====================================================
// LOAD DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        const response =
            await fetch(DASHBOARD_API);


        const result =
            await response.json();


        console.log(
            "DASHBOARD RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load dashboard"
            );
        }


        // -------------------------------------------------
        // UPDATE STATISTICS
        // -------------------------------------------------

        updateStats(
            result.data.stats
        );


        // -------------------------------------------------
        // UPDATE ACTIVITIES
        // -------------------------------------------------

        renderActivities(
            result.data.activities
        );


    } catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );

    }
}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStats(stats) {

    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );


    if (!statCards.length) {

        return;
    }


    // -------------------------------------------------
    // PROJECTS
    // -------------------------------------------------

    if (statCards[0]) {

        const value =
            statCards[0].querySelector("h2");

        if (value) {

            value.textContent =
                stats.projects + "+";

        }
    }


    // -------------------------------------------------
    // SERVICES
    // -------------------------------------------------

    if (statCards[1]) {

        const value =
            statCards[1].querySelector("h2");

        if (value) {

            value.textContent =
                stats.services;

        }
    }


    // -------------------------------------------------
    // BLOGS
    // -------------------------------------------------

    if (statCards[2]) {

        const value =
            statCards[2].querySelector("h2");

        if (value) {

            value.textContent =
                stats.blogs;

        }
    }


    // -------------------------------------------------
    // TEAM MEMBERS
    // -------------------------------------------------

    if (statCards[3]) {

        const value =
            statCards[3].querySelector("h2");

        if (value) {

            value.textContent =
                stats.teams;

        }
    }
}


// =====================================================
// RENDER RECENT ACTIVITIES
// =====================================================

function renderActivities(
    activities
) {

    const card =
        document.querySelector(
            ".dashboard-grid .card:first-child"
        );


    if (!card) {

        return;
    }


    const body =
        card.querySelector(
            ".card-body"
        );


    if (!body) {

        return;
    }


    // -------------------------------------------------
    // NO ACTIVITIES
    // -------------------------------------------------

    if (
        !Array.isArray(activities) ||
        activities.length === 0
    ) {

        body.innerHTML = `

            <div class="activity">

                <div class="activity-icon">
                    ℹ️
                </div>

                <div class="activity-text">

                    <strong>
                        No recent activities
                    </strong>

                    <p>
                        No content has been added yet.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    // -------------------------------------------------
    // ACTIVITIES
    // -------------------------------------------------

    body.innerHTML =
        activities
            .map(activity => {

                const icon =
                    getActivityIcon(
                        activity.activity_type
                    );


                const activityName =
                    getActivityName(
                        activity.activity_type
                    );


                return `

                    <div class="activity">

                        <div class="activity-icon">
                            ${icon}
                        </div>


                        <div class="activity-text">

                            <strong>
                                ${escapeHTML(
                                    activityName
                                )}
                            </strong>


                            <p>
                                ${escapeHTML(
                                    activity.title
                                )}
                            </p>


                            <span
                                class="activity-time">

                                ${formatActivityDate(
                                    activity.activity_date
                                )}

                            </span>

                        </div>

                    </div>

                `;

            })
            .join("");
}


// =====================================================
// ACTIVITY ICON
// =====================================================

function getActivityIcon(
    type
) {

    switch (type) {

        case "project":
            return "🏗️";

        case "service":
            return "⚙️";

        case "blog":
            return "📰";

        case "team":
            return "♙";

        default:
            return "📌";
    }
}


// =====================================================
// ACTIVITY NAME
// =====================================================

function getActivityName(
    type
) {

    switch (type) {

        case "project":
            return "Project updated";

        case "service":
            return "Service updated";

        case "blog":
            return "Blog article updated";

        case "team":
            return "Team member updated";

        default:
            return "Content updated";
    }
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatActivityDate(
    date
) {

    if (!date) {

        return "-";
    }


    const d =
        new Date(date);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return "-";
    }


    return d.toLocaleString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// REFRESH
// =====================================================

async function refresh() {

    await loadDashboard();

    showToast(
        "Dashboard refreshed."
    );
}


// =====================================================
// TOAST
// =====================================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toast-message"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );
}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);