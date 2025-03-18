export const due3Days = `
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
            gap: 0.5rem;
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

        <img src="vighnotech_logo.png" class="logo" alt="">

        <div class="content">
            <h1 class="reminder">Reminder: Book Return Due in 3 Days</h1>

            <h1 class="subject">Subject: 📚 Friendly Reminder: Return Your Book by [Return Date]</h1>

            <h1 class="greetings">Dear [User's Name],</h1>

            <p class="message">We hope you're enjoying your borrowed book, "[Book Title]". This is a friendly reminder
                that
                the due date for returning the book is [Return Date], which is just 3 days away.
                To avoid late fees, please return the book on time. If you need an extension, kindly renew your book via
                the
                library portal or visit us in person.</p>

            <h1 class="regards">Happy Reading !</h1>

            <h1 class="library">[Library Name]</h1>
        </div>

        <div class="footer">
            <img src="vighnotech_icon.png" alt="" class="footer-img">

            <div class="social-media-icons">
                <a href=""><i class="fa fa-linkedin"></i></a>
                <a href=""></a><i class="fa fa-instagram"></i></a>
                <a href=""></a><i class="fa fa-facebook"></i></a>
                <a href=""></a><i class="fa fa-twitter"></i></a>
            </div>
        </div>
    </div>
</body>

</html>
`