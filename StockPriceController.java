package com.example.financialdatastreaming.controller;

import com.example.financialdatastreaming.dto.StockPriceDto;
import com.example.financialdatastreaming.dto.StockPriceHistoryRequest;
import com.example.financialdatastreaming.dto.SystemMetricsDto;
import com.example.financialdatastreaming.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-prices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockPriceController {

    private final StockPriceService stockPriceService;

    @GetMapping("/{symbol}/latest")
    public ResponseEntity<StockPriceDto> getLatestPrice(@PathVariable String symbol) {
        return ResponseEntity.ok(stockPriceService.getLatestPrice(symbol));
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<List<StockPriceDto>> getPriceHistory(
            @PathVariable String symbol,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "100") int limit) {
        
        Instant endTime = to != null ? to : Instant.now();
        Instant startTime = from != null ? from : endTime.minusSeconds(86400); // Default to last 24 hours
        
        return ResponseEntity.ok(
                stockPriceService.getPriceHistory(symbol, startTime, endTime, limit));
    }

    @PostMapping("/{symbol}/history")
    public ResponseEntity<List<StockPriceDto>> getPriceHistoryAdvanced(
            @PathVariable String symbol,
            @RequestBody StockPriceHistoryRequest request) {
        
        return ResponseEntity.ok(
                stockPriceService.getPriceHistory(
                        symbol,
                        request.getFrom(),
                        request.getTo(),
                        request.getInterval(),
                        request.getLimit()));
    }

    @GetMapping("/symbols")
    public ResponseEntity<List<String>> getAvailableSymbols() {
        return ResponseEntity.ok(stockPriceService.getAvailableSymbols());
    }
    
    @GetMapping("/metrics")
    public ResponseEntity<SystemMetricsDto> getSystemMetrics() {
        return ResponseEntity.ok(stockPriceService.getSystemMetrics());
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        return ResponseEntity.ok(stockPriceService.getStatistics());
    }
}