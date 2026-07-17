
module.exports = ({ title, body }) => `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body{

    margin:0;

    padding:30px;

    background:#f5f6fa;

    font-family:'Segoe UI',Arial,sans-serif;

}

.container{

    max-width:720px;

    margin:auto;

    background:#ffffff;

    border-radius:10px;

    overflow:hidden;

    box-shadow:0 4px 14px rgba(0,0,0,.08);

}

.header{

    background:#E6E6FA;

    padding:20px 30px;

    display:flex;

    align-items:center;

    gap:20px;

    border-bottom:3px solid #6A1B9A;

}

.logo{

    width:80px;

    height:80px;

    object-fit:contain;

    flex-shrink:0;

}

.header-text{

    flex:1;

}

.header-text h2{

    margin:0;

    color:#4A148C;

    font-size:24px;

    font-weight:700;

}

.header-text p{

    margin:6px 0 0 0;

    color:#555;

    font-size:15px;

}

.content{

    padding:30px;

    color:#333;

    line-height:1.7;

}

table{

    width:100%;

    border-collapse:collapse;

    margin:20px 0;

}

td{

    border:1px solid #ececec;

    padding:12px;

}

.label{

    width:35%;

    background:#fafafa;

    font-weight:600;

}

.status{

    display:inline-block;

    background:#FFF3CD;

    color:#856404;

    padding:6px 16px;

    border-radius:20px;

    font-weight:600;

}

.next-step{

    margin-top:25px;

    background:#F8F9FA;

    border-left:4px solid #6A1B9A;

    padding:15px;

}

.footer{

    background:#F4F4F4;

    padding:20px;

    text-align:center;

    color:#666;

    font-size:13px;

}

.footer strong{

    color:#444;

}

</style>

</head>

<body>

<div class="container">

<div class="header">

    <img
        src="cid:iitdhlogo"
        alt="IIT Dharwad Logo"
        class="logo"
    />

    <div class="header-text">

        <h2>Indian Institute of Technology Dharwad</h2>

        <p>Guest House Management System</p>

    </div>

</div>

<div class="content">

<h3>${title}</h3>

${body}

</div>

<div class="footer">

<strong>Guest House Management System</strong><br>

Indian Institute of Technology Dharwad<br><br>

For any assistance, please contact the Guest House Office.<br><br>

This is an automatically generated email.<br>

Please do not reply to this email.

</div>

</div>

</body>

</html>

`;