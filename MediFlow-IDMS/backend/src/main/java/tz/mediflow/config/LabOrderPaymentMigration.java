package tz.mediflow.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Normalizes rows created before per-test payment tracking was introduced. */
@Component
public class LabOrderPaymentMigration implements CommandLineRunner {
 private final EntityManager entityManager;
 public LabOrderPaymentMigration(EntityManager entityManager){this.entityManager=entityManager;}
 @Override @Transactional
 public void run(String... args){
  entityManager.createNativeQuery("UPDATE lab_orders SET payment_status='UNPAID' WHERE payment_status IS NULL OR payment_status=''").executeUpdate();
  entityManager.createNativeQuery("UPDATE lab_orders SET status='AWAITING_PAYMENT' WHERE status='REQUESTED' AND (result IS NULL OR result='')").executeUpdate();
 }
}
