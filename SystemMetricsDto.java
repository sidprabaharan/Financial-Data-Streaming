package com.example.financialdatastreaming.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMetricsDto {
    private Long totalDataPoints;
    private Double averageQueryTimeMs;
    private Double averageLatencyMs;
    private Long activeWebSocketConnections;
    private Long messagesPerSecond;
    private Double cpuUsagePercent;
    private Double memoryUsageMb;
}