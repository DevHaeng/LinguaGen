package com.linguagen.backend.exception;

public class OpenAIException extends RuntimeException {
    public OpenAIException(String message) {
        super(message);
    }

    public OpenAIException(String message, Throwable cause) {
        super(message, cause);
    }
}