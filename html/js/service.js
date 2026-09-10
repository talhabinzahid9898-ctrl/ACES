// Services Section
document.addEventListener("DOMContentLoaded", () => {

    const servicesGrid =
        document.getElementById("services-grid");

    if (!servicesGrid) {
        return;
    }


    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const API_URL = "/api/services";

    /*
       Public service page.
       Change only this filename if your page has
       another name.
    */
    const SERVICE_PAGE = "services.html";


    /*
       Maximum number of services shown PER CATEGORY
       on the home page.
    */
    const HOME_SERVICE_LIMIT = 12;


    /* =====================================================
       PAGE DETECTION
    ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const isServicePage =
        currentPage === SERVICE_PAGE.toLowerCase();


    /* =====================================================
       DATA
    ===================================================== */

    let servicesData = [];

    let categories = [];

    let selectedCategory = "all";


    /* =====================================================
       LOAD SERVICES FROM BACKEND
    ===================================================== */

    async function loadServices() {

        try {

            servicesGrid.innerHTML = `
                <div class="services-loading">
                    Loading services...
                </div>
            `;


            const response =
                await fetch(API_URL);


            if (!response.ok) {

                throw new Error(
                    `HTTP Error ${response.status}`
                );

            }


            const result =
                await response.json();


            /*
               Supports these backend response formats:

               1.
               [
                   {...},
                   {...}
               ]

               2.
               {
                   services: [...]
               }

               3.
               {
                   data: [...]
               }

               4.
               {
                   rows: [...]
               }
            */

            if (Array.isArray(result)) {

                servicesData = result;

            }

            else if (
                Array.isArray(result.services)
            ) {

                servicesData =
                    result.services;

            }

            else if (
                Array.isArray(result.data)
            ) {

                servicesData =
                    result.data;

            }

            else if (
                Array.isArray(result.rows)
            ) {

                servicesData =
                    result.rows;

            }

            else {

                servicesData = [];

            }


            /*
               Make sure only valid objects
               are processed.
            */

            servicesData =
                servicesData.filter(
                    service =>
                        service &&
                        typeof service === "object"
                );


            /* =================================================
               GET CATEGORIES
            ================================================= */

            categories =
                getUniqueCategories(
                    servicesData
                );


            /*
               On the service page all categories
               are available.

               On the home page only the first 3
               categories are displayed.
            */

            createCategoryNavigation();


            /*
               Render initial cards.
            */

            renderServices();


        }

        catch (error) {

            console.error(
                "Services API Error:",
                error
            );


            servicesGrid.innerHTML = `
                <div class="services-error">
                    Unable to load services at the moment.
                </div>
            `;

        }

    }


    /* =====================================================
       GET SERVICE CATEGORY
    ===================================================== */

    function getServiceCategory(service) {

        return (
            service.category ||
            service.service_category ||
            service.serviceCategory ||
            service.category_name ||
            service.categoryName ||
            service.type ||
            "Other"
        )
        .toString()
        .trim();

    }


    /* =====================================================
       GET SERVICE TITLE
    ===================================================== */

    function getServiceTitle(service) {

        return (
            service.title ||
            service.name ||
            service.service_name ||
            service.serviceName ||
            "Untitled Service"
        )
        .toString()
        .trim();

    }


    /* =====================================================
       GET SERVICE DESCRIPTION
    ===================================================== */

    function getServiceDescription(service) {

        return (
            service.description ||
            service.details ||
            service.content ||
            service.short_description ||
            service.shortDescription ||
            ""
        )
        .toString()
        .trim();

    }


    /* =====================================================
       GET SERVICE ID
    ===================================================== */

    function getServiceId(service, index) {

        return (
            service.id ||
            service.service_id ||
            service.serviceId ||
            index + 1
        );

    }


    /* =====================================================
       GET SERVICE ICON
    ===================================================== */

    function getServiceIcon(service) {

        return (
            service.icon ||
            service.icon_class ||
            service.iconClass ||
            ""
        )
        .toString()
        .trim();

    }


    /* =====================================================
       GET UNIQUE CATEGORIES
    ===================================================== */

    function getUniqueCategories(data) {

        const categoryMap =
            new Map();


        data.forEach(service => {

            const category =
                getServiceCategory(
                    service
                );


            if (!category) {
                return;
            }


            const normalized =
                category.toLowerCase();


            /*
               Prevent duplicate categories.
            */

            if (
                !categoryMap.has(
                    normalized
                )
            ) {

                categoryMap.set(
                    normalized,
                    category
                );

            }

        });


        return Array.from(
            categoryMap.values()
        );

    }


    /* =====================================================
       CREATE CATEGORY NAVIGATION
    ===================================================== */

    function createCategoryNavigation() {

        /*
           Remove previously generated
           category navigation.
        */

        const oldNavigation =
            document.querySelector(
                ".services-category-wrapper"
            );


        if (oldNavigation) {

            oldNavigation.remove();

        }


        /*
           If no services exist,
           don't create navigation.
        */

        if (servicesData.length === 0) {

            return;

        }


        /* =================================================
           WRAPPER
        ================================================= */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "services-category-wrapper";


        /* =================================================
           NAVIGATION
        ================================================= */

        const navigation =
            document.createElement(
                "div"
            );


        navigation.className =
            "services-category-nav";


        /* =================================================
           ALL SERVICES BUTTON
        ================================================= */

        const allButton =
            document.createElement(
                "button"
            );


        allButton.type =
            "button";


        allButton.className =
            "services-category-btn active";


        allButton.textContent =
            "ALL SERVICES";


        navigation.appendChild(
            allButton
        );


        /* =================================================
           HOME PAGE = FIRST 3 CATEGORIES
           SERVICE PAGE = ALL CATEGORIES
        ================================================= */

        const visibleCategories =
            isServicePage
                ? categories
                : categories.slice(0, 5);


        /* =================================================
           CATEGORY BUTTONS
        ================================================= */

        visibleCategories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "services-category-btn";


                button.textContent =
                    category;


                button.addEventListener(
                    "click",
                    () => {

                        selectedCategory =
                            category;


                        /*
                           Remove active state
                           from every button.
                        */

                        navigation
                            .querySelectorAll(
                                ".services-category-btn"
                            )
                            .forEach(
                                btn => {

                                    btn.classList
                                        .remove(
                                            "active"
                                        );

                                }
                            );


                        /*
                           Activate clicked
                           category.
                        */

                        button.classList.add(
                            "active"
                        );


                        /*
                           Render selected
                           category.
                        */

                        renderServices();

                    }
                );


                navigation.appendChild(
                    button
                );

            }
        );


        /* =================================================
           ALL SERVICES BUTTON ACTION
        ================================================= */

        allButton.addEventListener(
            "click",
            () => {

                selectedCategory =
                    "all";


                navigation
                    .querySelectorAll(
                        ".services-category-btn"
                    )
                    .forEach(
                        btn => {

                            btn.classList
                                .remove(
                                    "active"
                                );

                        }
                    );


                allButton.classList.add(
                    "active"
                );


                renderServices();

            }
        );


        /* =================================================
           VIEW ALL SERVICES
        ================================================= */

        const viewAll =
            document.createElement(
                "a"
            );


        viewAll.className =
            "services-view-all";


        viewAll.href =
            SERVICE_PAGE;


        viewAll.textContent =
            "VIEW ALL SERVICES";


        /* =================================================
           ADD TO WRAPPER
        ================================================= */

        wrapper.appendChild(
            navigation
        );


        wrapper.appendChild(
            viewAll
        );


        /* =================================================
           INSERT BEFORE GRID
        ================================================= */

        servicesGrid.parentNode.insertBefore(
            wrapper,
            servicesGrid
        );

    }


    /* =====================================================
       RENDER SERVICES
    ===================================================== */

    function renderServices() {

        let filteredServices;


        /* =================================================
           FILTER BY CATEGORY
        ================================================= */

        if (
            selectedCategory === "all"
        ) {

            filteredServices =
                [...servicesData];

        }

        else {

            filteredServices =
                servicesData.filter(
                    service => {

                        return (
                            getServiceCategory(
                                service
                            )
                            .toLowerCase() ===
                            selectedCategory
                                .toLowerCase()
                        );

                    }
                );

        }


        /* =================================================
           HOME PAGE LIMIT
           
           Maximum 12 services PER SELECTED CATEGORY.
        ================================================= */

        if (!isServicePage) {

            filteredServices =
                filteredServices.slice(
                    0,
                    HOME_SERVICE_LIMIT
                );

        }


        /* =================================================
           EMPTY STATE
        ================================================= */

        if (
            filteredServices.length === 0
        ) {

            servicesGrid.innerHTML = `
                <div class="services-empty">
                    No services available in this category.
                </div>
            `;

            return;

        }


        /* =================================================
           CREATE CARDS
        ================================================= */

        servicesGrid.innerHTML =
            filteredServices
                .map(
                    (service, index) => {

                        return createServiceCard(
                            service,
                            index
                        );

                    }
                )
                .join("");


        /* =================================================
           READ MORE
        ================================================= */

        initializeReadMore();

    }


    /* =====================================================
       CREATE SERVICE CARD
    ===================================================== */

    function createServiceCard(
        service,
        index
    ) {

        const category =
            escapeHTML(
                getServiceCategory(
                    service
                )
            );


        const title =
            escapeHTML(
                getServiceTitle(
                    service
                )
            );


        const description =
            escapeHTML(
                getServiceDescription(
                    service
                )
            );


        const serviceId =
            getServiceId(
                service,
                index
            );


        const encodedId =
            encodeURIComponent(
                serviceId
            );


        const icon =
            getServiceIcon(
                service
            );


        const number =
            String(
                index + 1
            ).padStart(
                2,
                "0"
            );


        return `
            <article
                class="service-card"
                data-service-id="${encodedId}"
            >

                <span
                    class="service-card-number service-number"
                >
                    ${number}
                </span>


                ${
                    icon
                        ? `
                            <div class="service-icon">
                                <i class="${escapeHTML(icon)}"></i>
                            </div>
                          `
                        : ""
                }


                <h3>
                    ${title}
                </h3>


                <span
                    class="service-category service-subtitle"
                >
                    ${category}
                </span>


                ${
                    description
                        ? `
                            <p
                                class="service-description"
                            >
                                ${description}
                            </p>
                          `
                        : ""
                }


                <button
                    type="button"
                    class="service-read-more"
                    data-read-more
                >
                    <span class="read-more-text">
                        READ MORE
                    </span>

                    <span class="arrow">
                        ↓
                    </span>
                </button>

            </article>
        `;

    }


    /* =====================================================
       READ MORE FUNCTIONALITY
    ===================================================== */

    function initializeReadMore() {

        const buttons =
            servicesGrid.querySelectorAll(
                "[data-read-more]"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const card =
                            button.closest(
                                ".service-card"
                            );


                        if (!card) {
                            return;
                        }


                        const description =
                            card.querySelector(
                                ".service-description"
                            );


                        if (!description) {
                            return;
                        }


                        const text =
                            button.querySelector(
                                ".read-more-text"
                            );


                        const arrow =
                            button.querySelector(
                                ".arrow"
                            );


                        const expanded =
                            description.classList
                                .contains(
                                    "expanded"
                                );


                        if (expanded) {

                            description.classList
                                .remove(
                                    "expanded"
                                );


                            button.classList
                                .remove(
                                    "active"
                                );


                            if (text) {

                                text.textContent =
                                    "READ MORE";

                            }


                            if (arrow) {

                                arrow.textContent =
                                    "↓";

                            }

                        }

                        else {

                            description.classList
                                .add(
                                    "expanded"
                                );


                            button.classList
                                .add(
                                    "active"
                                );


                            if (text) {

                                text.textContent =
                                    "READ LESS";

                            }


                            if (arrow) {

                                arrow.textContent =
                                    "↑";

                            }

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
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


    /* =====================================================
       START
    ===================================================== */

    loadServices();

});

// Projects Section
(function () {

    const PROJECTS_API   = "/api/project";   // ?limit=10
    const MAX_PROJECTS   = 10;
    const MAX_CATEGORIES = 5;                 // including "All"

    const tabsEl   = document.getElementById("fpTabs");
    const sliderEl = document.getElementById("fpSlider");
    const dotsEl   = document.getElementById("fpDots");

    let allProjects = [];
    let activeCategory = "all";

    init();

    async function init() {
        try {
            const res = await fetch(`${PROJECTS_API}?limit=${MAX_PROJECTS}`);
            const projRes = await res.json();

            if (!projRes.success || !Array.isArray(projRes.data)) {
                throw new Error("Unexpected projects response");
            }

            allProjects = projRes.data.slice(0, MAX_PROJECTS);

            const categories = deriveCategories(allProjects);
            renderTabs(categories.slice(0, MAX_CATEGORIES - 1));
            renderSlider(allProjects);

        } catch (err) {
            console.error("Failed to load featured projects:", err);
            sliderEl.innerHTML = `<div class="fp-error">Unable to load projects right now.</div>`;
        }
    }

    function deriveCategories(projects) {
        const seen = [];
        projects.forEach(p => {
            if (p.category && !seen.includes(p.category)) seen.push(p.category);
        });
        return seen;
    }

    function renderTabs(categories) {
        const tabs = [{ label: "All Disciplines", value: "all" }]
            .concat(categories.map(c => ({ label: c, value: c })));

        tabsEl.innerHTML = tabs.map((t, i) => `
            <button type="button" class="fp-tab ${i === 0 ? "active" : ""}" data-cat="${escapeAttr(t.value)}">
                ${escapeHtml(t.label)}
            </button>
        `).join("");

        tabsEl.querySelectorAll(".fp-tab").forEach(btn => {
            btn.addEventListener("click", () => {
                tabsEl.querySelectorAll(".fp-tab").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeCategory = btn.dataset.cat;
                filterAndRender();
            });
        });
    }

    function filterAndRender() {
        const filtered = activeCategory === "all"
            ? allProjects
            : allProjects.filter(p => p.category === activeCategory);
        renderSlider(filtered);
    }

    function renderSlider(projects) {
        sliderEl.innerHTML = "";

        if (!projects.length) {
            sliderEl.innerHTML = `<div class="fp-empty">No projects found in this category.</div>`;
            dotsEl.innerHTML = "";
            return;
        }

        projects.forEach(p => sliderEl.appendChild(buildCard(p)));
        buildDots(projects.length);
    }

    function buildCard(p) {
    const card = document.createElement("a");
    card.className = "fp-project-card";
    card.href = `/projects-grid.html`;

    const title = p["project-title"] || p.project_title || "";
    const year = p.completion_date ? new Date(p.completion_date).getFullYear() : "";

    card.innerHTML = `
        <div class="fp-project-image-wrap">
            ${p.project_image
                ? `<img class="fp-project-image" src="${escapeAttr(p.project_image)}" alt="${escapeAttr(title)}" loading="lazy">`
                : `<div class="fp-project-image-placeholder">${escapeHtml((p.category || "P").charAt(0))}</div>`}
            ${p.category ? `<span class="fp-project-category">${escapeHtml(p.category)}</span>` : ""}
        </div>
        <div class="fp-project-content">
            ${p.location ? `<div class="fp-project-location">📍 ${escapeHtml(p.location)}</div>` : ""}
            <h3 class="fp-project-title">${escapeHtml(title)}</h3>
            <p class="fp-project-description">${escapeHtml(p.description || "")}</p>
            ${year ? `<div class="fp-project-footer"><span class="fp-project-year">Year: ${year}</span></div>` : ""}
        </div>
    `;
    return card;
}

    function buildDots(count) {
        const dotCount = Math.min(count, 5);
        dotsEl.innerHTML = Array.from({ length: dotCount }).map((_, i) =>
            `<button type="button" class="fp-dot ${i === 0 ? "active" : ""}" data-index="${i}"></button>`
        ).join("");

        dotsEl.querySelectorAll(".fp-dot").forEach(dot => {
            dot.addEventListener("click", () => {
                dotsEl.querySelectorAll(".fp-dot").forEach(d => d.classList.remove("active"));
                dot.classList.add("active");
                const card = sliderEl.children[dot.dataset.index];
                if (card) card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            });
        });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return (str ?? "").replace(/"/g, "&quot;");
    }

})();
// Project Detail Section
(function () {

    const PROJECTS_API = "/api/project";
    const PROJECT_DETAIL_API = (id) => `/api/project/${encodeURIComponent(id)}`;

    const PER_PAGE = 16;
    const FETCH_LIMIT = 500; // fetch a large batch once; adjust to your total project count

    const tabsEl       = document.getElementById("pgTabs");
    const gridEl       = document.getElementById("pgGrid");
    const paginationEl = document.getElementById("pgPagination");
    const searchInput  = document.getElementById("pgSearchInput");

    const overlay   = document.getElementById("pjModalOverlay");
    const modalBody = document.getElementById("pjModalBody");
    const closeBtn  = document.getElementById("pjModalClose");

    if (!tabsEl || !gridEl) return; // safety guard if this script loads on the wrong page

    let allProjects = [];   // full dataset fetched once
    let filtered = [];      // after category + search filter applied

    let state = {
        category: "all",
        search: "",
        page: 1
    };

    let searchDebounce;

    init();

    async function init() {
        await loadAllProjects();
        buildCategoryTabs();
        applyFiltersAndRender();

        searchInput.addEventListener("input", () => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                state.search = searchInput.value.trim().toLowerCase();
                state.page = 1;
                applyFiltersAndRender();
            }, 300);
        });

        closeBtn.addEventListener("click", closeModal);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    }

    /* ================= LOAD DATA ONCE ================= */

    async function loadAllProjects() {
        gridEl.innerHTML = `<div class="pg-loading">Loading projects...</div>`;

        try {
            const res = await fetch(`${PROJECTS_API}?limit=${FETCH_LIMIT}`);
            const json = await res.json();

            if (!json.success || !Array.isArray(json.data)) {
                throw new Error("Unexpected response shape");
            }

            allProjects = json.data;

        } catch (err) {
            console.error("Failed to load projects:", err);
            gridEl.innerHTML = `<div class="pg-error">Unable to load projects right now.</div>`;
            allProjects = [];
        }
    }

    /* ================= CATEGORY TABS ================= */

    function buildCategoryTabs() {
        const cats = [...new Set(allProjects.map(p => p.category).filter(Boolean))];

        cats.forEach(cat => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "pg-tab";
            btn.dataset.cat = cat;
            btn.textContent = cat;
            tabsEl.appendChild(btn);
        });

        tabsEl.querySelectorAll(".pg-tab").forEach(btn => {
            btn.addEventListener("click", () => {
                tabsEl.querySelectorAll(".pg-tab").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                state.category = btn.dataset.cat;
                state.page = 1;
                applyFiltersAndRender();
            });
        });
    }

    /* ================= FILTER + PAGINATE (client-side) ================= */

    function applyFiltersAndRender() {
        filtered = allProjects.filter(p => {
            const matchesCategory = state.category === "all" || p.category === state.category;

            if (!matchesCategory) return false;
            if (!state.search) return true;

            const title = (p["project-title"] || p.project_title || "").toLowerCase();
            const description = (p.description || "").toLowerCase();
            const location = (p.location || "").toLowerCase();
            const client = (p.client || "").toLowerCase();

            return (
                title.includes(state.search) ||
                description.includes(state.search) ||
                location.includes(state.search) ||
                client.includes(state.search)
            );
        });

        const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
        state.page = Math.min(state.page, totalPages);

        const start = (state.page - 1) * PER_PAGE;
        const pageItems = filtered.slice(start, start + PER_PAGE);

        renderGrid(pageItems);
        renderPagination(totalPages);
    }

    function renderGrid(projects) {
        gridEl.innerHTML = "";

        if (!projects.length) {
            gridEl.innerHTML = `<div class="pg-empty">No projects found.</div>`;
            return;
        }

        projects.forEach(p => gridEl.appendChild(buildCard(p)));
    }

    function buildCard(p) {
        const card = document.createElement("div");
        card.className = "pg-card";

        const title = p["project-title"] || p.project_title || "";
        const year = p.completion_date ? new Date(p.completion_date).getFullYear() : "";

        card.innerHTML = `
            <div class="pg-card-image-wrap">
                ${p.project_image
                    ? `<img src="${escapeAttr(p.project_image)}" alt="${escapeAttr(title)}" loading="lazy">`
                    : ""}
                ${p.category ? `<span class="pg-card-badge">${escapeHtml(p.category)}</span>` : ""}
            </div>
            <div class="pg-card-body">
                ${p.location ? `<div class="pg-card-location">📍 ${escapeHtml(p.location)}</div>` : ""}
                <h3 class="pg-card-title">${escapeHtml(title)}</h3>
                <p class="pg-card-description">${escapeHtml(p.description || "")}</p>
                <div class="pg-card-footer">
                    <span class="pg-card-year">${year ? `Year: ${year}` : ""}</span>
                    <button type="button" class="pg-card-view">VIEW DETAILS ↗</button>
                </div>
            </div>
        `;

        card.querySelector(".pg-card-view").addEventListener("click", () => openModal(p.id));
        return card;
    }

    /* ================= PAGINATION ================= */

    function renderPagination(totalPages) {
        paginationEl.innerHTML = "";
        if (totalPages <= 1) return;

        paginationEl.appendChild(pageBtn("‹", state.page - 1, state.page === 1, totalPages));

        const maxButtons = 5;
        let start = Math.max(1, state.page - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        start = Math.max(1, end - maxButtons + 1);

        for (let i = start; i <= end; i++) {
            paginationEl.appendChild(pageBtn(i, i, false, totalPages, i === state.page));
        }

        paginationEl.appendChild(pageBtn("›", state.page + 1, state.page === totalPages, totalPages));
    }

    function pageBtn(label, targetPage, disabled, totalPages, isActive) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pg-page-btn" + (isActive ? " active" : "");
        btn.textContent = label;
        btn.disabled = !!disabled;
        btn.addEventListener("click", () => {
            state.page = targetPage;
            applyFiltersAndRender();
            window.scrollTo({ top: gridEl.offsetTop - 100, behavior: "smooth" });
        });
        return btn;
    }

    /* ================= MODAL ================= */

    async function openModal(id) {
        modalBody.innerHTML = `<div class="pj-modal-content">Loading...</div>`;
        overlay.classList.add("active");
        document.body.classList.add("pj-modal-open");

        try {
            const res = await fetch(PROJECT_DETAIL_API(id));
            const json = await res.json();

            if (!json.success || !json.data) throw new Error("Project not found");

            renderModal(json.data);

        } catch (err) {
            console.error("Failed to load project details:", err);
            modalBody.innerHTML = `<div class="pj-modal-content">Unable to load project details.</div>`;
        }
    }

    function extractGalleryImages(p) {
        const raw = p.gallery || p.images || p.project_gallery || p.ProjectGallery || [];
        if (!Array.isArray(raw)) return [];

        return raw
            .map(item => {
                if (typeof item === "string") return item;
                if (item && typeof item === "object") {
                    return item.image_url || item.imageUrl || item.url || null;
                }
                return null;
            })
            .filter(Boolean);
    }

    function renderModal(p) {
        const title = p["project-title"] || p.project_title || "";

        const galleryUploaded = extractGalleryImages(p);
        const mainImage = p.project_image || null;

        const combined = galleryUploaded.length
            ? [mainImage, ...galleryUploaded].filter(Boolean)
            : (mainImage ? [mainImage] : []);

        const images = [...new Set(combined)];
        const hasMultipleImages = images.length > 1;

        let mediaHtml = "";

        if (hasMultipleImages) {
            mediaHtml = `
                <div class="pj-gallery-main">
                    <img id="pjMainImage" src="${escapeAttr(images[0])}" alt="${escapeAttr(title)}">
                </div>
                <div class="pj-gallery-thumbs" id="pjThumbs">
                    ${images.map((url, i) => `
                        <div class="pj-gallery-thumb ${i === 0 ? "active" : ""}" data-src="${escapeAttr(url)}">
                            <img src="${escapeAttr(url)}" alt="">
                        </div>
                    `).join("")}
                </div>
            `;
        } else if (images.length === 1) {
            mediaHtml = `
                <div class="pj-single-image">
                    <img src="${escapeAttr(images[0])}" alt="${escapeAttr(title)}">
                </div>
            `;
        }

        modalBody.innerHTML = `
            ${mediaHtml}
            <div class="pj-modal-content">
                <div class="pj-modal-tags">
                    ${p.category ? `<span class="pj-modal-tag">${escapeHtml(p.category)}</span>` : ""}
                    ${p.status ? `<span class="pj-modal-status">${escapeHtml(p.status)}</span>` : ""}
                </div>

                <h2 id="pjModalTitle" class="pj-modal-title">${escapeHtml(title)}</h2>
                ${p.location ? `<p class="pj-modal-location">📍 ${escapeHtml(p.location)}</p>` : ""}

                ${p.description ? `<p class="pj-modal-description">${escapeHtml(p.description)}</p>` : ""}

                <div class="pj-modal-meta-grid">
                    ${p.client ? metaItem("Client", p.client) : ""}
                    ${p.completion_date ? metaItem("Completion Date", formatDate(p.completion_date)) : ""}
                    ${p.project_area ? metaItem("Project Area", p.project_area) : ""}
                    ${p.offered_service ? metaItem("Services", p.offered_service) : ""}
                    ${p.status ? metaItem("Status", p.status) : ""}
                    ${p.uploaded_at ? metaItem("Published", formatDate(p.uploaded_at)) : ""}
                </div>
            </div>
        `;

        if (hasMultipleImages) {
            const mainImg = document.getElementById("pjMainImage");
            document.querySelectorAll(".pj-gallery-thumb").forEach(thumb => {
                thumb.addEventListener("click", () => {
                    mainImg.src = thumb.dataset.src;
                    document.querySelectorAll(".pj-gallery-thumb").forEach(t => t.classList.remove("active"));
                    thumb.classList.add("active");
                });
            });
        }
    }

    function metaItem(label, value) {
        return `
            <div class="pj-meta-item">
                <span class="pj-meta-label">${escapeHtml(label)}</span>
                <span class="pj-meta-value">${escapeHtml(String(value))}</span>
            </div>
        `;
    }

    function closeModal() {
        overlay.classList.remove("active");
        document.body.classList.remove("pj-modal-open");
    }

    function formatDate(str) {
        const d = new Date(str);
        if (isNaN(d)) return escapeHtml(str);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return (str ?? "").replace(/"/g, "&quot;");
    }

})();

// Blog Complete Section
(function () {

    const API_URL = "/api/blogs";

    const listEl    = document.getElementById("blogList");
    const loadingEl = document.getElementById("blogLoading");
    if (!listEl) return;

    const limitAttr = listEl.dataset.limit;                 // "5" | "all"
    const LIMIT = (!limitAttr || limitAttr === "all") ? null : parseInt(limitAttr, 10);

    const overlay   = document.getElementById("blogModalOverlay");
    const modalBody = document.getElementById("blogModalBody");
    const closeBtn  = document.getElementById("blogModalClose");

    init();

    async function init() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Request failed: " + res.status);

            const response = await res.json();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unexpected API response shape");
            }

            const blogs = LIMIT ? response.data.slice(0, LIMIT) : response.data;
            render(blogs);

        } catch (err) {
            console.error("Failed to load blogs:", err);
            if (loadingEl) loadingEl.textContent = "Unable to load articles right now.";
        }
    }

    function render(blogs) {
        listEl.innerHTML = "";

        if (!blogs.length) {
            listEl.innerHTML = '<div class="blog-loading">No articles found.</div>';
            return;
        }

        blogs.forEach((b, i) => listEl.appendChild(buildRow(b, i + 1)));
    }

    function buildRow(b, index) {
        const row = document.createElement("div");
        row.className = "blog-row";

        const img      = b.featured_image || "";
        const title    = b.title || "";
        const excerpt  = b.excerpt || "";
        const category = b.category || "";
        const author   = b.author || "";
        const href     = "/blog/" + encodeURIComponent(b.slug || b.id);

        row.innerHTML = `
            <span class="blog-row-index">${String(index).padStart(2, "0")}</span>

            <a class="blog-row-thumb" href="${href}">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">
            </a>

            <div class="blog-row-content">
                <div class="blog-row-meta">
                    ${category ? `<span>${escapeHtml(category)}</span>` : ""}
                    ${category && author ? `<span class="dot"></span>` : ""}
                    ${author ? `<span class="author">${escapeHtml(author)}</span>` : ""}
                </div>
                <a class="blog-row-title" href="${href}">${escapeHtml(title)}</a>
                <p class="blog-row-excerpt">${escapeHtml(excerpt)}</p>
            </div>

            <button type="button" class="blog-row-arrow" aria-label="Quick view">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
            </button>
        `;

        row.querySelector(".blog-row-arrow").addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal(b);
        });

        return row;
    }

    /* ================= MODAL ================= */

    function openModal(b) {
        if (!overlay || !modalBody) return;

        const hasVideo    = !!b.video;
        const isFeatured  = b.featured === "Yes" || b.featured === true;

        modalBody.innerHTML = `
            ${b.featured_image ? `
            <div class="blog-modal-media">
                <img src="${escapeHtml(b.featured_image)}" alt="${escapeHtml(b.title || "")}">
            </div>` : ""}

            <div class="blog-modal-tags">
                ${b.category ? `<span class="blog-modal-tag">${escapeHtml(b.category)}</span>` : ""}
                ${b.status ? `<span class="blog-modal-status">${escapeHtml(b.status)}</span>` : ""}
                ${isFeatured ? `<span class="blog-modal-featured">Featured</span>` : ""}
            </div>

            <h2 id="blogModalTitle" class="blog-modal-title">${escapeHtml(b.title || "")}</h2>

            <div class="blog-modal-meta">
                ${b.author ? `<span>${escapeHtml(b.author)}</span>` : ""}
                ${b.author && b.published_date ? `<span class="dot"></span>` : ""}
                ${b.published_date ? `<span>${formatDate(b.published_date)}</span>` : ""}
            </div>

            ${b.excerpt ? `<p class="blog-modal-excerpt">${escapeHtml(b.excerpt)}</p>` : ""}

            ${b.content ? `<div class="blog-modal-content">${escapeHtml(b.content)}</div>` : ""}

            ${hasVideo ? `
            <div class="blog-modal-video">
                <video controls src="${escapeHtml(b.video)}"></video>
            </div>` : ""}
        `;

        overlay.classList.add("active");
        document.body.classList.add("blog-modal-open");
    }

    function closeModal() {
        if (!overlay) return;
        overlay.classList.remove("active");
        document.body.classList.remove("blog-modal-open");
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    function formatDate(str) {
        const d = new Date(str);
        if (isNaN(d)) return escapeHtml(str);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
    }

})();

// Blogs
// (function () {

//     const API_URL = "/api/blogs";

//     const listEl    = document.getElementById("blogList");
//     const loadingEl = document.getElementById("blogLoading");

//     init();

//     async function init() {
//         try {
//             const res = await fetch(API_URL);
//             if (!res.ok) throw new Error("Request failed: " + res.status);

//             const response = await res.json();

//             if (!response.success || !Array.isArray(response.data)) {
//                 throw new Error("Unexpected API response shape");
//             }

//             // No slice — show everything
//             render(response.data);

//         } catch (err) {
//             console.error("Failed to load blogs:", err);
//             loadingEl.textContent = "Unable to load articles right now.";
//         }
//     }

//     function render(blogs) {
//         listEl.innerHTML = "";

//         if (!blogs.length) {
//             listEl.innerHTML = '<div class="blog-loading">No articles found.</div>';
//             return;
//         }

//         blogs.forEach((b, i) => {
//             listEl.appendChild(buildRow(b, i + 1));
//         });
//     }

//     function buildRow(b, index) {
//         const row = document.createElement("a");
//         row.className = "blog-row";
//         row.href = "/blog-details.html?slug=" + encodeURIComponent(b.slug || b.id);

//         const img      = b.featured_image || "";
//         const title    = b.title || "";
//         const excerpt  = b.excerpt || "";
//         const category = b.category || "";
//         const author   = b.author || "";

//         row.innerHTML = `
//             <span class="blog-row-index">${String(index).padStart(2, "0")}</span>
//             <div class="blog-row-thumb">
//                 <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy">
//             </div>
//             <div class="blog-row-content">
//                 <div class="blog-row-meta">
//                     ${category ? `<span>${escapeHtml(category)}</span>` : ""}
//                     ${category && author ? `<span class="dot"></span>` : ""}
//                     ${author ? `<span class="author">${escapeHtml(author)}</span>` : ""}
//                 </div>
//                 <h3 class="blog-row-title">${escapeHtml(title)}</h3>
//                 <p class="blog-row-excerpt">${escapeHtml(excerpt)}</p>
//             </div>
//             <span class="blog-row-arrow">
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
//                     <path d="M7 17L17 7M17 7H7M17 7V17"/>
//                 </svg>
//             </span>
//         `;

//         return row;
//     }

//     function escapeHtml(str) {
//         const div = document.createElement("div");
//         div.textContent = str ?? "";
//         return div.innerHTML;
//     }

// })();

// Blogs Details
// (function () {

//     const API_URL = "/api/blogs"; // returns the full list: { success, data: [...] }

//     const loadingEl = document.getElementById("blogDetailLoading");
//     const errorEl   = document.getElementById("blogDetailError");
//     const articleEl = document.getElementById("blogDetailArticle");

//     const metaEl     = document.getElementById("blogDetailMeta");
//     const titleEl    = document.getElementById("blogDetailTitle");
//     const excerptEl  = document.getElementById("blogDetailExcerpt");
//     const imageEl    = document.getElementById("blogDetailImage");
//     const videoWrap  = document.getElementById("blogDetailVideoWrap");
//     const videoEl    = document.getElementById("blogDetailVideo");
//     const contentEl  = document.getElementById("blogDetailContent");

//     if (!articleEl || !loadingEl) return;
  
//     init();

//     async function init() {
//         const id = getIdFromUrl();

//         if (!id) {
//             showError();
//             return;
//         }

//         try {
//             const res = await fetch(API_URL);
//             if (!res.ok) throw new Error("Request failed: " + res.status);

//             const response = await res.json();

//             if (!response.success || !Array.isArray(response.data)) {
//                 throw new Error("Unexpected API response shape");
//             }

//             // Match loosely (== ) since the id in the URL is always a string
//             // but the id coming back from the API might be a number.
//             const blog = response.data.find(b => String(b.id) === String(id));

//             if (!blog) {
//                 showError();
//                 return;
//             }

//             render(blog);

//         } catch (err) {
//             console.error("Failed to load blog:", err);
//             showError();
//         }
//     }

//     function getIdFromUrl() {
//         const params = new URLSearchParams(window.location.search);
//         return params.get("id");
//     }

//     function render(b) {
//         document.title = (b.title || "Blog") + " | ACES";

//         titleEl.textContent = b.title || "";
//         excerptEl.textContent = b.excerpt || "";

//         imageEl.src = b.featured_image || "";
//         imageEl.alt = b.title || "";

//         metaEl.innerHTML = `
//             ${b.category ? `<span>${escapeHtml(b.category)}</span>` : ""}
//             ${b.category && b.author ? `<span class="dot"></span>` : ""}
//             ${b.author ? `<span class="author">${escapeHtml(b.author)}</span>` : ""}
//             ${(b.category || b.author) && b.published_date ? `<span class="dot"></span>` : ""}
//             ${b.published_date ? `<span class="date">${formatDate(b.published_date)}</span>` : ""}
//         `;

//         // NOTE: sanitize this HTML server-side before it reaches the client.
//         contentEl.innerHTML = b.content || "";

//         // Video is optional — only render the block if a video exists
//         if (b.video) {
//             videoEl.src = b.video;
//             videoWrap.hidden = false;
//         } else {
//             videoWrap.hidden = true;
//         }

//         loadingEl.hidden = true;
//         articleEl.hidden = false;
//     }

//     function showError() {
//         loadingEl.hidden = true;
//         errorEl.hidden = false;
//     }

//     function formatDate(dateStr) {
//         const d = new Date(dateStr);
//         if (isNaN(d)) return "";
//         return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
//     }

//     function escapeHtml(str) {
//         const div = document.createElement("div");
//         div.textContent = str ?? "";
//         return div.innerHTML;
//     }

// })();

// Teams Section 
document.addEventListener("DOMContentLoaded", () => {

    const teamGrid =
        document.getElementById("aces-team-grid");


    if (!teamGrid) {
        return;
    }


    /* =====================================================
       API
    ===================================================== */

    const API_URL = "/api/teams";


    /* =====================================================
       LOAD TEAM
    ===================================================== */

    async function loadTeam() {

        try {

            teamGrid.innerHTML = `
                <div class="aces-team-loading">
                    Loading team...
                </div>
            `;


            const response =
                await fetch(API_URL);


            if (!response.ok) {

                throw new Error(
                    `HTTP Error ${response.status}`
                );

            }


            const result =
                await response.json();


            /* =================================================
               SUPPORT COMMON API RESPONSE FORMATS
            ================================================= */

            let teamData = [];


            if (Array.isArray(result)) {

                teamData = result;

            }

            else if (
                Array.isArray(result.team)
            ) {

                teamData = result.team;

            }

            else if (
                Array.isArray(result.data)
            ) {

                teamData = result.data;

            }

            else if (
                Array.isArray(result.rows)
            ) {

                teamData = result.rows;

            }


            /* =================================================
               REMOVE INVALID RECORDS
            ================================================= */

            teamData =
                teamData.filter(
                    member =>
                        member &&
                        typeof member === "object"
                );


            /* =================================================
               SORT BY BACKEND ORDER
            ================================================= */

            teamData.sort(
                (a, b) => {

                    const orderA =
                        Number(
                            a.order ??
                            a.display_order ??
                            a.sort_order ??
                            999999
                        );


                    const orderB =
                        Number(
                            b.order ??
                            b.display_order ??
                            b.sort_order ??
                            999999
                        );


                    return orderA - orderB;

                }
            );


            /* =================================================
               EMPTY STATE
            ================================================= */

            if (
                teamData.length === 0
            ) {

                teamGrid.innerHTML = `
                    <div class="aces-team-empty">
                        No team members available.
                    </div>
                `;

                return;

            }


            /* =================================================
               RENDER TEAM
            ================================================= */

            teamGrid.innerHTML =
                teamData
                    .map(
                        (member, index) =>
                            createTeamCard(
                                member,
                                index
                            )
                    )
                    .join("");


        }

        catch (error) {

            console.error(
                "Team API Error:",
                error
            );


            teamGrid.innerHTML = `
                <div class="aces-team-error">
                    Unable to load team members at the moment.
                </div>
            `;

        }

    }


    /* =====================================================
       CREATE TEAM CARD
    ===================================================== */

    function createTeamCard(
        member,
        index
    ) {

        /* =================================================
           BACKEND FIELDS
        ================================================= */

        const image =
            member.image ||
            member.image_url ||
            member.imageUrl ||
            "";


        const name =
            member.name ||
            "Team Member";


        const position =
            member.position ||
            "";


        const department =
            member.department ||
            "";



        /* =================================================
           ESCAPE VALUES
        ================================================= */

        const safeImage =
            escapeAttribute(
                image
            );


        const safeName =
            escapeHTML(
                name
            );


        const safePosition =
            escapeHTML(
                position
            );


        const safeDepartment =
            escapeHTML(
                department
            );


        /* =================================================
           IMAGE
        ================================================= */

        const imageHTML =
            safeImage
                ? `
                    <img
                        src="${safeImage}"
                        alt="${safeName}"
                        class="aces-team-image"
                        loading="lazy"
                    >
                  `
                : `
                    <div
                        class="
                            aces-team-image
                            aces-team-image-placeholder
                        "
                    >
                        <span>ACES</span>
                    </div>
                  `;


        /* =================================================
           DEPARTMENT
        ================================================= */

        const departmentHTML =
            safeDepartment
                ? `
                    <span class="aces-team-department">
                        ${safeDepartment}
                    </span>
                  `
                : "";


        /* =================================================
           POSITION
        ================================================= */

        const positionHTML =
            safePosition
                ? `
                    <p class="aces-team-position">
                        ${safePosition}
                    </p>
                  `
                : "";


        /* =================================================
           RETURN CARD
        ================================================= */

        return `
            <article class="aces-team-card">

                <div class="aces-team-image-wrap">

                    <!-- ORDER NUMBER -->



                    <!-- TEAM IMAGE -->

                    ${imageHTML}


                    <!-- IMAGE OVERLAY -->

                    <div class="aces-team-overlay">

                        ${departmentHTML}

                    </div>

                </div>


                <!-- TEAM INFORMATION -->

                <div class="aces-team-info">

                    <div class="aces-team-name-wrap">

                        <h3>
                            ${safeName}
                        </h3>


                        <span class="aces-team-arrow">
                            ↗
                        </span>

                    </div>


                    ${positionHTML}

                </div>

            </article>
        `;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
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


    /* =====================================================
       ESCAPE IMAGE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );

    }


    /* =====================================================
       START
    ===================================================== */

    loadTeam();

});