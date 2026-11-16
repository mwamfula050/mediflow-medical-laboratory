package tz.mediflow.controller;
import tz.mediflow.model.*;import tz.mediflow.repo.*;import jakarta.validation.Valid;import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;import java.util.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/lab")
public class LabController {
 private final LabRepo labs;private final VisitRepo visits;
 public LabController(LabRepo l,VisitRepo v){labs=l;visits=v;}
 public record Request(@NotNull Long visitId,@NotBlank @Size(max=120) String testName){}
 public record Result(@NotBlank @Size(max=1000) String result,@Size(max=500) String measurement,@Size(max=40) String unit,@Size(max=1000) String interpretation,@Size(max=80) String specimenCode){}
 public record PatientSummary(Long id,String fullName,String patientNumber){}
 public record VisitSummary(Long id,PatientSummary patient,String status,String department){}
 public record ManagerLabSummary(Long id,VisitSummary visit,String testName,String status,String paymentStatus,java.time.Instant requestedAt){}
 public record LabWorkSummary(Long id,VisitSummary visit,String testName,String status,String paymentStatus,String measurement,String unit,String result,String interpretation,String specimenCode,java.time.Instant requestedAt,java.time.Instant verifiedAt){} 
 private LabWorkSummary workSummary(LabOrder l){Visit v=l.getVisit();return new LabWorkSummary(l.getId(),
  new VisitSummary(v.getId(),new PatientSummary(v.getPatient().getId(),v.getPatient().getFullName(),v.getPatient().getPatientNumber()),v.getStatus(),v.getDepartment()),
  l.getTestName(),l.getStatus(),l.getPaymentStatus(),l.getMeasurement(),l.getUnit(),l.getResult(),l.getInterpretation(),l.getSpecimenCode(),l.getRequestedAt(),l.getVerifiedAt());}
 @PostMapping("/orders") @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
 public LabOrder order(@Valid @RequestBody Request x){
  Visit v=visits.findById(x.visitId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Visit not found"));
  if(!List.of("WAITING_FOR_DOCTOR","AWAITING_LAB","RESULTS_READY_FOR_DOCTOR").contains(v.getStatus()))
   throw new ResponseStatusException(HttpStatus.CONFLICT,"Visit is not available for laboratory requests");
  v.setStatus("AWAITING_LAB");v.setDepartment("LABORATORY");visits.save(v);
  return labs.save(new LabOrder(v,x.testName()));
 }
 @GetMapping("/orders") @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DOCTOR','LAB_TECHNICIAN','RECORDS_OFFICER','CASHIER','ACCOUNTANT')")
 public List<?> list(org.springframework.security.core.Authentication auth){
  List<LabOrder> all=labs.findTop100ByOrderByRequestedAtDesc();
  if(auth.getAuthorities().stream().anyMatch(a->Set.of("ROLE_MANAGER","ROLE_CASHIER","ROLE_ACCOUNTANT").contains(a.getAuthority()))){
   return all.stream().map(l->{Visit v=l.getVisit();return new ManagerLabSummary(l.getId(),
    new VisitSummary(v.getId(),new PatientSummary(v.getPatient().getId(),v.getPatient().getFullName(),v.getPatient().getPatientNumber()),v.getStatus(),v.getDepartment()),
    l.getTestName(),l.getStatus(),l.getPaymentStatus(),l.getRequestedAt());}).toList();
  }
  if(auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_LAB_TECHNICIAN")))return all.stream().map(this::workSummary).toList();
  return all;
 }
 @PatchMapping("/orders/{id}/result") @PreAuthorize("hasAnyRole('ADMIN','LAB_TECHNICIAN')")
 public LabWorkSummary result(@PathVariable Long id,@Valid @RequestBody Result x){
  LabOrder l=labs.findById(id).orElseThrow();if(!"PAID".equals(l.getPaymentStatus()))throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED,"Laboratory payment must be fully verified before testing");
  if(l.getStatus().equals("VERIFIED"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Verified result cannot be edited");
  l.setResult(x.result());l.setMeasurement(x.measurement());l.setUnit(x.unit());l.setInterpretation(x.interpretation());l.setSpecimenCode(x.specimenCode());l.setStatus("PENDING_VERIFICATION");return workSummary(labs.save(l));
 }
 @PostMapping("/orders/{id}/verify") @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
 public LabOrder verify(@PathVariable Long id,org.springframework.security.core.Authentication auth){
  LabOrder l=labs.findById(id).orElseThrow();if(l.getResult()==null||l.getResult().isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enter a result before verification");
  l.verify(auth.getName());labs.save(l);
  boolean remaining=labs.existsByVisit_IdAndStatusNot(l.getVisit().getId(),"VERIFIED");
  if(!remaining){Visit v=l.getVisit();v.setStatus("RESULTS_READY_FOR_DOCTOR");v.setDepartment("DOCTOR_REVIEW");visits.save(v);}
  return l;
 }
}
