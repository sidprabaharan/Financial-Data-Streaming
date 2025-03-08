package com.example.financialdatastreaming.service;

import com.example.financialdatastreaming.dto.StockPriceDto;
import com.example.financialdatastreaming.model.StockPrice;
import com.example.financialdatastreaming.repository.StockPriceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockPriceConsumer {

    private final StockPriceRepository stockPriceRepository;
    private final KafkaTemplate<String, StockPriceDto> kafkaTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Value("${app.kafka.topics.processed-stock-prices}")
    private String processedStockPricesTopic;

    @KafkaListener(topics = "${app.kafka.topics.stock-prices}", groupId = "stock-price-consumer-group")
    public void consume(StockPriceDto stockPriceDto) {
        long startTime = System.currentTimeMillis();
        log.debug("Received stock price: {}", stockPriceDto);
        
        try {
            // Enrich with previous price for change calculation
            enrichWithPriceChanges(stockPriceDto);
            
            // Save to database
            StockPrice stockPrice = mapToEntity(stockPriceDto);
            stockPriceRepository.save(stockPrice);
            
            // Add processing metadata
            stockPriceDto.setProcessedTimestamp(System.currentTimeMillis());
            stockPriceDto.setProcessingLatency(System.currentTimeMillis() - startTime);
            
            // Forward to processed topic
            kafkaTemplate.send(processedStockPricesTopic, stockPriceDto.getSymbol(), stockPriceDto);
            
            // Send directly to WebSocket subscribers
            messagingTemplate.convertAndSend("/topic/stock/" + stockPriceDto.getSymbol(), stockPriceDto);
            
            log.info("Processed stock price for {} in {}ms", 
                    stockPriceDto.getSymbol(), 
                    stockPriceDto.getProcessingLatency());
        } catch (Exception e) {
            log.error("Error processing stock price: {}", e.getMessage(), e);
        }
    }
    
    private void enrichWithPriceChanges(StockPriceDto stockPriceDto) {
        Optional<StockPrice> previousPrice = stockPriceRepository
                .findTopBySymbolOrderByTimestampDesc(stockPriceDto.getSymbol());
        
        if (previousPrice.isPresent()) {
            BigDecimal prevPrice = previousPrice.get().getPrice();
            BigDecimal currentPrice = stockPriceDto.getPrice();
            
            // Calculate change amount
            BigDecimal changeAmount = currentPrice.subtract(prevPrice);
            stockPriceDto.setChangeAmount(changeAmount);
            
            // Calculate change percent
            if (prevPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal changePercent = changeAmount
                        .divide(prevPrice, 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));
                stockPriceDto.setChangePercent(changePercent);
            }
        } else {
            // First record for this symbol
            stockPriceDto.setChangeAmount(BigDecimal.ZERO);
            stockPriceDto.setChangePercent(BigDecimal.ZERO);
        }
    }
    
    private StockPrice mapToEntity(StockPriceDto dto) {
        return StockPrice.builder()
                .symbol(dto.getSymbol())
                .price(dto.getPrice())
                .open(dto.getOpen())
                .high(dto.getHigh())
                .low(dto.getLow())
                .close(dto.getClose())
                .volume(dto.getVolume())
                .timestamp(dto.getTimestamp())
                .changeAmount(dto.getChangeAmount())
                .changePercent(dto.getChangePercent())
                .build();
    }
}