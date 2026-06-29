package com.kmrs.payment.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
  @Id
  private UUID id;

  @Column(nullable = false, length = 16)
  private String method;

  @Column(nullable = false)
  private String path;

  @Column(name = "query_string")
  private String queryString;

  @Column(name = "status_code", nullable = false)
  private int statusCode;

  @Column(name = "duration_ms", nullable = false)
  private long durationMs;

  @Column(name = "client_ip")
  private String clientIp;

  @Column(name = "user_agent")
  private String userAgent;

  @Column(name = "request_id")
  private String requestId;

  @Column(name = "error_message")
  private String errorMessage;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected AuditLog() {}

  public AuditLog(
      String method,
      String path,
      String queryString,
      int statusCode,
      long durationMs,
      String clientIp,
      String userAgent,
      String requestId,
      String errorMessage) {
    this.id = UUID.randomUUID();
    this.method = method;
    this.path = path;
    this.queryString = queryString;
    this.statusCode = statusCode;
    this.durationMs = durationMs;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
    this.requestId = requestId;
    this.errorMessage = errorMessage;
    this.createdAt = Instant.now();
  }

  public UUID getId() {
    return id;
  }

  public String getMethod() {
    return method;
  }

  public String getPath() {
    return path;
  }

  public String getQueryString() {
    return queryString;
  }

  public int getStatusCode() {
    return statusCode;
  }

  public long getDurationMs() {
    return durationMs;
  }

  public String getClientIp() {
    return clientIp;
  }

  public String getUserAgent() {
    return userAgent;
  }

  public String getRequestId() {
    return requestId;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
