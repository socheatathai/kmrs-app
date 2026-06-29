package com.kmrs.payment.audit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuditLogFilter extends OncePerRequestFilter {
  private static final Logger LOGGER = LoggerFactory.getLogger(AuditLogFilter.class);
  private static final String REQUEST_ID_HEADER = "X-Request-Id";

  private final AuditLogService auditLogService;

  public AuditLogFilter(AuditLogService auditLogService) {
    this.auditLogService = auditLogService;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return request.getRequestURI().startsWith("/actuator/health");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {
    long startedAt = System.currentTimeMillis();
    String requestId = request.getHeader(REQUEST_ID_HEADER);
    if (requestId == null || requestId.isBlank()) {
      requestId = UUID.randomUUID().toString();
    }

    Throwable error = null;
    try {
      filterChain.doFilter(request, response);
    } catch (ServletException | IOException | RuntimeException ex) {
      error = ex;
      throw ex;
    } finally {
      int statusCode = error == null ? response.getStatus() : HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
      AuditLog auditLog = new AuditLog(
          request.getMethod(),
          request.getRequestURI(),
          request.getQueryString(),
          statusCode,
          System.currentTimeMillis() - startedAt,
          clientIp(request),
          request.getHeader("User-Agent"),
          requestId,
          error == null ? null : error.getMessage());
      try {
        auditLogService.record(auditLog);
      } catch (RuntimeException auditError) {
        LOGGER.warn("Failed to record audit log requestId={}", requestId, auditError);
      }
    }
  }

  private String clientIp(HttpServletRequest request) {
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (forwardedFor != null && !forwardedFor.isBlank()) {
      return forwardedFor.split(",")[0].trim();
    }

    return request.getRemoteAddr();
  }
}
