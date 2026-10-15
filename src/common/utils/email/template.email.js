import { EmailSubjectEnums } from '../../enums/index.js';
const templates = {
    [EmailSubjectEnums.CONFIRM_EMAIL]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm your email</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0b0b;margin:0;padding:40px 20px;">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111111;border:1px solid #292929;">
<tr>
<td style="padding:34px 38px 28px;border-bottom:1px solid #292929;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:13px;letter-spacing:3px;font-weight:bold;color:#ffffff;">
Saraha App
</td>
<td align="right" style="font-size:11px;letter-spacing:1px;color:#666666;">
WELCOME
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:46px 38px 20px;">
<div style="font-size:11px;letter-spacing:2px;color:#777777;margin-bottom:14px;">
EMAIL VERIFICATION
</div>
<div style="font-size:30px;line-height:38px;font-weight:600;color:#ffffff;margin-bottom:18px;">
Confirm your email.
</div>
<div style="font-size:15px;line-height:25px;color:#a7a7a7;">
Thanks for creating an account. Enter the verification code below to confirm your email address and finish setting up your account.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px 34px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181818;border:1px solid #303030;">
<tr>
<td align="center" style="padding:30px 20px;">
<div style="font-size:10px;letter-spacing:3px;color:#777777;margin-bottom:14px;">
CONFIRMATION CODE
</div>
<div style="font-size:36px;line-height:44px;letter-spacing:10px;font-weight:600;color:#ffffff;padding-left:10px;">
${data.code}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 38px 42px;">
<div style="font-size:13px;line-height:22px;color:#777777;">
This code will expire in <span style="color:#ffffff;">2 minutes</span>. Enter it in the verification screen to confirm your email address.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px;border-top:1px solid #292929;">
<div style="font-size:11px;line-height:18px;color:#555555;">
If you did not create this account, no further action is required.
</div>
</td>
</tr>
</table>
<div style="max-width:560px;padding-top:18px;text-align:center;font-size:10px;letter-spacing:1px;color:#444444;">
© 2026 Saraha App
</div>
</td>
</tr>
</table>
</body>
</html>
`},
    [EmailSubjectEnums.FORGOT_PASSWORD]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0b0b;margin:0;padding:40px 20px;">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111111;border:1px solid #292929;">
<tr>
<td style="padding:34px 38px 28px;border-bottom:1px solid #292929;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:13px;letter-spacing:3px;font-weight:bold;color:#ffffff;">
Saraha App
</td>
<td align="right" style="font-size:11px;letter-spacing:1px;color:#666666;">
SECURITY
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:46px 38px 20px;">
<div style="font-size:11px;letter-spacing:2px;color:#777777;margin-bottom:14px;">
PASSWORD RECOVERY
</div>
<div style="font-size:30px;line-height:38px;font-weight:600;color:#ffffff;margin-bottom:18px;">
Reset your password.
</div>
<div style="font-size:15px;line-height:25px;color:#a7a7a7;">
We received a request to reset the password associated with your account. Use the verification code below to continue.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px 34px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181818;border:1px solid #303030;">
<tr>
<td align="center" style="padding:30px 20px;">
<div style="font-size:10px;letter-spacing:3px;color:#777777;margin-bottom:14px;">
VERIFICATION CODE
</div>
<div style="font-size:36px;line-height:44px;letter-spacing:10px;font-weight:600;color:#ffffff;padding-left:10px;">
${data.code}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 38px 42px;">
<div style="font-size:13px;line-height:22px;color:#777777;">
This code will expire in <span style="color:#ffffff;">3 minutes</span>. If you did not request a password reset, you can safely ignore this email.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px;border-top:1px solid #292929;">
<div style="font-size:11px;line-height:18px;color:#555555;">
For your security, never share this code with anyone.
</div>
</td>
</tr>
</table>
<div style="max-width:560px;padding-top:18px;text-align:center;font-size:10px;letter-spacing:1px;color:#444444;">
© 2026 Saraha App
</div>
</td>
</tr>
</table>
</body>
</html>
`},
    [EmailSubjectEnums.ENABLE_2FA]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Enable Two-Step Verification</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0b0b;margin:0;padding:40px 20px;">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111111;border:1px solid #292929;">
<tr>
<td style="padding:34px 38px 28px;border-bottom:1px solid #292929;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:13px;letter-spacing:3px;font-weight:bold;color:#ffffff;">
Saraha App
</td>
<td align="right" style="font-size:11px;letter-spacing:1px;color:#666666;">
SECURITY
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:46px 38px 20px;">
<div style="font-size:11px;letter-spacing:2px;color:#777777;margin-bottom:14px;">
TWO-STEP VERIFICATION
</div>
<div style="font-size:30px;line-height:38px;font-weight:600;color:#ffffff;margin-bottom:18px;">
Confirm activation.
</div>
<div style="font-size:15px;line-height:25px;color:#a7a7a7;">
You requested to enable two-step verification on your account. Enter the verification code below to confirm and activate this security feature.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px 34px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181818;border:1px solid #303030;">
<tr>
<td align="center" style="padding:30px 20px;">
<div style="font-size:10px;letter-spacing:3px;color:#777777;margin-bottom:14px;">
ACTIVATION CODE
</div>
<div style="font-size:36px;line-height:44px;letter-spacing:10px;font-weight:600;color:#ffffff;padding-left:10px;">
${data.code}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 38px 42px;">
<div style="font-size:13px;line-height:22px;color:#777777;">
This code will expire in <span style="color:#ffffff;">5 minutes</span>. Enter it to complete the activation of two-step verification on your account.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px;border-top:1px solid #292929;">
<div style="font-size:11px;line-height:18px;color:#555555;">
If you did not request this change, secure your account immediately and do not share this code with anyone.
</div>
</td>
</tr>
</table>
<div style="max-width:560px;padding-top:18px;text-align:center;font-size:10px;letter-spacing:1px;color:#444444;">
© 2026 Saraha App
</div>
</td>
</tr>
</table>
</body>
</html>
`},
    [EmailSubjectEnums.CONFIRM_LOGIN_2FA]: (data) => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Complete your login</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0b0b;margin:0;padding:40px 20px;">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#111111;border:1px solid #292929;">
<tr>
<td style="padding:34px 38px 28px;border-bottom:1px solid #292929;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td style="font-size:13px;letter-spacing:3px;font-weight:bold;color:#ffffff;">
Saraha App
</td>
<td align="right" style="font-size:11px;letter-spacing:1px;color:#666666;">
SECURITY
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:46px 38px 20px;">
<div style="font-size:11px;letter-spacing:2px;color:#777777;margin-bottom:14px;">
SIGN-IN VERIFICATION
</div>
<div style="font-size:30px;line-height:38px;font-weight:600;color:#ffffff;margin-bottom:18px;">
Complete your login.
</div>
<div style="font-size:15px;line-height:25px;color:#a7a7a7;">
A sign-in attempt was made using your account. Enter the verification code below to complete the login.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px 34px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#181818;border:1px solid #303030;">
<tr>
<td align="center" style="padding:30px 20px;">
<div style="font-size:10px;letter-spacing:3px;color:#777777;margin-bottom:14px;">
VERIFICATION CODE
</div>
<div style="font-size:36px;line-height:44px;letter-spacing:10px;font-weight:600;color:#ffffff;padding-left:10px;">
${data.code}
</div>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:0 38px 42px;">
<div style="font-size:13px;line-height:22px;color:#777777;">
This code will expire in <span style="color:#ffffff;">2 minutes</span>. Enter it on the sign-in screen to continue accessing your account.
</div>
</td>
</tr>
<tr>
<td style="padding:22px 38px;border-top:1px solid #292929;">
<div style="font-size:11px;line-height:18px;color:#555555;">
If you did not attempt to login, do not share this code and secure your account immediately.
</div>
</td>
</tr>
</table>
<div style="max-width:560px;padding-top:18px;text-align:center;font-size:10px;letter-spacing:1px;color:#444444;">
© 2026 Saraha App
</div>
</td>
</tr>
</table>
</body>
</html>
`}
}
export const verifyEmailTemplate = (data) => {
    return templates[data.subject](data)
}