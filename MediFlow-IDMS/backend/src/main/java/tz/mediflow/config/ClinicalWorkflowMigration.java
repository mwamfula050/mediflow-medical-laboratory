package tz.mediflow.config;

import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** One-time-safe workflow transition. Legacy NURSE rows remain for historical compatibility but cannot sign in. */
@Component
public class ClinicalWorkflowMigration implements CommandLineRunner {
 private final EntityManager entityManager;
 public ClinicalWorkflowMigration(EntityManager entityManager){this.entityManager=entityManager;}
 @Override @Transactional
 public void run(String... args){
  entityManager.createNativeQuery("UPDATE app_users SET enabled=0 WHERE role='NURSE' OR LOWER(username)='nurse'").executeUpdate();
  entityManager.createNativeQuery("UPDATE visits SET status='WAITING_FOR_DOCTOR', department='DOCTOR' WHERE status='WAITING_FOR_TRIAGE' OR department='NURSE'").executeUpdate();
 }
}
