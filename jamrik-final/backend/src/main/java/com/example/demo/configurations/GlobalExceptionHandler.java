package com.example.demo.configurations;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        // This is typically thrown when a unique constraint is violated (like duplicate shipmentName)
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "A shipment with this name or reference number already exists. Please use a different one."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR; // Stop disguising system errors as 400 Bad Request

        // Map known exceptions to user-friendly messages
        if (message != null) {
            if (message.contains("Shipment already exists")) {
                message = "A shipment with this reference number already exists. Please use a different one.";
                status = HttpStatus.CONFLICT;
            } else if (message.contains("Shipment not found")) {
                message = "The shipment was not found. It may have already been deleted.";
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("User not found")) {
                message = "Your session has expired. Please log in again.";
                status = HttpStatus.UNAUTHORIZED;
            } else if (message.contains("Document not found")) {
                message = "The document was not found. It may have already been deleted.";
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("No documents found")) {
                message = "This shipment has no documents. Please upload documents first.";
            }
        }

        return ResponseEntity.status(status).body(Map.of("error", message != null ? message : "An unexpected error occurred."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred. Please try again later."));
    }
}
