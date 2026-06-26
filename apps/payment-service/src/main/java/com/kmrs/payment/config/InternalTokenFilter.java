package com.kmrs.payment.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class InternalTokenFilter extends OncePerRequestFilter {
  private static final String HEADER_NAME = "X-Internal-Service-Token";

  private final String serviceToken;

  public InternalTokenFilter(@Value("${internal.service-token}") String serviceToken) {
    this.serviceToken = serviceToken;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain)
      throws ServletException, IOException {
    String path = request.getRequestURI();

    if (path.startsWith("/actuator/health")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = request.getHeader(HEADER_NAME);
    if (!serviceToken.equals(token)) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType("application/json");
      response.getWriter().write("{\"message\":\"Unauthorized internal service request\"}");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
