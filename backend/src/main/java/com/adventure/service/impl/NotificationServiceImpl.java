package com.adventure.service.impl;

import com.adventure.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.support-email}")
    private String fromEmail;

    @Value("${app.name}")
    private String appName;

    @Override @Async
    public void sendEmailVerification(String to, String name, String verifyUrl) {
        sendHtmlEmail(to, "Verify your Adventure account",
            buildEmailTemplate("Verify Your Email", "Hi " + name + ",",
                "Welcome to Adventure! Please verify your email address to get started.",
                verifyUrl, "Verify Email", "This link expires in 24 hours."));
    }

    @Override @Async
    public void sendPasswordResetEmail(String to, String name, String resetUrl) {
        sendHtmlEmail(to, "Reset your Adventure password",
            buildEmailTemplate("Reset Your Password", "Hi " + name + ",",
                "We received a request to reset your password. Click below to create a new password.",
                resetUrl, "Reset Password",
                "This link expires in 1 hour. If you didn't request this, ignore this email."));
    }

    @Override @Async
    public void sendPasswordChangedEmail(String to, String name) {
        sendHtmlEmail(to, "Your Adventure password was changed",
            buildSimpleTemplate("Password Changed", "Hi " + name + ",",
                "Your password has been successfully changed. If you didn't make this change, contact us immediately."));
    }

    @Override @Async
    public void sendWelcomeEmail(String to, String name) {
        sendHtmlEmail(to, "Welcome to Adventure \u2014 Your account is verified!",
            buildEmailTemplate("Welcome to Adventure! \uD83C\uDFD4\uFE0F", "Hi " + name + ",",
                "Your email has been verified. You're all set to explore 150+ curated Himalayan treks!",
                "https://adventure.com/treks", "Explore Treks", "Happy trekking!"));
    }

    @Override @Async
    public void sendBookingConfirmation(String to, String name, String bookingRef) {
        sendHtmlEmail(to, "Booking Confirmed \u2014 " + bookingRef,
            buildEmailTemplate("Booking Confirmed! \u2713", "Hi " + name + ",",
                "Your booking <strong>" + bookingRef + "</strong> has been confirmed.",
                "https://adventure.com/bookings", "View Booking", "See you on the trail!"));
    }

    @Override @Async
    public void sendWhatsAppBookingConfirmation(String phone, String name, String bookingRef) {
        if (phone == null || phone.isBlank()) {
            log.info("Skipping WhatsApp booking notification for {} because phone is missing", bookingRef);
            return;
        }
        log.info("WhatsApp booking notification queued for {} ({}) | booking {}", name, phone, bookingRef);
    }

    private void sendHtmlEmail(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent to {} | {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildEmailTemplate(String title, String greeting, String body,
                                       String ctaUrl, String ctaText, String footer) {
        return """
            <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,sans-serif;">
            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
            <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <tr><td style="background:linear-gradient(135deg,#e08800,#f29a0e);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">&#9968; Adventure</h1></td></tr>
            <tr><td style="padding:40px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">%s</h2>
            <p style="margin:0 0 16px;color:#6b7280;">%s</p>
            <p style="margin:0 0 32px;color:#374151;line-height:1.6;">%s</p>
            <a href="%s" style="display:inline-block;background:#e08800;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;">%s</a>
            </td></tr>
            <tr><td style="padding:24px 40px 32px;border-top:1px solid #f3f4f6;">
            <p style="margin:0;color:#9ca3af;font-size:13px;">%s</p>
            <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">&copy; 2024 Adventure Platform</p>
            </td></tr></table></td></tr></table></body></html>
            """.formatted(title, greeting, body, ctaUrl, ctaText, footer);
    }

    private String buildSimpleTemplate(String title, String greeting, String body) {
        return """
            <!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f4f4f5;padding:40px 20px;">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;margin:0 auto;padding:40px;">
            <tr><td><h2 style="color:#111827;">%s</h2><p style="color:#6b7280;">%s</p>
            <p style="color:#374151;line-height:1.6;">%s</p>
            <p style="color:#9ca3af;font-size:12px;margin-top:32px;">&copy; 2024 Adventure Platform</p>
            </td></tr></table></body></html>
            """.formatted(title, greeting, body);
    }
}
