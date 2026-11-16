package tz.mediflow.repo;
import tz.mediflow.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface InvoiceRepo extends JpaRepository<Invoice,Long>{
 List<Invoice> findTop100ByOrderByCreatedAtDesc();
 boolean existsByLabOrder_Id(Long labOrderId);
 boolean existsByVisit_IdAndLabOrderIsNotNull(Long visitId);
 java.util.Optional<Invoice> findFirstByVisit_IdAndLabOrderIsNotNullOrderByCreatedAtDesc(Long visitId);
}
