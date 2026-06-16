package com.trello.backend.auth.refresh;

import java.time.Duration;

public record IssuedRefreshToken(String token, Duration ttl) {
}
