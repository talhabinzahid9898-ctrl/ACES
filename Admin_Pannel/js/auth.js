const ADMIN_TOKEN =
    localStorage.getItem("acesAdminToken");


/*
If no token exists,
send user to login.
*/

if (!ADMIN_TOKEN) {

    window.location.href =
        "./login.html";

}


/*
========================================================
API FETCH HELPER
========================================================
*/

async function authenticatedFetch(
    url,
    options = {}
) {

    const token =
        localStorage.getItem(
            "acesAdminToken"
        );


    if (!token) {

        window.location.href =
            "./login.html";

        return;

    }


    const headers = {

        ...(options.headers || {}),

        "Authorization":
            `Bearer ${token}`,

        "Content-Type":
            "application/json"

    };


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    /*
    Token expired/invalid
    */

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        logoutAdmin();

        return;

    }


    return response;

}


/*
========================================================
LOGOUT
========================================================
*/

function logoutAdmin() {

    localStorage.removeItem(
        "acesAdminToken"
    );

    localStorage.removeItem(
        "acesAdmin"
    );

    sessionStorage.clear();


    window.location.href =
        "./login.html";

}

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) {
        return;
    }

    logoutBtn.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${localStorage.getItem("acesAdminToken")}`
                        }
                    }
                );

            } catch (error) {

                console.error(
                    "Logout API error:",
                    error
                );

            } finally {

                /*
                 * Always remove local authentication
                 */

                localStorage.removeItem(
                    "acesAdminToken"
                );

                localStorage.removeItem(
                    "acesAdmin"
                );

                sessionStorage.clear();


                /*
                 * Return to login
                 */

                window.location.href =
                    "./login.html";
            }

        }
    );

});