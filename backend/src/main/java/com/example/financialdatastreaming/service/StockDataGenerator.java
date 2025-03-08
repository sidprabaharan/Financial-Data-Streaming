package com.example.financialdatastreaming.service;

import com.example.financialdatastreaming.dto.StockPriceDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockDataGenerator {

    private final KafkaTemplate<String, StockPriceDto> kafkaTemplate;
    private final Random random = new Random();
    
    private final Map<String, StockPriceDto> lastPrices = new ConcurrentHashMap<>();
    
    @Value("${app.kafka.topics.stock-prices}")
    private String stockPricesTopic;
    
    @Value("${app.default-symbols}")
    private List<String> symbols;
    
    @Value("${app.data-generator.enabled:true}")
    private boolean generatorEnabled;
    
    @Value("${app.data-generator.initial-price:100.0}")
    private double initialPrice;
    
    @Value("${app.data-generator.volatility:0.002}")
    private double volatility;
    
    // Generate initial data on startup
    public void generateInitialData() {
        if (!generatorEnabled) return;
        
        log.info("Generating initial stock price data for {} symbols", symbols.size());
        
        // Generate initial price for each symbol
        for (String symbol : symbols) {
            // Slight variance in initial price for each symbol
            double basePrice = initialPrice * (0.5 + random.nextDouble());
            
            StockPriceDto initialPrice = createInitialPrice(symbol, basePrice);
            lastPrices.put(symbol, initialPrice);
            
            // Send to Kafka
            kafkaTemplate.send(stockPricesTopic, symbol, initialPrice);
            
            log.info("Generated initial price for {}: {}", symbol, initialPrice.getPrice());
        }
    }
    
    // Generate real-time updates
    @Scheduled(fixedRate = 200) // Generate data every 200ms
    public void generateRealtimeUpdates() {
        if (!generatorEnabled) return;
        
        for (String symbol : symbols) {
            if (random.nextDouble() < 0.7) { // 70% chance of update for each symbol
                StockPriceDto lastPrice = lastPrices.get(symbol);
                
                if (lastPrice != null) {
                    StockPriceDto newPrice = generateNextPrice(lastPrice);
                    lastPrices.put(symbol, newPrice);
                    
                    // Send to Kafka with minimal latency
                    long startTime = System.nanoTime();
                    kafkaTemplate.send(stockPricesTopic, symbol, newPrice)
                            .whenComplete((result, ex) -> {
                                if (ex != null) {
                                    log.error("Failed to send stock price update for {}: {}", 
                                            symbol, ex.getMessage());
                                } else {
                                    long latencyNanos = System.nanoTime() - startTime;
                                    log.debug("Sent price update for {} in {}µs", 
                                            symbol, latencyNanos / 1000);
                                }
                            });
                }
            }
        }
    }
    
    // Helper to create initial price
    private StockPriceDto createInitialPrice(String symbol, double basePrice) {
        BigDecimal price = BigDecimal.valueOf(basePrice).setScale(2, RoundingMode.HALF_UP);
        
        return StockPriceDto.builder()
                .symbol(symbol)
                .price(price)
                .open(price)
                .high(price.multiply(BigDecimal.valueOf(1.01)).setScale(2, RoundingMode.HALF_UP))
                .low(price.multiply(BigDecimal.valueOf(0.99)).setScale(2, RoundingMode.HALF_UP))
                .close(price)
                .volume(100000L + random.nextInt(900000))
                .timestamp(Instant.now())
                .changeAmount(BigDecimal.ZERO)
                .changePercent(BigDecimal.ZERO)
                .build();
    }
    
    // Helper to generate next price based on random walk
    private StockPriceDto generateNextPrice(StockPriceDto lastPrice) {
        // Random price movement using geometric Brownian motion
        double change = volatility * random.nextGaussian();
        double changeAmount = lastPrice.getPrice().doubleValue() * change;
        
        BigDecimal newPrice = lastPrice.getPrice()
                .add(BigDecimal.valueOf(changeAmount))
                .setScale(2, RoundingMode.HALF_UP);
        
        // Ensure price doesn't go negative or too low
        if (newPrice.compareTo(BigDecimal.valueOf(1.0)) < 0) {
            newPrice = BigDecimal.valueOf(1.0 + random.nextDouble());
        }
        
        // Update high and low
        BigDecimal newHigh = newPrice.compareTo(lastPrice.getHigh()) > 0 
                ? newPrice : lastPrice.getHigh();
        BigDecimal newLow = newPrice.compareTo(lastPrice.getLow()) < 0 
                ? newPrice : lastPrice.getLow();
        
        // Random volume change
        long volumeChange = random.nextInt(10000) - 5000;
        long newVolume = Math.max(1000, lastPrice.getVolume() + volumeChange);
        
        return StockPriceDto.builder()
                .symbol(lastPrice.getSymbol())
                .price(newPrice)
                .open(lastPrice.getOpen())
                .high(newHigh)
                .low(newLow)
                .close(newPrice)
                .volume(newVolume)
                .timestamp(Instant.now())
                .build();
    }
    
    // Seed database with historical data for backtesting
    public void seedHistoricalData(int days) {
        if (!generatorEnabled) return;
        
        log.info("Seeding historical data for {} days", days);
        
        Map<String, BigDecimal> symbolPrices = new HashMap<>();
        
        // Initialize prices
        for (String symbol : symbols) {
            symbolPrices.put(symbol, BigDecimal.valueOf(initialPrice * (0.5 + random.nextDouble())));
        }
        
        // Generate data for each day, hour, and minute
        Instant now = Instant.now();
        for (int day = days; day > 0; day--) {
            for (int hour = 0; hour < 8; hour++) { // Assuming 8-hour trading day
                for (int minute = 0; minute < 60; minute++) {
                    // Generate a data point every minute for each symbol
                    for (String symbol : symbols) {
                        BigDecimal currentPrice = symbolPrices.get(symbol);
                        
                        // Add random price movement (more substantial for historical data)
                        double change = volatility * 5 * random.nextGaussian();
                        BigDecimal newPrice = currentPrice
                                .multiply(BigDecimal.valueOf(1 + change))
                                .setScale(2, RoundingMode.HALF_UP);
                        
                        // Ensure price stays reasonable
                        if (newPrice.compareTo(BigDecimal.valueOf(1.0)) < 0) {
                            newPrice = BigDecimal.valueOf(1.0 + random.nextDouble());
                        }
                        
                        symbolPrices.put(symbol, newPrice);
                        
                        // Create historical data point
                        Instant timestamp = now.minus(java.time.Duration.ofDays(day))
                                .plus(java.time.Duration.ofHours(hour))
                                .plus(java.time.Duration.ofMinutes(minute));
                        
                        StockPriceDto historicalPrice = StockPriceDto.builder()
                                .symbol(symbol)
                                .price(newPrice)
                                .open(newPrice.multiply(BigDecimal.valueOf(0.995 + random.nextDouble() * 0.01)))
                                .high(newPrice.multiply(BigDecimal.valueOf(1.001 + random.nextDouble() * 0.01)))
                                .low(newPrice.multiply(BigDecimal.valueOf(0.99 - random.nextDouble() * 0.01)))
                                .close(newPrice)
                                .volume(50000L + random.nextInt(100000))
                                .timestamp(timestamp)
                                .build();
                        
                        // Send historical data point to Kafka
                        kafkaTemplate.send(stockPricesTopic, symbol, historicalPrice);
                    }
                    
                    // Log progress occasionally
                    if (minute == 0) {
                        log.debug("Seeded data for day {} hour {}", day, hour);
                    }
                }
            }
            log.info("Completed seeding day {}/{}", days - day + 1, days);
        }
        
        log.info("Finished seeding historical data");
    }
}