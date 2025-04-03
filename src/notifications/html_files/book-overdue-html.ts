export const bookOverDue = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Return In 3 Days</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

        body {
            font-family: "Roboto", sans-serif;
            background-color: #F6FBFE;
        }

        .mail-content {
            margin: 8rem auto;
            padding: 1rem 2rem;
            width: fit-content;
            background-color: #ffffff;
        }

        .logo {
            width: 10rem;
            height: 3rem;
            margin: 0 0 1rem;
        }

        .content {
            width: 46.2rem;
            color: #474B53;
        }

        h1 {
            font-weight: 400;
            font-size: 0.9rem;
        }

        p {
            font-size: 0.9rem;
        }

        .reminder {
            font-size: 1.1rem;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            padding: 0.3rem 1rem 0.3rem 0;
            border-bottom: 1px solid rgb(205, 204, 204);
        }

        .footer-img {
            width: 3rem;
            height: 3rem;
            cursor: pointer;
        }

        .social-media-icons {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 1.2rem;
            margin: 0.2rem 0 0;
        }

        .social-media-icons a {
            color: black;
        }

        .social-media-icons i {
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="mail-content">

        <img src="../images/vighnotech_logo.png" class="logo" alt="">

        <div class="content">
            <h1 class="reminder">Reminder: Late Fee Notification (Weekly Reminder)</h1>

            <h1 class="subject">Subject: ⚠️ Overdue Book Alert – Late Fee Applies</h1>

            <h1 class="greetings">Dear [User's Name],</h1>

            <p class="message">We noticed that your borrowed book, "[Book Title]", was due on [Return Date] and has not been returned yet. As of today, a late fee of ₹[Total Fine] has been applied to your account. 📢 Late Fee Policy: ₹[Fine Amount] per day after the due date. To avoid further penalties, please return the book at your earliest convenience. If you have already returned it, kindly ignore this email.
            </p>

            <h1 class="regards">Best Regards,</h1>

            <h1 class="library">[Library Name]</h1>
        </div>

        <div class="footer">
            <img src="../images/vighnotech_icon.png" alt="" class="footer-img">

            <div class="social-media-icons">
                <a href="https://www.linkedin.com/"><i class="fa fa-linkedin"></i></a>
                <a href="https://www.instagram.com/"><i class="fa fa-instagram"></i></a>
                <a href="https://www.facebook.com/"><i class="fa fa-facebook"></i></a>
                <a href="https://www.x.com/"><i class="fa fa-twitter"></i></a>
            </div>
        </div>
    </div>
</body>

</html>`