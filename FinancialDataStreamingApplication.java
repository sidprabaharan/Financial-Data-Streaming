package com.example.financialdatastreaming;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinancialDataStreamingApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinancialDataStreamingApplication.class, args);
    }
}