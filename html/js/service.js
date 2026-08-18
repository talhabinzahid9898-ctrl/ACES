// ============================================================
// ACES WEBSITE - SERVICES
// Fetch services from existing backend
// Only Published services are displayed
// ============================================================

const SERVICES_API_URL = "/api/services";


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadWebsiteServices() {

    const container =
        document.getElementById("services-grid");


    if (!container) {

        console.error(
            "ERROR: #services-grid was not found."
        );

        return;

    }


    try {

        container.innerHTML = `
            <div class="services-loading">
                Loading services...
            </div>
        `;


        // ====================================================
        // FETCH FROM BACKEND
        // ====================================================

        const response =
            await fetch(
                SERVICES_API_URL,
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "SERVICES API RESPONSE:",
            result
        );


        // ====================================================
        // CHECK RESPONSE
        // ====================================================

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load services."
            );

        }


        // ====================================================
        // GET ALL SERVICES
        // ====================================================

        const allServices =
            Array.isArray(result.data)
                ? result.data
                : [];


        // ====================================================
        // ONLY PUBLISHED SERVICES
        // ====================================================

        const publishedServices =
            allServices.filter(
                service =>
                    String(
                        service.status || ""
                    )
                    .trim()
                    .toLowerCase()
                    === "published"
            );


        console.log(
            "ALL SERVICES:",
            allServices
        );


        console.log(
            "PUBLISHED SERVICES:",
            publishedServices
        );


        // ====================================================
        // NO PUBLISHED SERVICES
        // ====================================================

        if (
            publishedServices.length === 0
        ) {

            container.innerHTML = `
                <div class="services-empty">
                    No services available.
                </div>
            `;

            return;

        }


        // ====================================================
        // CREATE CARDS
        // ====================================================

        container.innerHTML =
            publishedServices
                .map(
                    (service, index) =>
                        createServiceCard(
                            service,
                            index
                        )
                )
                .join("");


    }
    catch (error) {

        console.error(
            "SERVICES ERROR:",
            error
        );


        container.innerHTML = `
            <div class="services-error">
                Unable to load services.
            </div>
        `;

    }

}



// ============================================================
// CREATE SERVICE CARD
// ============================================================

function createServiceCard(
    service,
    index
) {

    // DATABASE ID

    const id =
        service.id;


    // DATABASE TITLE

    const title =
        escapeHTML(
            service.title ||
            "Service"
        );


    // DATABASE CATEGORY

    const category =
        escapeHTML(
            service.category ||
            ""
        );


    // DATABASE DESCRIPTION

    const description =
        escapeHTML(
            service.description ||
            "No description available."
        );


    // NUMBER

    const number =
        String(index + 1)
            .padStart(2, "0");


    return `

        <article
            class="service-card"
            data-service-id="${id}"
        >

            <!-- NUMBER -->

            <div class="service-number">

                ${number}

            </div>


            <!-- CATEGORY -->

            ${
                category
                    ? `
                        <div class="service-category">

                            ${category}

                        </div>
                    `
                    : ""
            }


            <!-- TITLE -->

            <h3 class="service-title">

                ${title}

            </h3>


            <!-- DESCRIPTION -->

            <p
                class="service-description"
                data-service-description
            >

                ${description}

            </p>


            <!-- READ MORE -->

            <button
                type="button"
                class="service-read-more"
                data-read-more
                aria-expanded="false"
            >

                <span class="read-more-text">
                    Read More
                </span>

                <span class="arrow">
                    ↓
                </span>

            </button>


        </article>

    `;

}



// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")

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



// ============================================================
// INITIAL LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    loadWebsiteServices
);