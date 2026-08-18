<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require '../js/mailer/Exception.php';
require '../js/mailer/PHPMailer.php';
require '../js/mailer/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $subject = htmlspecialchars($_POST['subject']);
    $message = htmlspecialchars($_POST['message']);

    $mail = new PHPMailer(true);

    try {

        // SMTP Settings
        $mail->isSMTP();
        $mail->Host       = 'mail.acespak.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'info@acespak.com';          // Your Gmail
        $mail->Password   = 'YOUR_16_CHARACTER_APP_PASSWORD'; // Gmail App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Enable this only if debugging
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;

        // Sender
        $mail->setFrom('info@acespak.com', 'ACES Website');

        // Receiver
        $mail->addAddress('info@acespak.com', 'ACES');

        // Reply To
        $mail->addReplyTo($email, $name);

        // Email Content
        $mail->isHTML(true);
        $mail->Subject = empty($subject) ? 'New Contact Form Message' : $subject;

        $mail->Body = "
        <h2>New Contact Form Submission</h2>

        <table border='1' cellpadding='10' cellspacing='0' width='100%'>
            <tr>
                <th align='left'>Name</th>
                <td>{$name}</td>
            </tr>

            <tr>
                <th align='left'>Email</th>
                <td>{$email}</td>
            </tr>

            <tr>
                <th align='left'>Subject</th>
                <td>{$subject}</td>
            </tr>

            <tr>
                <th align='left'>Message</th>
                <td>" . nl2br($message) . "</td>
            </tr>
        </table>
        ";

        $mail->AltBody =
            "Name: $name\n" .
            "Email: $email\n" .
            "Subject: $subject\n\n" .
            "Message:\n$message";

        $mail->send();

        echo "success";

    } catch (Exception $e) {

        echo "Mailer Error: " . $mail->ErrorInfo;

    }

} else {

    echo "Invalid Request";

}