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

// Project Service

(function () {

    const API_URL = "/api/project"; // <-- point this to your actual endpoint
    const MAX_CATEGORIES = 3;
    const MAX_PROJECTS_SHOWN = 10;
    const AUTOPLAY_DELAY = 3500; // ms between auto-advances

    const sliderEl  = document.getElementById("fpSlider");
    const tabsEl    = document.getElementById("fpTabs");
    const loadingEl = document.getElementById("fpLoading");
    const dotsEl    = document.getElementById("fpDots");

    let allProjects = [];
    let activeCategory = "all";
    let autoplayTimer = null;
    let resumeTimer = null;

    init();

    async function init() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Request failed: " + res.status);

            const response = await res.json();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unexpected API response shape");
            }

            allProjects = response.data;

            const categories = [];
            allProjects.forEach(p => {
                const cat = (p.category || "").trim();
                if (cat && !categories.includes(cat)) {
                    categories.push(cat);
                }
            });
            const topCategories = categories.slice(0, MAX_CATEGORIES);

            buildTabs(topCategories);
            renderCards(allProjects.slice(0, MAX_PROJECTS_SHOWN));
            bindDrag();
            bindHoverPause();
            window.addEventListener("resize", () => {
                buildDots();
                updateActiveDot();
            });

        } catch (err) {
            console.error("Failed to load projects:", err);
            loadingEl.textContent = "Unable to load projects right now.";
        }
    }

    function buildTabs(categories) {
        categories.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = "fp-tab";
            btn.dataset.category = cat;
            btn.textContent = cat;
            tabsEl.appendChild(btn);
        });

        tabsEl.addEventListener("click", (e) => {
            const btn = e.target.closest(".fp-tab");
            if (!btn) return;

            tabsEl.querySelectorAll(".fp-tab").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");

            activeCategory = btn.dataset.category;

            const filtered = activeCategory === "all"
                ? allProjects
                : allProjects.filter(p => (p.category || "").trim() === activeCategory);

            renderCards(filtered.slice(0, MAX_PROJECTS_SHOWN));
        });
    }

    function renderCards(projects) {
        stopAutoplay();
        sliderEl.innerHTML = "";

        if (!projects.length) {
            sliderEl.innerHTML = '<div class="fp-loading">No projects found.</div>';
            dotsEl.innerHTML = "";
            return;
        }

        projects.forEach(p => {
            sliderEl.appendChild(buildCard(p));
        });

        sliderEl.scrollTo({ left: 0 });

        // Wait for layout to settle before measuring card widths
        requestAnimationFrame(() => {
            buildDots();
            startAutoplay();
        });
    }

    function buildCard(p) {
        const card = document.createElement("div");
        card.className = "fp-card";
        card.dataset.category = p.category || "";

        const year = p.completion_date ? new Date(p.completion_date).getFullYear() : "";
        const img  = p.project_image || "";

        card.innerHTML = `
            <div class="fp-card-image">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(p.project_title || "")}" loading="lazy">
                <span class="fp-card-badge">${escapeHtml(p.category || "")}</span>
                <div class="fp-card-location">
                    <i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.location || "")}
                </div>
                <a href="/project/${p.id}"  aria-label="View project">
                    <i class="fa-solid fa-arrow-up-right"></i>
                </a>
            </div>
            <div class="fp-card-body">
                <h3 class="fp-card-title">${escapeHtml(p.project_title || "")}</h3>
                <p class="fp-card-desc">${escapeHtml(p.description || "")}</p>
                <div class="fp-card-footer">
                    <span class="fp-card-year">${year}</span>
                    <a href="/project/${p.id}" class="fp-card-explore">Explore <span>↗</span></a>
                </div>
            </div>
        `;

        return card;
    }


    /* =========================================================
       DOTS — one dot per "page" of visible cards
    ========================================================= */

    function getStep() {
        const card = sliderEl.querySelector(".fp-card");
        if (!card) return 0;
        const gap = parseFloat(getComputedStyle(sliderEl).gap) || 0;
        return card.offsetWidth + gap;
    }

    function getPageCount() {
        const step = getStep();
        if (!step) return 0;
        const cardsPerView = Math.max(1, Math.round(sliderEl.clientWidth / step));
        const totalCards = sliderEl.children.length;
        return Math.max(1, Math.ceil(totalCards / cardsPerView));
    }

    function buildDots() {
        dotsEl.innerHTML = "";
        const pageCount = getPageCount();

        for (let i = 0; i < pageCount; i++) {
            const dot = document.createElement("button");
            dot.className = "fp-dot";
            dot.setAttribute("aria-label", "Go to slide " + (i + 1));
            dot.addEventListener("click", () => {
                goToPage(i);
                restartAutoplayAfterInteraction();
            });
            dotsEl.appendChild(dot);
        }

        updateActiveDot();
        sliderEl.removeEventListener("scroll", updateActiveDot);
        sliderEl.addEventListener("scroll", updateActiveDot, { passive: true });
    }

    function goToPage(pageIndex) {
        const step = getStep();
        const cardsPerView = Math.max(1, Math.round(sliderEl.clientWidth / step));
        sliderEl.scrollTo({ left: pageIndex * cardsPerView * step, behavior: "smooth" });
    }

    function updateActiveDot() {
        const step = getStep();
        if (!step) return;

        const cardsPerView = Math.max(1, Math.round(sliderEl.clientWidth / step));
        const pageWidth = cardsPerView * step;
        const currentPage = Math.round(sliderEl.scrollLeft / pageWidth);

        const dots = dotsEl.querySelectorAll(".fp-dot");
        dots.forEach((d, i) => d.classList.toggle("active", i === currentPage));
    }


    /* =========================================================
       AUTOPLAY
    ========================================================= */

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(autoAdvance, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        clearInterval(autoplayTimer);
        clearTimeout(resumeTimer);
    }

    function autoAdvance() {
        const maxScroll = sliderEl.scrollWidth - sliderEl.clientWidth - 2;

        if (sliderEl.scrollLeft >= maxScroll) {
            // loop back to start
            sliderEl.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            const step = getStep();
            const cardsPerView = Math.max(1, Math.round(sliderEl.clientWidth / step));
            sliderEl.scrollBy({ left: cardsPerView * step, behavior: "smooth" });
        }
    }

    function restartAutoplayAfterInteraction() {
        stopAutoplay();
        resumeTimer = setTimeout(startAutoplay, AUTOPLAY_DELAY);
    }

    function bindHoverPause() {
        sliderEl.addEventListener("mouseenter", stopAutoplay);
        sliderEl.addEventListener("mouseleave", startAutoplay);
    }


    /* =========================================================
       DRAG TO SCROLL
    ========================================================= */

    function bindDrag() {
        let isDown = false;
        let startX = 0;
        let scrollStart = 0;

        sliderEl.addEventListener("mousedown", (e) => {
            isDown = true;
            sliderEl.classList.add("dragging");
            startX = e.pageX;
            scrollStart = sliderEl.scrollLeft;
            stopAutoplay();
        });

        window.addEventListener("mouseup", () => {
            if (!isDown) return;
            isDown = false;
            sliderEl.classList.remove("dragging");
            restartAutoplayAfterInteraction();
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const walk = e.pageX - startX;
            sliderEl.scrollLeft = scrollStart - walk;
        });

        sliderEl.addEventListener("touchstart", () => {
            sliderEl.classList.add("dragging");
            stopAutoplay();
        }, { passive: true });

        sliderEl.addEventListener("touchend", () => {
            sliderEl.classList.remove("dragging");
            updateActiveDot();
            restartAutoplayAfterInteraction();
        });
    }


    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }

})();

/// Blogs

(function () {

    const API_URL = "/api/blogs"; // <-- point this to your actual endpoint
    const MAX_BLOGS_SHOWN = 5;

    const listEl    = document.getElementById("blogList");
    const loadingEl = document.getElementById("blogLoading");

    init();

    async function init() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Request failed: " + res.status);

            const response = await res.json();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unexpected API response shape");
            }

            const blogs = response.data.slice(0, MAX_BLOGS_SHOWN);
            render(blogs);

        } catch (err) {
            console.error("Failed to load blogs:", err);
            loadingEl.textContent = "Unable to load articles right now.";
        }
    }

    function render(blogs) {
        listEl.innerHTML = "";

        if (!blogs.length) {
            listEl.innerHTML = '<div class="blog-loading">No articles found.</div>';
            return;
        }

        blogs.forEach((b, i) => {
            listEl.appendChild(buildRow(b, i + 1));
        });
    }

    function buildRow(b, index) {
        const row = document.createElement("a");
        row.className = "blog-row";
        row.href = "/blog/" + encodeURIComponent(b.slug || b.id);

        const img      = b.featured_image || "";
        const title    = b.title || "";
        const excerpt  = b.excerpt || "";
        const category = b.category || "";
        const author   = b.author || "";

        row.innerHTML = `
            <span class="blog-row-index">${String(index).padStart(2, "0")}</span>

            <div class="blog-row-thumb">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">
            </div>

            <div class="blog-row-content">
                <div class="blog-row-meta">
                    ${category ? `<span>${escapeHtml(category)}</span>` : ""}
                    ${category && author ? `<span class="dot"></span>` : ""}
                    ${author ? `<span class="author">${escapeHtml(author)}</span>` : ""}
                </div>
                <h3 class="blog-row-title">${escapeHtml(title)}</h3>
                <p class="blog-row-excerpt">${escapeHtml(excerpt)}</p>
            </div>

            <span class="blog-row-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
            </span>
        `;

        return row;
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }

})();