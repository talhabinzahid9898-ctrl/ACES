"use strict";


// ============================================================
// API
// ============================================================

const API_URL = "/api/blogs";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let blogsData = [];

let editingBlogId = null;

let currentSaveFunction = null;


// ============================================================
// DOM
// ============================================================

const blogBody =
    document.getElementById("blog-body");

const searchInput =
    document.getElementById("search");

const addBlogButton =
    document.getElementById("add-blog");

const refreshButton =
    document.getElementById("refresh-blogs");

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
// LOAD BLOGS
// ============================================================

async function loadBlogs() {

    try {

        if (blogBody) {

            blogBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            padding:40px;
                        ">

                        Loading blogs...

                    </td>

                </tr>

            `;
        }


        const response =
            await fetch(API_URL);


        const result =
            await response.json();


        console.log(
            "GET BLOGS RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load blogs"
            );
        }


        blogsData =
            Array.isArray(result.data)
                ? result.data
                : [];


        renderBlogs();


    } catch (error) {

        console.error(
            "LOAD BLOGS ERROR:",
            error
        );


        if (blogBody) {

            blogBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        style="
                            text-align:center;
                            padding:40px;
                        ">

                        Failed to load blogs.

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
// RENDER BLOGS
// ============================================================

function renderBlogs() {

    if (!blogBody) {

        console.error(
            "blog-body was not found"
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
        blogsData;


    if (searchValue) {

        filtered =
            blogsData.filter(blog => {

                return (

                    String(
                        blog.title || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        blog.category || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        blog.author || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                    ||

                    String(
                        blog.slug || ""
                    )
                        .toLowerCase()
                        .includes(searchValue)

                );

            });
    }


    if (filtered.length === 0) {

        blogBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:40px;
                    ">

                    No blogs found.

                </td>

            </tr>

        `;

        return;
    }


    blogBody.innerHTML =
        filtered
            .map(blog => {


                // =================================================
                // IMAGE
                // =================================================

                const imageHTML =
                    blog.featured_image

                        ? `

                            <img

                                src="${escapeAttribute(
                                    blog.featured_image
                                )}"

                                alt="${escapeAttribute(
                                    blog.title
                                )}"

                                style="
                                    width:70px;
                                    height:50px;
                                    object-fit:cover;
                                    border-radius:6px;
                                "

                            >

                        `

                        : `

                            <span>
                                No Image
                            </span>

                        `;


                // =================================================
                // STATUS
                // =================================================

                const statusHTML =
                    blog.status

                        ? `

                            <span class="status-badge published">
                                Published
                            </span>

                        `

                        : `

                            <span class="status-badge draft">
                                Draft
                            </span>

                        `;


                // =================================================
                // FEATURED
                // =================================================

                const featuredHTML =
                    blog.is_featured

                        ? `

                            <span class="status-badge published">
                                Yes
                            </span>

                        `

                        : `

                            <span class="status-badge draft">
                                No
                            </span>

                        `;


                // =================================================
                // DATE
                // =================================================

                const publishedDate =
                    blog.published_at
                        ? formatDate(
                            blog.published_at
                        )
                        : "-";


                // =================================================
                // VIDEO
                // =================================================

                const videoHTML =
                    blog.video_url

                        ? `

                            <span
                                title="Video available"
                                style="
                                    margin-left:6px;
                                ">

                                🎥

                            </span>

                        `

                        : "";


                // =================================================
                // ROW
                // =================================================

                return `

                    <tr>


                        <td>

                            ${imageHTML}

                            ${videoHTML}

                        </td>


                        <td>

                            <strong>

                                ${escapeHTML(
                                    blog.title
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                blog.category || "-"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                blog.author || "-"
                            )}

                        </td>


                        <td>

                            ${statusHTML}

                        </td>


                        <td>

                            ${featuredHTML}

                        </td>


                        <td>

                            ${publishedDate}

                        </td>


                        <td>

                            <div class="actions">


                                <button

                                    type="button"

                                    class="action-btn"

                                    data-action="edit"

                                    data-id="${Number(
                                        blog.id
                                    )}"

                                    title="Edit">

                                    ✎

                                </button>


                                <button

                                    type="button"

                                    class="action-btn delete"

                                    data-action="delete"

                                    data-id="${Number(
                                        blog.id
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
// ADD BLOG
// ============================================================

function addBlog() {

    editingBlogId = null;


    const form =
        createBlogForm();


    openModal(

        "Add Blog",

        "BLOG",

        form,

        saveNewBlog

    );
}


// ============================================================
// BLOG FORM
// ============================================================

function createBlogForm(blog = null) {


    const title =
        blog?.title || "";


    const slug =
        blog?.slug || "";


    const excerpt =
        blog?.excerpt || "";


    const content =
        blog?.content || "";


    const category =
        blog?.category || "";


    const author =
        blog?.author || "";


    const publishedAt =
        formatDateForInput(
            blog?.published_at
        );


    const status =
        blog
            ? Boolean(blog.status)
            : true;


    const featured =
        blog
            ? Boolean(blog.is_featured)
            : false;


    return `

        <div class="form-grid">


            <!-- =================================================
                 TITLE
            ================================================== -->

            <div class="form-field">

                <label>
                    Title *
                </label>

                <input

                    type="text"

                    id="blog-title"

                    placeholder="Enter blog title"

                    value="${escapeAttribute(
                        title
                    )}"

                >

            </div>


            <!-- =================================================
                 SLUG
            ================================================== -->

            <div class="form-field">

                <label>
                    Slug *
                </label>

                <input

                    type="text"

                    id="blog-slug"

                    placeholder="example-blog-title"

                    value="${escapeAttribute(
                        slug
                    )}"

                >

            </div>


            <!-- =================================================
                 CATEGORY
            ================================================== -->

            <div class="form-field">

                <label>
                    Category *
                </label>

                <input

                    type="text"

                    id="blog-category"

                    placeholder="Architecture"

                    value="${escapeAttribute(
                        category
                    )}"

                >

            </div>


            <!-- =================================================
                 AUTHOR
            ================================================== -->

            <div class="form-field">

                <label>
                    Author *
                </label>

                <input

                    type="text"

                    id="blog-author"

                    placeholder="Author name"

                    value="${escapeAttribute(
                        author
                    )}"

                >

            </div>


            <!-- =================================================
                 EXCERPT
            ================================================== -->

            <div class="form-field">

                <label>
                    Excerpt *
                </label>

                <textarea

                    id="blog-excerpt"

                    rows="4"

                    placeholder="Short description of the blog..."

                >${escapeHTML(
                    excerpt
                )}</textarea>

            </div>


            <!-- =================================================
                 CONTENT
            ================================================== -->

            <div class="form-field">

                <label>
                    Content *
                </label>

                <textarea

                    id="blog-content"

                    rows="8"

                    placeholder="Write your blog content..."

                >${escapeHTML(
                    content
                )}</textarea>

            </div>


            <!-- =================================================
                 FEATURED IMAGE
            ================================================== -->

            <div class="form-field">

                <label>
                    Featured Image ${blog ? "" : "*"}
                </label>

                <input

                    type="file"

                    id="featured-image"

                    accept="image/jpeg,image/png,image/webp"

                >


                <small>

                    ${
                        blog?.featured_image

                            ? "Current image will remain if no new image is selected."

                            : "JPG, PNG or WEBP. Image is required."
                    }

                </small>

            </div>


            <!-- =================================================
                 VIDEO
            ================================================== -->

            <div class="form-field">

                <label>
                    Video
                </label>

                <input

                    type="file"

                    id="blog-video"

                    accept="video/mp4,video/webm,video/quicktime"

                >


                <small>

                    ${
                        blog?.video_url

                            ? "Current video will remain if no new video is selected."

                            : "Optional. MP4, WEBM or MOV."
                    }

                </small>


                ${
                    blog?.video_url

                        ? `

                            <div
                                style="
                                    margin-top:10px;
                                ">

                                <video
                                    src="${escapeAttribute(
                                        blog.video_url
                                    )}"

                                    controls

                                    style="
                                        width:100%;
                                        max-height:220px;
                                        border-radius:8px;
                                    "
                                >
                                </video>

                            </div>

                        `

                        : ""

                }

            </div>


            <!-- =================================================
                 PUBLISHED DATE
            ================================================== -->

            <div class="form-field">

                <label>
                    Published Date *
                </label>

                <input

                    type="datetime-local"

                    id="published-at"

                    value="${publishedAt}"

                >

            </div>


            <!-- =================================================
                 STATUS
            ================================================== -->

            <div class="form-field">

                <label>
                    Status *
                </label>

                <select id="blog-status">

                    <option
                        value="true"
                        ${status ? "selected" : ""}
                    >

                        Published

                    </option>


                    <option
                        value="false"
                        ${!status ? "selected" : ""}
                    >

                        Draft

                    </option>

                </select>

            </div>


            <!-- =================================================
                 FEATURED
            ================================================== -->

            <div class="form-field">

                <label>
                    Featured
                </label>

                <select id="blog-featured">

                    <option
                        value="false"
                        ${!featured ? "selected" : ""}
                    >

                        No

                    </option>


                    <option
                        value="true"
                        ${featured ? "selected" : ""}
                    >

                        Yes

                    </option>

                </select>

            </div>


        </div>

    `;
}


// ============================================================
// GET BLOG FORM DATA
// ============================================================

function getBlogFormData() {

    const formData =
        new FormData();


    const title =
        document.getElementById(
            "blog-title"
        );


    const slug =
        document.getElementById(
            "blog-slug"
        );


    const category =
        document.getElementById(
            "blog-category"
        );


    const author =
        document.getElementById(
            "blog-author"
        );


    const excerpt =
        document.getElementById(
            "blog-excerpt"
        );


    const content =
        document.getElementById(
            "blog-content"
        );


    const image =
        document.getElementById(
            "featured-image"
        );


    const video =
    document.getElementById("blog-video");

if (
    video &&
    video.files &&
    video.files.length > 0
) {

    const maxVideoSize =
        100 * 1024 * 1024;

    const videoFile =
        video.files[0];

    if (videoFile.size > maxVideoSize) {

        alert(
            "Video size must not exceed 100 MB."
        );

        video.value = "";

        video.focus();

        return false;
    }
}


    const publishedAt =
        document.getElementById(
            "published-at"
        );


    const status =
        document.getElementById(
            "blog-status"
        );


    const featured =
        document.getElementById(
            "blog-featured"
        );


    formData.append(
        "title",
        title?.value.trim() || ""
    );


    formData.append(
        "slug",
        slug?.value.trim() || ""
    );


    formData.append(
        "category",
        category?.value.trim() || ""
    );


    formData.append(
        "author",
        author?.value.trim() || ""
    );


    formData.append(
        "excerpt",
        excerpt?.value.trim() || ""
    );


    formData.append(
        "content",
        content?.value.trim() || ""
    );


    formData.append(
        "published_at",
        publishedAt?.value || ""
    );


    formData.append(
        "status",
        status?.value || "true"
    );


    formData.append(
        "is_featured",
        featured?.value || "false"
    );


    // ========================================================
    // IMAGE
    // ========================================================

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

    // ========================================================
    // VIDEO
    // IMPORTANT:
    // Video is optional.
    // Only append it when selected.
    // ========================================================

    if (
        video &&
        video.files &&
        video.files.length > 0
    ) {

        formData.append(
            "video",
            video.files[0]
        );
    }


    return formData;
}


// ============================================================
// VALIDATE BLOG
// ============================================================

function validateBlogForm() {

    const title =
        document.getElementById(
            "blog-title"
        );


    const slug =
        document.getElementById(
            "blog-slug"
        );


    const category =
        document.getElementById(
            "blog-category"
        );


    const author =
        document.getElementById(
            "blog-author"
        );


    const excerpt =
        document.getElementById(
            "blog-excerpt"
        );


    const content =
        document.getElementById(
            "blog-content"
        );


    const publishedAt =
        document.getElementById(
            "published-at"
        );


    // ========================================================
    // TITLE
    // ========================================================

    if (
        !title ||
        !title.value.trim()
    ) {

        alert(
            "Please enter the blog title."
        );

        title?.focus();

        return false;
    }


    // ========================================================
    // SLUG
    // ========================================================

    if (
        !slug ||
        !slug.value.trim()
    ) {

        const generatedSlug =
            title.value
                .toLowerCase()
                .trim()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );


        slug.value =
            generatedSlug;


        if (!slug.value) {

            alert(
                "Please enter a valid slug."
            );

            slug.focus();

            return false;
        }
    }


    // ========================================================
    // CATEGORY
    // ========================================================

    if (
        !category ||
        !category.value.trim()
    ) {

        alert(
            "Please enter the blog category."
        );

        category?.focus();

        return false;
    }


    // ========================================================
    // AUTHOR
    // ========================================================

    if (
        !author ||
        !author.value.trim()
    ) {

        alert(
            "Please enter the author name."
        );

        author?.focus();

        return false;
    }


    // ========================================================
    // EXCERPT
    // ========================================================

    if (
        !excerpt ||
        !excerpt.value.trim()
    ) {

        alert(
            "Please enter the blog excerpt."
        );

        excerpt?.focus();

        return false;
    }


    // ========================================================
    // CONTENT
    // ========================================================

    if (
        !content ||
        !content.value.trim()
    ) {

        alert(
            "Please enter the blog content."
        );

        content?.focus();

        return false;
    }


    // ========================================================
    // IMAGE
    // ========================================================

    const image =
        document.getElementById(
            "featured-image"
        );


    /*
     * Image is required ONLY when creating.
     *
     * During editing the existing image can remain.
     */

    if (
        !editingBlogId &&
        (
            !image ||
            !image.files ||
            image.files.length === 0
        )
    ) {

        alert(
            "Please select a featured image."
        );

        image?.focus();

        return false;
    }


    // ========================================================
    // PUBLISHED DATE
    // ========================================================

    if (
        !publishedAt ||
        !publishedAt.value
    ) {

        alert(
            "Please select the published date."
        );

        publishedAt?.focus();

        return false;
    }


    /*
     * VIDEO IS NOT CHECKED HERE.
     *
     * Therefore video is completely optional.
     */


    return true;
}


// ============================================================
// SAVE NEW BLOG
// ============================================================

async function saveNewBlog() {

    if (!validateBlogForm()) {

        return;
    }


    try {

        modalSave.disabled = true;

        modalSave.textContent =
            "Saving...";


        const formData =
            getBlogFormData();


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
            "CREATE BLOG RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to create blog"
            );
        }


        closeModal();


        await loadBlogs();


        showToast(
            "Blog created successfully."
        );


    } catch (error) {

        console.error(
            "CREATE BLOG ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to create blog"
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent =
            "Save";
    }
}


// ============================================================
// EDIT BLOG
// ============================================================

async function editBlog(id) {

    const blogId =
        Number(id);


    if (
        !Number.isInteger(blogId) ||
        blogId <= 0
    ) {

        alert(
            "Invalid blog ID."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${blogId}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load blog"
            );
        }


        const blog =
            result.data;


        if (!blog) {

            throw new Error(
                "Blog not found."
            );
        }


        editingBlogId =
            blogId;


        openModal(

            "Edit Blog",

            "EDIT BLOG",

            createBlogForm(blog),

            saveEditedBlog

        );


    } catch (error) {

        console.error(
            "EDIT BLOG ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to load blog"
        );
    }
}


// ============================================================
// SAVE EDITED BLOG
// ============================================================

async function saveEditedBlog() {

    if (!editingBlogId) {

        alert(
            "Invalid blog ID."
        );

        return;
    }


    if (!validateBlogForm()) {

        return;
    }


    try {

        modalSave.disabled = true;

        modalSave.textContent =
            "Updating...";


        const formData =
            getBlogFormData();


        const response =
            await fetch(

                `${API_URL}/${editingBlogId}`,

                {

                    method:
                        "PUT",

                    body:
                        formData

                }

            );


        const result =
            await response.json();


        console.log(
            "UPDATE BLOG RESPONSE:",
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to update blog"
            );
        }


        closeModal();


        await loadBlogs();


        showToast(
            "Blog updated successfully."
        );


    } catch (error) {

        console.error(
            "UPDATE BLOG ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to update blog"
        );


    } finally {

        modalSave.disabled = false;

        modalSave.textContent =
            "Save";
    }
}


// ============================================================
// DELETE BLOG
// ============================================================

async function deleteBlog(id) {

    const blogId =
        Number(id);


    if (
        !Number.isInteger(blogId) ||
        blogId <= 0
    ) {

        alert(
            "Invalid blog ID."
        );

        return;
    }


    const blog =
        blogsData.find(
            item =>
                Number(item.id) === blogId
        );


    const title =
        blog
            ? blog.title
            : "this blog";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${title}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(

                `${API_URL}/${blogId}`,

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
                "Failed to delete blog"
            );
        }


        await loadBlogs();


        showToast(
            "Blog deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE BLOG ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to delete blog"
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
                    "blog-title"
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


    editingBlogId =
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
// CLOSE BUTTON
// ============================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );
}


// ============================================================
// CLICK OUTSIDE MODAL
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
// ESCAPE
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

        renderBlogs

    );

}


// ============================================================
// ADD BLOG
// ============================================================

if (addBlogButton) {

    addBlogButton.addEventListener(

        "click",

        addBlog

    );

}


// ============================================================
// REFRESH
// ============================================================

if (refreshButton) {

    refreshButton.addEventListener(

        "click",

        async () => {

            await loadBlogs();

            showToast(
                "Blogs refreshed."
            );

        }

    );

}


// ============================================================
// TABLE ACTIONS
// ============================================================

if (blogBody) {

    blogBody.addEventListener(

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

                editBlog(id);

            }


            if (
                action === "delete"
            ) {

                deleteBlog(id);

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


// ============================================================
// ATTRIBUTE ESCAPING
// ============================================================

function escapeAttribute(value) {

    return escapeHTML(value);

}


// ============================================================
// DATE FORMAT
// ============================================================

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

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );
}


// ============================================================
// DATETIME INPUT
// ============================================================

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


    const hours =
        String(
            d.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minutes =
        String(
            d.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}T${hours}:${minutes}`;
}


// ============================================================
// INITIAL LOAD
// ============================================================

loadBlogs();