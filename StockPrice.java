package com.example.financialdatastreaming.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stock_prices", indexes = {
    @Index(name = "idx_stock_prices_symbol", columnList = "symbol"),
    @Index(name = "idx_stock_prices_timestamp", columnList = "timestamp")
})
public class StockPrice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 10)
    private String symbol;
    
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal price;
    
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal open;
    
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal high;
    
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal low;
    
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal close;
    
    @Column(nullable = false)
    private Long volume;
    
    @Column(nullable = false)
    private Instant timestamp;
    
    // Additional fields for market analysis
    @Column(precision = 10, scale = 4)
    private BigDecimal changePercent;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal changeAmount;
    
    @Column(precision = 10, scale = 4)
    private BigDecimal vwap; // Volume Weighted Average Price
    
    @Version
    private Long version;
}