const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value;


        loginButton.disabled = true;

        loginButton.textContent =
            "Checking...";

        loginMessage.textContent = "";

        loginMessage.className =
            "message";


        try {

            const response =
                await fetch("/api/auth/login", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email,
                        password

                    })

                });


            const result =
                await response.json();


            if (!response.ok ||
                !result.success) {

                throw new Error(
                    result.message ||
                    "Login failed"
                );

            }


            /*
            Store email temporarily
            for OTP verification.
            */

            sessionStorage.setItem(
                "otpEmail",
                result.email
            );


            /*
            Move to OTP page
            */

            window.location.href =
                "./otp.html";

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            loginMessage.textContent =
                error.message;


            loginMessage.className =
                "message error";


            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    }
);