package com.example.financialdatastreaming.repository;

import com.example.financialdatastreaming.model.StockPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    Optional<StockPrice> findTopBySymbolOrderByTimestampDesc(String symbol);
    
    List<StockPrice> findBySymbolOrderByTimestampDesc(String symbol, org.springframework.data.domain.Pageable pageable);
    
    List<StockPrice> findBySymbolAndTimestampBetweenOrderByTimestampAsc(
            String symbol, Instant startTime, Instant endTime);
    
    @Query(value = "SELECT sp FROM StockPrice sp WHERE sp.symbol = :symbol " +
            "AND sp.timestamp >= :startTime AND sp.timestamp <= :endTime " +
            "ORDER BY sp.timestamp ASC")
    List<StockPrice> findStockPriceHistory(@Param("symbol") String symbol,
                                          @Param("startTime") Instant startTime,
                                          @Param("endTime") Instant endTime);
    
    @Query(value = "SELECT time_bucket('1 minute', timestamp) AS minute, " +
            "first(price, timestamp) AS open, " +
            "max(price) AS high, " +
            "min(price) AS low, " +
            "last(price, timestamp) AS close, " +
            "sum(volume) AS volume " +
            "FROM stock_prices " +
            "WHERE symbol = :symbol AND timestamp >= :startTime AND timestamp <= :endTime " +
            "GROUP BY minute " +
            "ORDER BY minute ASC", nativeQuery = true)
    List<Object[]> findCandlestickData(@Param("symbol") String symbol,
                                      @Param("startTime") Instant startTime,
                                      @Param("endTime") Instant endTime);
    
    @Query(value = "SELECT COUNT(*) FROM stock_prices", nativeQuery = true)
    Long countTotalPricePoints();
    
    @Query(value = "SELECT AVG(query_time) FROM " +
            "(SELECT EXTRACT(EPOCH FROM (clock_timestamp() - statement_timestamp())) * 1000 AS query_time " +
            "FROM stock_prices WHERE symbol = :symbol ORDER BY timestamp DESC LIMIT 1000) AS subquery", 
            nativeQuery = true)
    Double calculateAverageQueryTime(@Param("symbol") String symbol);
}