package tz.mediflow.controller;

import tz.mediflow.model.*;
import tz.mediflow.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@RestController @RequestMapping("/api/billing")
public class BillingController {
 private final InvoiceRepo invoices; private final VisitRepo visits; private final PaymentRepo payments; private final LabRepo labs;
 public BillingController(InvoiceRepo i,VisitRepo v,PaymentRepo p,LabRepo l){invoices=i;visits=v;payments=p;labs=l;}
 public record NewInvoice(@NotNull Long visitId,@NotNull @DecimalMin("0.01") BigDecimal amount){}
 public record LabInvoice(@NotNull @DecimalMin("0.01") BigDecimal amount){}
 public record NewPayment(@NotNull @DecimalMin("0.01") BigDecimal amount,@NotBlank String method,String reference){}
 public record PatientSummary(Long id,String fullName,String patientNumber){}
 public record VisitSummary(Long id,PatientSummary patient,String status,String department){}
 public record LabSummary(Long id,String testName,String status,String paymentStatus){}
 public record InvoiceSummary(Long id,VisitSummary visit,LabSummary labOrder,BigDecimal amount,BigDecimal paid,String status,java.time.Instant createdAt){}
 public record PaymentSummary(Long id,Long invoiceId,String patientName,BigDecimal amount,String method,String reference,java.time.Instant paidAt,String receivedBy){}
 private InvoiceSummary invoiceSummary(Invoice i){
  Visit v=i.getVisit();LabOrder l=i.getLabOrder();
  return new InvoiceSummary(i.getId(),
   new VisitSummary(v.getId(),new PatientSummary(v.getPatient().getId(),v.getPatient().getFullName(),v.getPatient().getPatientNumber()),v.getStatus(),v.getDepartment()),
   l==null?null:new LabSummary(l.getId(),l.getTestName(),l.getStatus(),l.getPaymentStatus()),
   i.getAmount(),i.getPaid(),i.getStatus(),i.getCreatedAt());
 }
 private boolean isFinancialRole(org.springframework.security.core.Authentication auth){
  return auth.getAuthorities().stream().anyMatch(a->Set.of("ROLE_MANAGER","ROLE_CASHIER","ROLE_ACCOUNTANT").contains(a.getAuthority()));
 }
 private PaymentSummary paymentSummary(Payment p){
  return new PaymentSummary(p.getId(),p.getInvoice().getId(),p.getInvoice().getVisit().getPatient().getFullName(),
   p.getAmount(),p.getMethod(),p.getReference(),p.getPaidAt(),p.getReceivedBy());
 }

 @PostMapping("/invoices") @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER','ACCOUNTANT')")
 public Object invoice(@Valid @RequestBody NewInvoice x,org.springframework.security.core.Authentication auth){
  Invoice created=invoices.save(new Invoice(visits.findById(x.visitId()).orElseThrow(),x.amount()));
  return isFinancialRole(auth)?invoiceSummary(created):created;
 }

 @PostMapping("/lab-visits/{visitId}/invoice") @Transactional
 @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER','ACCOUNTANT')")
 public Object labVisitInvoice(@PathVariable Long visitId,@Valid @RequestBody LabInvoice x,org.springframework.security.core.Authentication auth){
  Visit visit=visits.findById(visitId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Visit not found"));
  List<LabOrder> visitLabs=labs.findByVisit_IdOrderByRequestedAtAsc(visitId);
  if(visitLabs.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No laboratory tests found for this visit");
  if(visitLabs.stream().anyMatch(l->"PAID".equals(l.getPaymentStatus())))throw new ResponseStatusException(HttpStatus.CONFLICT,"Some tests in this visit have already been paid; create a separate invoice for remaining tests");
  if(invoices.existsByVisit_IdAndLabOrderIsNotNull(visitId))throw new ResponseStatusException(HttpStatus.CONFLICT,"A consolidated laboratory invoice already exists for this visit");
  Invoice created=invoices.save(new Invoice(visit,visitLabs.get(0),x.amount(),true));
  return isFinancialRole(auth)?invoiceSummary(created):created;
 }

 // Kept for legacy links; new billing should use the consolidated visit endpoint above.
 @PostMapping("/lab-orders/{labOrderId}/invoice") @Transactional
 @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER','ACCOUNTANT')")
 public Object labInvoice(@PathVariable Long labOrderId,@Valid @RequestBody LabInvoice x,org.springframework.security.core.Authentication auth){
  LabOrder lab=labs.findById(labOrderId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Lab order not found"));
  if("PAID".equals(lab.getPaymentStatus()))throw new ResponseStatusException(HttpStatus.CONFLICT,"This test is already paid");
  if(invoices.existsByVisit_IdAndLabOrderIsNotNull(lab.getVisit().getId()))throw new ResponseStatusException(HttpStatus.CONFLICT,"A laboratory invoice already exists for this visit");
  Invoice created=invoices.save(new Invoice(lab.getVisit(),lab,x.amount()));
  return isFinancialRole(auth)?invoiceSummary(created):created;
 }

 @GetMapping("/invoices") @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER','ACCOUNTANT','RECORDS_OFFICER','DOCTOR')")
 public List<?> invoices(org.springframework.security.core.Authentication auth){
  List<Invoice> all=invoices.findTop100ByOrderByCreatedAtDesc();
  if(isFinancialRole(auth))return all.stream().map(this::invoiceSummary).toList();
  return all;
 }

 @PostMapping("/invoices/{id}/payments") @Transactional @PreAuthorize("hasAnyRole('ADMIN','MANAGER','CASHIER')")
 public Object pay(@PathVariable Long id,@Valid @RequestBody NewPayment x,org.springframework.security.core.Authentication auth){
  Invoice i=invoices.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Invoice not found"));
  if(i.getStatus().equals("PAID"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Invoice already paid");
  if(i.getPaid().add(x.amount()).compareTo(i.getAmount())>0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment exceeds balance");
  i.addPayment(x.amount());
  if("PAID".equals(i.getStatus())&&i.getLabOrder()!=null){
   if(i.isLabBundle()){
    List<LabOrder> visitOrders=labs.findByVisit_IdOrderByRequestedAtAsc(i.getVisit().getId());
    for(LabOrder order:visitOrders)order.markPaid(auth.getName());
   } else {
    i.getLabOrder().markPaid(auth.getName());
   }
  }
  invoices.save(i);
  Payment payment=payments.save(new Payment(i,x.amount(),x.method(),x.reference(),auth.getName()));
  return isFinancialRole(auth)?paymentSummary(payment):payment;
 }
 @GetMapping("/payments") @PreAuthorize("hasAnyRole('ADMIN','CASHIER','ACCOUNTANT','DOCTOR','RECORDS_OFFICER')")
 public List<?> payments(org.springframework.security.core.Authentication auth){
  List<Payment> all=payments.findTop100ByOrderByPaidAtDesc();
  if(isFinancialRole(auth))return all.stream().map(this::paymentSummary).toList();
  return all;
 }
}
