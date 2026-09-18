// Escape HTML
function esc(value) {
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


// Create form field
function field(
    name,
    label,
    value = "",
    placeholder = "",
    textarea = false
) {

    if (textarea) {

        return `
            <div class="form-field full">
                <label for="${name}">${label}</label>

                <textarea
                    id="${name}"
                    name="${name}"
                    placeholder="${placeholder}"
                    rows="5"
                >${esc(value)}</textarea>
            </div>
        `;

    }

    return `
        <div class="form-field">
            <label for="${name}">${label}</label>

            <input
                type="text"
                id="${name}"
                name="${name}"
                value="${esc(value)}"
                placeholder="${placeholder}"
            >
        </div>
    `;
}


// Get values from modal
function modalValues() {

    const values = {};

    document
        .querySelectorAll("#modal-body input, #modal-body textarea")
        .forEach(input => {

            values[input.name] = input.value.trim();

        });

    return values;
}


// Open modal
function openModal(title, eyebrow, body, saveCallback) {

    document.querySelector("#modal-title").textContent = title;

    document.querySelector("#modal-eyebrow").textContent = eyebrow;

    document.querySelector("#modal-body").innerHTML = body;

    document.querySelector("#modal-backdrop").classList.add("show");

    const saveButton =
        document.querySelector("#modal-save");

    // Remove previous click handler
    saveButton.onclick = null;

    saveButton.onclick = async () => {

        await saveCallback();

    };
}


// Close modal
function closeModal() {

    document
        .querySelector("#modal-backdrop")
        .classList.remove("show");
}


// Toast notification
function toast(message) {

    const toastElement =
        document.querySelector("#toast");

    const messageElement =
        document.querySelector("#toast-message");

    if (!toastElement || !messageElement) {
        return;
    }

    messageElement.textContent = message;

    toastElement.classList.add("show");

    setTimeout(() => {

        toastElement.classList.remove("show");

    }, 3000);
}


// Modal close buttons
document.addEventListener("DOMContentLoaded", () => {

    const closeButton =
        document.querySelector("#modal-close");

    const cancelButton =
        document.querySelector("#modal-cancel");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeModal
        );
    }

});