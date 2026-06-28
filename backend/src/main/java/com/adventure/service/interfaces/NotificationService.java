package com.adventure.service.interfaces;

public interface NotificationService {
    void sendEmailVerification(String to, String name, String verifyUrl);
    void sendPasswordResetEmail(String to, String name, String resetUrl);
    void sendPasswordChangedEmail(String to, String name);
    void sendWelcomeEmail(String to, String name);
    void sendBookingConfirmation(String to, String name, String bookingRef);
    void sendWhatsAppBookingConfirmation(String phone, String name, String bookingRef);
}
