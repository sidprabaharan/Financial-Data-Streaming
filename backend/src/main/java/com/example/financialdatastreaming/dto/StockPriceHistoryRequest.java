package com.example.financialdatastreaming.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockPriceHistoryRequest {
    private Instant from;
    private Instant to;
    private String interval; // e.g., "1m", "5m", "1h", "1d"
    private Integer limit;
}