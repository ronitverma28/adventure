package com.adventure.exception;

public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) { super(message); }
}
