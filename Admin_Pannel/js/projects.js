"use strict";


const API_URL =
    "/api/project";


let projectsData = [];

let editingProjectId = null;

let currentSaveFunction = null;


// =====================================================
// DOM
// =====================================================

const projectBody =
    document.getElementById(
        "project-body"
    );

const searchInput =
    document.getElementById(
        "search"
    );

const addProjectButton =
    document.getElementById(
        "add-project"
    );

const refreshButton =
    document.getElementById(
        "refresh-projects"
    );

const modalBackdrop =
    document.getElementById(
        "modal-backdrop"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const modalEyebrow =
    document.getElementById(
        "modal-eyebrow"
    );

const modalBody =
    document.getElementById(
        "modal-body"
    );

const modalSave =
    document.getElementById(
        "modal-save"
    );

const modalCancel =
    document.getElementById(
        "modal-cancel"
    );

const modalClose =
    document.getElementById(
        "modal-close"
    );


// =====================================================
// LOAD PROJECTS
// =====================================================

async function loadProjects() {

    try {

        const response =
            await fetch(
                API_URL
            );


        const result =
            await response.json();


        console.log(
            "GET PROJECTS RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load projects"
            );

        }


        projectsData =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        renderProjects();

    } catch (error) {

        console.error(
            "LOAD PROJECTS ERROR:",
            error
        );


        if (projectBody) {

            projectBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="text-align:center;padding:40px;">

                        Failed to load projects.

                        <br>

                        ${escapeHTML(
                            error.message
                        )}

                    </td>

                </tr>

            `;

        }

    }
}


// =====================================================
// RENDER
// =====================================================

function renderProjects() {

    if (!projectBody) {
        return;
    }


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filtered =
        projectsData;


    if (search) {

        filtered =
            projectsData.filter(
                project => {

                    return (

                        String(
                            project.project_title ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            project.category ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            project.client ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)

                        ||

                        String(
                            project.location ||
                            ""
                        )
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    if (!filtered.length) {

        projectBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:40px;">

                    No projects found.

                </td>

            </tr>

        `;

        return;

    }


    projectBody.innerHTML =
        filtered.map(
            project => {

                return `

                    <tr>

                        <td>

                            ${
                                project.project_image

                                    ? `

                                        <img

                                            src="${escapeAttribute(
                                                project.project_image
                                            )}"

                                            alt="${escapeAttribute(
                                                project.project_title
                                            )}"

                                            style="
                                                width:70px;
                                                height:50px;
                                                object-fit:cover;
                                                border-radius:6px;
                                            "

                                        >

                                    `

                                    : "No Image"
                            }

                        </td>


                        <td>

                            <strong>

                                ${escapeHTML(
                                    project.project_title
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                project.category ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                project.client ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                project.location ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                project.status ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${project.completion_date
                                ? formatDate(
                                    project.completion_date
                                )
                                : "-"
                            }

                        </td>


                        <td>

                            <div class="actions">

                                <button

                                    class="action-btn"

                                    data-action="edit"

                                    data-id="${project.id}"

                                    type="button">

                                    ✎

                                </button>


                                <button

                                    class="action-btn delete"

                                    data-action="delete"

                                    data-id="${project.id}"

                                    type="button">

                                    ⌫

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// =====================================================
// CREATE FORM
// =====================================================

function createProjectForm(
    project = null
) {

    const galleryText =
        project &&
        project.gallery
            ? `

                <div
                    style="
                        display:flex;
                        gap:10px;
                        flex-wrap:wrap;
                        margin-top:10px;
                    ">

                    ${
                        project.gallery
                            .map(
                                image => `

                                    <img

                                        src="${escapeAttribute(
                                            image.image_url
                                        )}"

                                        style="
                                            width:100px;
                                            height:70px;
                                            object-fit:cover;
                                            border-radius:6px;
                                        "

                                    >

                                `
                            )
                            .join("")
                    }

                </div>

            `
            : "";


    return `

        <div class="form-grid">


            <div class="form-field">

                <label>
                    Project Title *
                </label>

                <input
                    type="text"
                    id="project-title"
                    value="${escapeAttribute(
                        project?.project_title || ""
                    )}"
                    placeholder="Project title">

            </div>


            <div class="form-field">

                <label>
                    Category *
                </label>

                <select
                    id="project-category">

                    <option value="">
                        Select Category
                    </option>

                    <option
                        value="Residential"
                        ${project?.category === "Residential"
                            ? "selected"
                            : ""}
                    >
                        Residential
                    </option>

                    <option
                        value="Commercial"
                        ${project?.category === "Commercial"
                            ? "selected"
                            : ""}
                    >
                        Commercial
                    </option>

                     <option
                        value="Housing and Urban Development"
                        ${project?.category === "Housing and Urban Development"
                            ? "selected"
                            : ""}
                    >
                        Housing and Urban Development
                    </option>

                    <option
                        value="Industrial"
                        ${project?.category === "Industrial"
                            ? "selected"
                            : ""}
                    >
                        Industrial
                    </option>

                    <option
                        value="Infrastructure"
                        ${project?.category === "Infrastructure"
                            ? "selected"
                            : ""}
                    >
                        Infrastructure
                    </option>

                    <option
                        value="Institutional and Public"
                        ${project?.category === "Institutional and Public"
                            ? "selected"
                            : ""}
                    >
                        Institutional and Public
                    </option>

                    <option
                        value="Religious"
                        ${project?.category === "Religious"
                            ? "selected"
                            : ""}
                    >
                        Religious
                    </option>
                      <option
                        value="LandScape and Recreation"
                        ${project?.category === "LandScape and Recreation"
                            ? "selected"
                            : ""}
                    >
                        LandScape and Recreation
                    </option>
                </select>

            </div>


            <div class="form-field">

                <label>
                    Client
                </label>

                <input
                    type="text"
                    id="project-client"
                    value="${escapeAttribute(
                        project?.client || ""
                    )}"
                    placeholder="Client name">

            </div>


            <div class="form-field">

                <label>
                    Location
                </label>

                <input
                    type="text"
                    id="project-location"
                    value="${escapeAttribute(
                        project?.location || ""
                    )}"
                    placeholder="Project location">

            </div>


            <div class="form-field">

                <label>
                    Project Area
                </label>

                <input
                    type="text"
                    id="project-area"
                    value="${escapeAttribute(
                        project?.project_area || ""
                    )}"
                    placeholder="e.g. 25,000 sq.ft">

            </div>


            <div class="form-field">

                <label>
                    Offered Service
                </label>

                <input
                    type="text"
                    id="offered-service"
                    value="${escapeAttribute(
                        project?.offered_service || ""
                    )}"
                    placeholder="Architecture, Structural Engineering, MEP">

            </div>


            <div class="form-field">

                <label>
                    Completion Date
                </label>

                <input
                    type="date"
                    id="completion-date"
                    value="${formatDateForInput(
                        project?.completion_date
                    )}">

            </div>


            <div class="form-field">

                <label>
                    Status
                </label>

                <select id="project-status">

                    <option
                        value="Completed"
                        ${project?.status === "Completed"
                            ? "selected"
                            : ""}
                    >
                        Completed
                    </option>

                    <option
                        value="Ongoing"
                        ${project?.status === "Ongoing"
                            ? "selected"
                            : ""}
                    >
                        Ongoing
                    </option>

                    <option
                        value="Upcoming"
                        ${project?.status === "Upcoming"
                            ? "selected"
                            : ""}
                    >
                        Upcoming
                    </option>

                </select>

            </div>


            <div class="form-field">

                <label>
                    Description
                </label>

                <textarea
                    id="project-description"
                    rows="6"
                    placeholder="Project description">${escapeHTML(
                        project?.description || ""
                    )}</textarea>

            </div>


            <div class="form-field">

                <label>
                    Main Project Image
                </label>

                <input
                    type="file"
                    id="project-image"
                    accept="image/jpeg,image/png,image/webp">

                <small>
                    Main image of the project.
                </small>

            </div>


            <div class="form-field">

                <label>
                    Project Gallery
                </label>

                <input
                    type="file"
                    id="project-gallery"
                    accept="image/jpeg,image/png,image/webp"
                    multiple>

                <small>
                    You can select multiple images.
                </small>

                ${galleryText}

            </div>


        </div>

    `;
}


// =====================================================
// FORM DATA
// =====================================================

function getProjectFormData() {

    const formData =
        new FormData();


    formData.append(
        "project_title",
        document
            .getElementById(
                "project-title"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "category",
        document
            .getElementById(
                "project-category"
            )
            ?.value || ""
    );


    formData.append(
        "client",
        document
            .getElementById(
                "project-client"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "location",
        document
            .getElementById(
                "project-location"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "description",
        document
            .getElementById(
                "project-description"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "project_area",
        document
            .getElementById(
                "project-area"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "offered_service",
        document
            .getElementById(
                "offered-service"
            )
            ?.value
            .trim() || ""
    );


    formData.append(
        "completion_date",
        document
            .getElementById(
                "completion-date"
            )
            ?.value || ""
    );


    formData.append(
        "status",
        document
            .getElementById(
                "project-status"
            )
            ?.value || "Completed"
    );


    // =================================================
    // MAIN IMAGE
    // =================================================

    const mainImage =
        document.getElementById(
            "project-image"
        );


    if (
        mainImage &&
        mainImage.files.length
    ) {

        formData.append(
            "project_image",
            mainImage.files[0]
        );

    }


    // =================================================
    // GALLERY
    // =================================================

    const gallery =
        document.getElementById(
            "project-gallery"
        );


    if (
        gallery &&
        gallery.files.length
    ) {

        for (
            const file
            of gallery.files
        ) {

            formData.append(
                "project_gallery",
                file
            );

        }

    }


    return formData;
}


// =====================================================
// ADD PROJECT
// =====================================================

function addProject() {

    editingProjectId =
        null;


    openModal(

        "Add Project",

        "PROJECT",

        createProjectForm(),

        saveNewProject

    );

}


// =====================================================
// SAVE NEW PROJECT
// =====================================================

async function saveNewProject() {

    try {

        modalSave.disabled =
            true;

        modalSave.textContent =
            "Saving...";


        const formData =
            getProjectFormData();


        const response =
            await fetch(

                API_URL,

                {

                    method:
                        "POST",

                    body:
                        formData

                }

            );


        const result =
            await response.json();


        console.log(
            "CREATE PROJECT RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to create project"
            );

        }


        closeModal();

        await loadProjects();


        alert(
            "Project created successfully."
        );


    } catch (error) {

        console.error(
            "CREATE PROJECT ERROR:",
            error
        );


        alert(
            error.message
        );

    } finally {

        modalSave.disabled =
            false;

        modalSave.textContent =
            "Save";

    }

}


// =====================================================
// EDIT PROJECT
// =====================================================

async function editProject(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        editingProjectId =
            id;


        openModal(

            "Edit Project",

            "EDIT PROJECT",

            createProjectForm(
                result.data
            ),

            saveEditedProject

        );

    } catch (error) {

        console.error(
            "EDIT PROJECT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================================
// SAVE EDIT
// =====================================================

async function saveEditedProject() {

    if (!editingProjectId) {
        return;
    }


    try {

        modalSave.disabled =
            true;

        modalSave.textContent =
            "Updating...";


        const formData =
            getProjectFormData();


        const response =
            await fetch(

                `${API_URL}/${editingProjectId}`,

                {

                    method:
                        "PUT",

                    body:
                        formData

                }

            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        closeModal();

        await loadProjects();


        alert(
            "Project updated successfully."
        );


    } catch (error) {

        console.error(
            "UPDATE PROJECT ERROR:",
            error
        );


        alert(
            error.message
        );

    } finally {

        modalSave.disabled =
            false;

        modalSave.textContent =
            "Save";

    }

}


// =====================================================
// DELETE
// =====================================================

async function deleteProject(id) {

    const project =
        projectsData.find(
            p =>
                Number(p.id) ===
                Number(id)
        );


    if (
        !confirm(
            `Delete "${project?.project_title || "this project"}"?`
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(

                `${API_URL}/${id}`,

                {

                    method:
                        "DELETE"

                }

            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message
            );

        }


        await loadProjects();


        alert(
            "Project deleted successfully."
        );

    } catch (error) {

        console.error(
            "DELETE PROJECT ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================================
// MODAL
// =====================================================

function openModal(
    title,
    eyebrow,
    content,
    saveFunction
) {

    modalTitle.textContent =
        title;

    modalEyebrow.textContent =
        eyebrow;

    modalBody.innerHTML =
        content;

    currentSaveFunction =
        saveFunction;

    modalBackdrop.classList.add(
        "show"
    );

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    modalBackdrop.classList.remove(
        "show"
    );

    modalBody.innerHTML =
        "";

    currentSaveFunction =
        null;

    editingProjectId =
        null;

}


// =====================================================
// SAVE BUTTON
// =====================================================

if (modalSave) {

    modalSave.addEventListener(
        "click",
        async () => {

            if (
                typeof currentSaveFunction !==
                "function"
            ) {

                return;
            }


            await currentSaveFunction();

        }
    );

}


// =====================================================
// CANCEL
// =====================================================

if (modalCancel) {

    modalCancel.addEventListener(
        "click",
        closeModal
    );

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


// =====================================================
// SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderProjects
    );

}


// =====================================================
// ADD
// =====================================================

if (addProjectButton) {

    addProjectButton.addEventListener(
        "click",
        addProject
    );

}


// =====================================================
// REFRESH
// =====================================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadProjects
    );

}


// =====================================================
// TABLE ACTIONS
// =====================================================

if (projectBody) {

    projectBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            if (
                button.dataset.action ===
                "edit"
            ) {

                editProject(id);

            }


            if (
                button.dataset.action ===
                "delete"
            ) {

                deleteProject(id);

            }

        }
    );

}


// =====================================================
// HELPERS
// =====================================================

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


function escapeAttribute(value) {

    return escapeHTML(value);

}


function formatDate(date) {

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


    return d.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function formatDateForInput(date) {

    if (!date) {
        return "";
    }


    const d =
        new Date(date);


    if (
        isNaN(
            d.getTime()
        )
    ) {

        return "";
    }


    const year =
        d.getFullYear();


    const month =
        String(
            d.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            d.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// =====================================================
// INITIAL LOAD
// =====================================================

loadProjects();