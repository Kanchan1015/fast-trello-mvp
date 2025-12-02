package com.trello.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.flywaydb.core.Flyway;
import javax.sql.DataSource;

@Component
public class FlywayTester implements CommandLineRunner {
    
    private final DataSource dataSource;
    
    public FlywayTester(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    @Override
    public void run(String... args) {
        System.out.println("=== FLYWAY TEST START ===");
        
        try {
            Class<?> flywayClass = Class.forName("org.flywaydb.core.Flyway");
            System.out.println("✓ Flyway class found: " + flywayClass);
            
            // Manually run Flyway
            System.out.println("=== RUNNING FLYWAY MANUALLY ===");
            
            Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
            
            System.out.println("Migrations found: " + flyway.info().all().length);
            
            // Run migrations
            flyway.migrate();
            
            System.out.println("✓ Flyway migrations completed successfully!");
            
        } catch (ClassNotFoundException e) {
            System.out.println("✗ Flyway class NOT FOUND on classpath!");
        } catch (Exception e) {
            System.out.println("✗ Flyway error: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== FLYWAY TEST END ===");
    }
}