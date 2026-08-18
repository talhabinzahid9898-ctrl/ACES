// ============================================================
// ACES ADMIN PANEL - SERVICES
// ============================================================

"use strict";


// ============================================================
// API
// ============================================================

const API_URL = "/api/services";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let servicesData = [];

let editingServiceId = null;

let currentModalSaveFunction = null;

let toastTimer = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const serviceBody =
    document.getElementById("service-body");

const searchInput =
    document.getElementById("search");

const addServiceButton =
    document.getElementById("add-service");

const refreshServicesButton =
    document.getElementById("refresh-services");

const modalBackdrop =
    document.getElementById("modal-backdrop");

const modalTitle =
    document.getElementById("modal-title");

const modalEyebrow =
    document.getElementById("modal-eyebrow");

const modalBody =
    document.getElementById("modal-body");

const modalSave =
    document.getElementById("modal-save");

const modalCancel =
    document.getElementById("modal-cancel");

const modalClose =
    document.getElementById("modal-close");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toast-message");


// ============================================================
// LOAD SERVICES
// ============================================================

async function loadServices() {

    try {

        serviceBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:40px;">
                    Loading services...
                </td>
            </tr>
        `;


        const response = await fetch(API_URL);


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load services."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load services."
            );

        }


        servicesData =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderServices();


    } catch (error) {

        console.error(
            "LOAD SERVICES ERROR:",
            error
        );


        serviceBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:40px;">

                    <strong>
                        Failed to load services
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(error.message)}
                    </small>

                </td>
            </tr>
        `;

    }

}


// ============================================================
// RENDER SERVICES
// ============================================================

function renderServices() {

    const searchValue =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filteredServices =
        servicesData;


    if (searchValue) {

        filteredServices =
            servicesData.filter(service => {

                return (

                    String(service.title || "")
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(service.category || "")
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(service.description || "")
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(service.status || "")
                        .toLowerCase()
                        .includes(searchValue)

                );

            });

    }


    if (filteredServices.length === 0) {

        serviceBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:40px;">

                    No services found.

                </td>
            </tr>
        `;

        return;

    }


    serviceBody.innerHTML =
        filteredServices.map(service => {

            const id =
                Number(service.id);


            return `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(service.title)}
                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                            service.category || "-"
                        )}

                    </td>


                    <td>

                        <div class="description-cell">

                            ${escapeHTML(
                                service.description || "-"
                            )}

                        </div>

                    </td>


                    <td>

                        ${createStatusBadge(
                            service.status
                        )}

                    </td>


                    <td>

                        <div class="actions">

                            <button
                                type="button"
                                class="action-btn"
                                data-action="edit"
                                data-id="${id}"
                                title="Edit">

                                ✎

                            </button>


                            <button
                                type="button"
                                class="action-btn delete"
                                data-action="delete"
                                data-id="${id}"
                                title="Delete">

                                ⌫

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

}


// ============================================================
// STATUS BADGE
// ============================================================

function createStatusBadge(status) {

    const value =
        String(status || "Draft");


    const className =
        value.toLowerCase() === "published"
            ? "status-badge published"
            : "status-badge draft";


    return `
        <span class="${className}">
            ${escapeHTML(value)}
        </span>
    `;

}


// ============================================================
// ADD SERVICE
// ============================================================

function addService() {

    console.log("ADD SERVICE BUTTON CLICKED");

    editingServiceId = null;

    const form = `
        <div class="form-grid">

            <div class="form-field">
                <label for="service-title">
                    Service Title
                </label>

                <input
                    type="text"
                    id="service-title"
                    placeholder="Enter service title"
                >
            </div>

            <div class="form-field">
                <label for="service-category">
                    Category
                </label>

                <input
                    type="text"
                    id="service-category"
                    placeholder="Enter category"
                >
            </div>

            <div class="form-field">
                <label for="service-description">
                    Description
                </label>

                <textarea
                    id="service-description"
                    rows="5"
                    placeholder="Enter service description"
                ></textarea>
            </div>

            <div class="form-field">
                <label for="service-status">
                    Status
                </label>

                <select id="service-status">

                    <option value="Published">
                        Published
                    </option>

                    <option value="Draft">
                        Draft
                    </option>

                </select>
            </div>

        </div>
    `;

    openModal(
        "Add Service",
        "SERVICE",
        form,
        saveNewService
    );
}


// ============================================================
// CREATE SERVICE FORM
// ============================================================

function createServiceForm(service = null) {

    const title =
        service?.title || "";


    const category =
        service?.category || "";


    const description =
        service?.description || "";


    const status =
        service?.status || "Published";


    return `

        <div class="form-grid">

            <!-- TITLE -->

            <div class="form-field">

                <label for="service-title">
                    Service Title
                </label>

                <input
                    type="text"
                    id="service-title"
                    name="title"
                    value="${escapeAttribute(title)}"
                    placeholder="e.g. Structural Engineering">

            </div>


            <!-- CATEGORY -->

            <div class="form-field">

                <label for="service-category">
                    Category
                </label>

                <input
                    type="text"
                    id="service-category"
                    name="category"
                    value="${escapeAttribute(category)}"
                    placeholder="e.g. Engineering">

            </div>


            <!-- DESCRIPTION -->

            <div class="form-field">

                <label for="service-description">
                    Description
                </label>

                <textarea
                    id="service-description"
                    name="description"
                    rows="5"
                    placeholder="Enter service description...">${escapeHTML(description)}</textarea>

            </div>


            <!-- STATUS -->

            <div class="form-field">

                <label for="service-status">
                    Status
                </label>

                <select
                    id="service-status"
                    name="status">

                    <option
                        value="Published"
                        ${status === "Published" ? "selected" : ""}>

                        Published

                    </option>


                    <option
                        value="Draft"
                        ${status === "Draft" ? "selected" : ""}>

                        Draft

                    </option>

                </select>

            </div>

        </div>

    `;

}


// ============================================================
// SAVE NEW SERVICE
// ============================================================

async function saveNewService() {

    const data =
        getFormValues();


    if (!data.title) {

        alert(
            "Please enter the service title."
        );

        return;

    }


    try {

        modalSave.disabled = true;

        modalSave.textContent = "Saving...";


        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },

                body: JSON.stringify(data)

            });


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to create service."
            );

        }


        closeModal();


        await loadServices();
        alert("Service added successfully!");
        return true;
        showToast(
            "Service added successfully."
        );


    } catch (error) {

        console.error(
            "CREATE SERVICE ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to create service."
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent = "Save";

    }

}


// ============================================================
// EDIT SERVICE
// ============================================================

async function editService(id) {

    const serviceId =
        Number(id);


    if (
        !Number.isInteger(serviceId) ||
        serviceId <= 0
    ) {

        alert("Invalid service ID.");

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${serviceId}`
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to load service."
            );

        }


        const service =
            result.data;


        if (!service) {

            throw new Error(
                "Service not found."
            );

        }


        editingServiceId =
            serviceId;


        openModal(
            "Edit Service",
            "SERVICE",
            createServiceForm(service),
            saveEditedService
        );


    } catch (error) {

        console.error(
            "EDIT SERVICE ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to load service."
        );

    }

}


// ============================================================
// SAVE EDITED SERVICE
// ============================================================

async function saveEditedService() {

    if (!editingServiceId) {

        alert("Invalid service ID.");

        return;

    }


    const data =
        getFormValues();


    if (!data.title) {

        alert(
            "Please enter the service title."
        );

        return;

    }


    try {

        modalSave.disabled = true;

        modalSave.textContent = "Saving...";


        const response =
            await fetch(
                `${API_URL}/${editingServiceId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to update service."
            );

        }


        closeModal();


        await loadServices();


        showToast(
            "Service updated successfully."
        );


    } catch (error) {

        console.error(
            "UPDATE SERVICE ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to update service."
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent = "Save";

    }

}


// ============================================================
// DELETE SERVICE
// ============================================================

async function deleteService(id) {

    const serviceId =
        Number(id);


    if (
        !Number.isInteger(serviceId) ||
        serviceId <= 0
    ) {

        alert("Invalid service ID.");

        return;

    }


    const service =
        servicesData.find(
            item =>
                Number(item.id) === serviceId
        );


    const serviceName =
        service
            ? service.title
            : "this service";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${serviceName}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${serviceId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to delete service."
            );

        }


        await loadServices();


        showToast(
            "Service deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE SERVICE ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to delete service."
        );

    }

}


// ============================================================
// GET FORM VALUES
// ============================================================

function getFormValues() {

    const title =
        document.getElementById(
            "service-title"
        );


    const category =
        document.getElementById(
            "service-category"
        );


    const description =
        document.getElementById(
            "service-description"
        );


    const status =
        document.getElementById(
            "service-status"
        );


    return {

        title:
            title
                ? title.value.trim()
                : "",

        category:
            category
                ? category.value.trim()
                : null,

        description:
            description
                ? description.value.trim()
                : null,

        status:
            status
                ? status.value
                : "Published"

    };

}


// ============================================================
// OPEN MODAL
// ============================================================

function openModal(title, eyebrow, content, saveFunction) {

    console.log("OPENING MODAL");

    modalTitle.textContent = title;
    modalEyebrow.textContent = eyebrow;
    modalBody.innerHTML = content;

    // THIS WAS MISSING
    currentModalSaveFunction = saveFunction;

    modalBackdrop.classList.add("show");

    document.body.classList.add("modal-open");

    setTimeout(() => {

        const titleInput =
            document.querySelector("#service-title");

        if (titleInput) {
            titleInput.focus();
        }

    }, 100);
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    modalBackdrop.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "modal-open"
    );


    modalBody.innerHTML = "";


    currentModalSaveFunction = null;

    editingServiceId = null;

}


// ============================================================
// SAVE BUTTON
// ============================================================

modalSave.addEventListener("click", async () => {

    if (
        typeof currentModalSaveFunction !== "function"
    ) {

        alert("Save function is not defined.");

        return;
    }

    modalSave.disabled = true;

    modalSave.textContent = "Saving...";

    try {

        await currentModalSaveFunction();

    } catch (error) {

        console.error("SAVE ERROR:", error);

        alert(
            error.message ||
            "Failed to save service."
        );

    } finally {

        modalSave.disabled = false;

        modalSave.textContent = "Save";
    }

});

// ============================================================
// CANCEL
// ============================================================

modalCancel.addEventListener(
    "click",
    closeModal
);


// ============================================================
// CLOSE BUTTON
// ============================================================

modalClose.addEventListener(
    "click",
    closeModal
);


// ============================================================
// CLICK OUTSIDE MODAL
// ============================================================

modalBackdrop.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalBackdrop
        ) {

            closeModal();

        }

    }
);


// ============================================================
// ESC KEY
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modalBackdrop.classList.contains("show")
        ) {

            closeModal();

        }

    }
);


// ============================================================
// SEARCH
// ============================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderServices
    );

}


// ============================================================
// ADD BUTTON
// ============================================================

if (addServiceButton) {

    addServiceButton.addEventListener(
        "click",
        addService
    );

}


// ============================================================
// REFRESH
// ============================================================

if (refreshServicesButton) {

    refreshServicesButton.addEventListener(
        "click",
        async () => {

            await loadServices();
            alert("Service added successfully!");
            showToast(
                "Services refreshed."
            );

        }
    );

}


// ============================================================
// TABLE ACTIONS
// ============================================================

serviceBody.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const id =
            button.dataset.id;


        if (action === "edit") {

            editService(id);

        }


        if (action === "delete") {

            deleteService(id);

        }

    }
);


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    if (!toast) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

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


// ============================================================
// ESCAPE ATTRIBUTE
// ============================================================

function escapeAttribute(value) {

    return escapeHTML(value);

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadServices();