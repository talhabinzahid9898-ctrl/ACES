"use strict";


// ============================================================
// API
// ============================================================

const API_URL = "/api/teams";

// ============================================================
// GLOBAL VARIABLES
// ============================================================

let teamsData = [];

let editingTeamId = null;

let currentSaveFunction = null;


// ============================================================
// DOM
// ============================================================

const teamBody =
    document.getElementById("team-body");

const searchInput =
    document.getElementById("search");

const addTeamButton =
    document.getElementById("add-team");

const refreshButton =
    document.getElementById("refresh-teams");

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
// LOAD TEAMS
// ============================================================

async function loadTeams() {

    try {

        if (teamBody) {

            teamBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:40px;
                        ">

                        Loading team members...

                    </td>

                </tr>

            `;
        }


        const response =
            await fetch(API_URL);


        /*
         * IMPORTANT:
         *
         * /api/teams
         *
         * DOES NOT HAVE AN ID.
         *
         * Therefore it must NOT be treated
         * like /api/teams/:id.
         */


        const result =
            await response.json();


        console.log(
            "GET TEAMS RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load teams"
            );
        }


        teamsData =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderTeams();


    } catch (error) {

        console.error(
            "LOAD TEAMS ERROR:",
            error
        );


        if (teamBody) {

            teamBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:40px;
                        ">

                        Failed to load team members.

                        <br>

                        <small>
                            ${escapeHTML(
                                error.message
                            )}
                        </small>

                    </td>

                </tr>

            `;
        }

    }
}


// ============================================================
// RENDER
// ============================================================

function renderTeams() {

    if (!teamBody) {

        console.error(
            "team-body was not found in HTML"
        );

        return;
    }


    const searchValue =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let filtered =
        teamsData;


    if (searchValue) {

        filtered =
            teamsData.filter(team => {

                return (

                    String(
                        team.name || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        team.position || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        team.department || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                );

            });
    }


    if (
        filtered.length === 0
    ) {

        teamBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:40px;
                    ">

                    No team members found.

                </td>

            </tr>

        `;

        return;
    }


    teamBody.innerHTML =
        filtered
            .map(team => {

                const image =
                    team.image_url

                        ? `

                            <img
                                src="${escapeAttribute(
                                    team.image_url
                                )}"

                                alt="${escapeAttribute(
                                    team.name
                                )}"

                                style="
                                    width:50px;
                                    height:50px;
                                    object-fit:cover;
                                    border-radius:50%;
                                "
                            >

                        `

                        : `

                            <span>
                                No Image
                            </span>

                        `;


                const status =
                    team.status

                        ? `

                            <span class="status-badge published">
                                Active
                            </span>

                        `

                        : `

                            <span class="status-badge draft">
                                Inactive
                            </span>

                        `;


                return `

                    <tr>

                        <td>
                            ${image}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    team.name
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                team.position || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                team.department || "-"
                            )}

                        </td>


                        <td>

                            ${Number(
                                team.display_order || 0
                            )}

                        </td>


                        <td>

                            ${status}

                        </td>


                        <td>

                            <div class="actions">


                                <button

                                    type="button"

                                    class="action-btn"

                                    data-action="edit"

                                    data-id="${Number(
                                        team.id
                                    )}"

                                    title="Edit">

                                    ✎

                                </button>


                                <button

                                    type="button"

                                    class="action-btn delete"

                                    data-action="delete"

                                    data-id="${Number(
                                        team.id
                                    )}"

                                    title="Delete">

                                    ⌫

                                </button>


                            </div>

                        </td>

                    </tr>

                `;

            })
            .join("");
}


// ============================================================
// ADD TEAM
// ============================================================

function addTeam() {

    editingTeamId = null;


    const form = createTeamForm();


    openModal(

        "Add Team Member",

        "TEAM",

        form,

        saveNewTeam

    );
}


// ============================================================
// TEAM FORM
// ============================================================

function createTeamForm(team = null) {

    const name =
        team?.name || "";


    const position =
        team?.position || "";


    const department =
        team?.department || "";


    const bio =
        team?.bio || "";


    const displayOrder =
        team?.display_order || 0;


    const status =
        team
            ? Boolean(team.status)
            : true;


    return `

        <div class="form-grid">


            <!-- NAME -->

            <div class="form-field">

                <label>
                    Name
                </label>

                <input

                    type="text"

                    id="team-name"

                    placeholder="Enter team member name"

                    value="${escapeAttribute(
                        name
                    )}"

                >

            </div>


            <!-- POSITION -->

            <div class="form-field">

                <label>
                    Position
                </label>

                <input

                    type="text"

                    id="team-position"

                    placeholder="e.g. Senior Architect"

                    value="${escapeAttribute(
                        position
                    )}"

                >

            </div>


            <!-- DEPARTMENT -->

            <div class="form-field">

                <label>
                    Department
                </label>

                <input

                    type="text"

                    id="team-department"

                    placeholder="e.g. Architecture"

                    value="${escapeAttribute(
                        department
                    )}"

                >

            </div>


            <!-- BIO -->

            <div class="form-field">

                <label>
                    Biography
                </label>

                <textarea

                    id="team-bio"

                    rows="5"

                    placeholder="Enter professional biography..."

                >${escapeHTML(
                    bio
                )}</textarea>

            </div>


            <!-- IMAGE -->

            <div class="form-field">

                <label>
                    Profile Image
                </label>

                <input

                    type="file"

                    id="team-image"

                    accept="image/jpeg,image/png,image/webp"

                >

                <small>
                    JPG, PNG or WEBP. Maximum 5MB.
                </small>

            </div>


            <!-- ORDER -->

            <div class="form-field">

                <label>
                    Display Order
                </label>

                <input

                    type="number"

                    id="team-display-order"

                    value="${Number(
                        displayOrder
                    )}"

                    min="0"

                >

            </div>


            <!-- STATUS -->

            <div class="form-field">

                <label>
                    Status
                </label>

                <select id="team-status">

                    <option
                        value="true"
                        ${status
                            ? "selected"
                            : ""}
                    >

                        Active

                    </option>


                    <option
                        value="false"
                        ${!status
                            ? "selected"
                            : ""}
                    >

                        Inactive

                    </option>

                </select>

            </div>


        </div>

    `;
}


// ============================================================
// GET FORM DATA
// ============================================================

function getTeamFormData() {

    const formData =
        new FormData();


    const name =
        document.getElementById(
            "team-name"
        );


    const position =
        document.getElementById(
            "team-position"
        );


    const department =
        document.getElementById(
            "team-department"
        );


    const bio =
        document.getElementById(
            "team-bio"
        );


    const image =
        document.getElementById(
            "team-image"
        );


    const displayOrder =
        document.getElementById(
            "team-display-order"
        );


    const status =
        document.getElementById(
            "team-status"
        );


    formData.append(
        "name",
        name?.value.trim() || ""
    );


    formData.append(
        "position",
        position?.value.trim() || ""
    );


    formData.append(
        "department",
        department?.value.trim() || ""
    );


    formData.append(
        "bio",
        bio?.value.trim() || ""
    );


    formData.append(
        "display_order",
        displayOrder?.value || "0"
    );


    formData.append(
        "status",
        status?.value || "true"
    );


    if (
        image &&
        image.files &&
        image.files.length > 0
    ) {

        formData.append(
            "image",
            image.files[0]
        );
    }


    return formData;
}


// ============================================================
// SAVE NEW TEAM
// ============================================================

async function saveNewTeam() {

    const name =
        document.getElementById(
            "team-name"
        );


    const position =
        document.getElementById(
            "team-position"
        );


    if (
        !name ||
        !name.value.trim()
    ) {

        alert(
            "Please enter the team member name."
        );

        return;
    }


    if (
        !position ||
        !position.value.trim()
    ) {

        alert(
            "Please enter the position."
        );

        return;
    }


    try {

        modalSave.disabled = true;

        modalSave.textContent =
            "Saving...";


        const formData =
            getTeamFormData();


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
            "CREATE TEAM RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to create team member"
            );
        }


        closeModal();


        await loadTeams();


        showToast(
            "Team member added successfully."
        );


    } catch (error) {

        console.error(
            "CREATE TEAM ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to create team member"
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent =
            "Save";
    }
}


// ============================================================
// EDIT TEAM
// ============================================================

async function editTeam(id) {

    const teamId =
        Number(id);


    if (
        !Number.isInteger(teamId) ||
        teamId <= 0
    ) {

        alert(
            "Invalid team ID."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${teamId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load team member"
            );
        }


        const team =
            result.data;


        editingTeamId =
            teamId;


        openModal(

            "Edit Team Member",

            "TEAM",

            createTeamForm(team),

            saveEditedTeam

        );


    } catch (error) {

        console.error(
            "EDIT TEAM ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to load team member"
        );
    }
}


// ============================================================
// SAVE EDITED TEAM
// ============================================================

async function saveEditedTeam() {

    if (
        !editingTeamId
    ) {

        alert(
            "Invalid team ID."
        );

        return;
    }


    const name =
        document.getElementById(
            "team-name"
        );


    const position =
        document.getElementById(
            "team-position"
        );


    if (
        !name ||
        !name.value.trim()
    ) {

        alert(
            "Please enter the team member name."
        );

        return;
    }


    if (
        !position ||
        !position.value.trim()
    ) {

        alert(
            "Please enter the position."
        );

        return;
    }


    try {

        modalSave.disabled = true;

        modalSave.textContent =
            "Saving...";


        const formData =
            getTeamFormData();


        const response =
            await fetch(

                `${API_URL}/${editingTeamId}`,

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
                result.message ||
                "Failed to update team member"
            );
        }


        closeModal();


        await loadTeams();


        showToast(
            "Team member updated successfully."
        );


    } catch (error) {

        console.error(
            "UPDATE TEAM ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to update team member"
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent =
            "Save";
    }
}


// ============================================================
// DELETE TEAM
// ============================================================

async function deleteTeam(id) {

    const teamId =
        Number(id);


    if (
        !Number.isInteger(teamId) ||
        teamId <= 0
    ) {

        alert(
            "Invalid team ID."
        );

        return;
    }


    const team =
        teamsData.find(
            item =>
                Number(item.id) === teamId
        );


    const name =
        team
            ? team.name
            : "this team member";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${name}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(

                `${API_URL}/${teamId}`,

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
                result.message ||
                "Failed to delete team member"
            );
        }


        await loadTeams();


        showToast(
            "Team member deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE TEAM ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to delete team member"
        );
    }
}


// ============================================================
// OPEN MODAL
// ============================================================

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


    document.body.classList.add(
        "modal-open"
    );


    setTimeout(
        () => {

            const input =
                document.getElementById(
                    "team-name"
                );


            if (input) {

                input.focus();

            }

        },

        100
    );
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


    modalBody.innerHTML =
        "";


    currentSaveFunction =
        null;


    editingTeamId =
        null;
}


// ============================================================
// SAVE BUTTON
// ============================================================

if (modalSave) {

    modalSave.addEventListener(
        "click",

        async () => {

            if (
                typeof currentSaveFunction !==
                "function"
            ) {

                alert(
                    "Save function is not defined."
                );

                return;
            }


            try {

                await currentSaveFunction();

            } catch (error) {

                console.error(
                    "SAVE ERROR:",
                    error
                );

            }

        }
    );
}


// ============================================================
// CANCEL
// ============================================================

if (modalCancel) {

    modalCancel.addEventListener(
        "click",
        closeModal
    );
}


// ============================================================
// CLOSE
// ============================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );
}


// ============================================================
// OUTSIDE MODAL
// ============================================================

if (modalBackdrop) {

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
}


// ============================================================
// ESC
// ============================================================

document.addEventListener(

    "keydown",

    event => {

        if (

            event.key === "Escape" &&

            modalBackdrop &&

            modalBackdrop.classList.contains(
                "show"
            )

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
        renderTeams
    );

}


// ============================================================
// ADD
// ============================================================

if (addTeamButton) {

    addTeamButton.addEventListener(
        "click",
        addTeam
    );

}


// ============================================================
// REFRESH
// ============================================================

if (refreshButton) {

    refreshButton.addEventListener(

        "click",

        async () => {

            await loadTeams();

            showToast(
                "Teams refreshed."
            );

        }

    );

}


// ============================================================
// TABLE ACTIONS
// ============================================================

if (teamBody) {

    teamBody.addEventListener(

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


            if (
                action === "edit"
            ) {

                editTeam(id);

            }


            if (
                action === "delete"
            ) {

                deleteTeam(id);

            }

        }

    );
}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

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


// ============================================================
// HTML ESCAPING
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


function escapeAttribute(value) {

    return escapeHTML(value);

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadTeams();