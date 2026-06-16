package com.trello.backend.config;

import com.trello.backend.auth.jwt.JwtService;
import com.trello.backend.boardmember.BoardMemberService;
import io.jsonwebtoken.JwtException;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
public class WebSocketSecurityInterceptor implements ChannelInterceptor {
    private final JwtService jwtService;
    private final BoardMemberService memberService;

    public WebSocketSecurityInterceptor(JwtService jwtService, BoardMemberService memberService) {
        this.jwtService = jwtService;
        this.memberService = memberService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            UUID userId = userIdFromToken(accessor);
            UUID boardId = boardIdFromDestination(accessor.getDestination());
            memberService.requireAccess(boardId, userId);
        }
        return message;
    }

    private UUID userIdFromToken(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        String token = null;
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else if (accessor.getSessionAttributes() != null) {
            Object tokenAttribute = accessor.getSessionAttributes()
                    .get(AuthCookieHandshakeInterceptor.ACCESS_TOKEN_ATTRIBUTE);
            if (tokenAttribute instanceof String value) {
                token = value;
            }
        }
        if (!StringUtils.hasText(token)) {
            throw new MessagingException("Missing websocket token");
        }
        try {
            return UUID.fromString(jwtService.validateAndGetSubject(token));
        } catch (JwtException | IllegalArgumentException ex) {
            throw new MessagingException("Invalid websocket token", ex);
        }
    }

    private UUID boardIdFromDestination(String destination) {
        String prefix = "/topic/boards/";
        if (!StringUtils.hasText(destination) || !destination.startsWith(prefix)) {
            throw new MessagingException("Unsupported subscription");
        }
        try {
            return UUID.fromString(destination.substring(prefix.length()));
        } catch (IllegalArgumentException ex) {
            throw new MessagingException("Invalid board subscription", ex);
        }
    }
}
