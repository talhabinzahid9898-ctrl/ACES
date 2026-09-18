const otpForm =
    document.getElementById("otpForm");

const otpInput =
    document.getElementById("otp");

const verifyButton =
    document.getElementById("verifyButton");

const otpMessage =
    document.getElementById("otpMessage");


const email =
    sessionStorage.getItem("otpEmail");


/*
If there is no email,
return to login.
*/

if (!email) {

    window.location.href =
        "./login.html";

}


/*
Only allow numbers.
*/

otpInput.addEventListener(
    "input",
    function () {

        this.value =
            this.value
                .replace(/\D/g, "")
                .slice(0, 6);

    }
);


/*
========================================================
VERIFY OTP
========================================================
*/

otpForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const otp =
            otpInput.value.trim();


        if (otp.length !== 6) {

            showMessage(
                "Please enter the 6-digit OTP.",
                "error"
            );

            return;

        }


        verifyButton.disabled = true;

        verifyButton.textContent =
            "Verifying...";


        try {

            const response =
                await fetch(
                    "/api/auth/verify-otp",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email,
                            otp

                        })

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
                    "OTP verification failed"
                );

            }


            /*
            Login successful.
            */

            localStorage.setItem(
                "acesAdminToken",
                result.token
            );


            localStorage.setItem(
                "acesAdmin",
                JSON.stringify(
                    result.admin
                )
            );


            /*
            Remove temporary email.
            */

            sessionStorage.removeItem(
                "otpEmail"
            );


            /*
            Open dashboard.
            */

            window.location.href =
                "./dashboard.html";

        }

        catch (error) {

            console.error(
                "OTP ERROR:",
                error
            );


            showMessage(
                error.message,
                "error"
            );


            verifyButton.disabled =
                false;

            verifyButton.textContent =
                "Verify OTP";

        }

    }
);


/*
========================================================
MESSAGE
========================================================
*/

function showMessage(
    message,
    type
) {

    otpMessage.textContent =
        message;

    otpMessage.className =
        `message ${type}`;

}


/*
========================================================
BACK TO LOGIN
========================================================
*/

function goBackToLogin() {

    sessionStorage.removeItem(
        "otpEmail"
    );

    window.location.href =
        "./login.html";

}