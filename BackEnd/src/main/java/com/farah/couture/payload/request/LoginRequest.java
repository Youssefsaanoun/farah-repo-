package com.farah.couture.payload.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
