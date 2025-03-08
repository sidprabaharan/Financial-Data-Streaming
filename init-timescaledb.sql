-- Create the extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Connect to the stockmarket database
\c stockmarket;

-- Create hypertable after the application creates the table
CREATE OR REPLACE FUNCTION create_hypertable_if_not_exists() 
RETURNS event_trigger LANGUAGE PLPGSQL AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables WHERE tablename = 'stock_prices' AND schemaname = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM timescaledb_information.hypertables WHERE hypertable_name = 'stock_prices'
    ) THEN
        PERFORM create_hypertable('stock_prices', 'timestamp');
        
        -- Create indexes for optimized time-series queries
        CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_time ON stock_prices (symbol, timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_stock_prices_time_desc ON stock_prices (timestamp DESC);
        
        RAISE NOTICE 'Hypertable created for stock_prices table';
    END IF;
END
$$;

-- Create event trigger that runs after tables are created
CREATE EVENT TRIGGER create_timescaledb_hypertables 
ON ddl_command_end 
WHEN tag IN ('CREATE TABLE')
EXECUTE PROCEDURE create_hypertable_if_not_exists();

-- Create functions for time bucketing and aggregation
CREATE OR REPLACE FUNCTION get_candlestick_data(
    symbol_param TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    bucket_interval TEXT
) RETURNS TABLE (
    bucket TIMESTAMP,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT
) LANGUAGE SQL AS $$
    SELECT 
        time_bucket(bucket_interval::INTERVAL, timestamp) AS bucket,
        FIRST(price, timestamp) AS open,
        MAX(price) AS high,
        MIN(price) AS low,
        LAST(price, timestamp) AS close,
        SUM(volume) AS volume
    FROM stock_prices
    WHERE 
        symbol = symbol_param AND
        timestamp >= start_time AND
        timestamp <= end_time
    GROUP BY bucket
    ORDER BY bucket ASC;
$$;

-- Create a function to calculate performance metrics
CREATE OR REPLACE FUNCTION calculate_query_performance()
RETURNS TABLE (
    retrieval_time_ms DOUBLE PRECISION,
    baseline_ms DOUBLE PRECISION,
    improvement_percentage DOUBLE PRECISION
) LANGUAGE SQL AS $$
    WITH timescale_query AS (
        SELECT 
            extract(epoch from clock_timestamp() - statement_timestamp()) * 1000 AS query_time
        FROM 
            get_candlestick_data('AAPL', NOW() - INTERVAL '1 day', NOW(), '1 minute')
    ),
    regular_query AS (
        -- Simulate a non-optimized query to compare against
        SELECT 
            extract(epoch from clock_timestamp() - statement_timestamp()) * 1000 AS query_time
        FROM (
            SELECT 
                date_trunc('minute', timestamp) AS bucket,
                AVG(price) as avg_price,
                SUM(volume) as volume
            FROM stock_prices
            WHERE 
                symbol = 'AAPL' AND
                timestamp >= NOW() - INTERVAL '1 day' AND
                timestamp <= NOW()
            GROUP BY bucket
            ORDER BY bucket
        ) t
    )
    SELECT 
        (SELECT query_time FROM timescale_query),
        (SELECT query_time FROM regular_query),
        ((SELECT query_time FROM regular_query) - (SELECT query_time FROM timescale_query)) / 
        (SELECT query_time FROM regular_query) * 100
$$;