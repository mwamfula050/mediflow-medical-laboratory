package tz.mediflow.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name="lab_orders")
public class LabOrder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Visit visit;
 @Column(nullable=false,length=120) private String testName;
 @Column(nullable=false,length=30) private String status="AWAITING_PAYMENT";
 @Column(nullable=false,length=30,columnDefinition="varchar(30) default 'UNPAID'") private String paymentStatus="UNPAID";
 @Column(nullable=false,precision=12,scale=2,columnDefinition="decimal(12,2) default 0.00") private BigDecimal price=BigDecimal.ZERO;
 @Column(length=1000) private String result;
 @Column(length=500) private String measurement;
 @Column(length=40) private String unit;
 @Column(length=1000) private String interpretation;
 @Column(length=80) private String specimenCode;
 private Instant requestedAt=Instant.now(); private Instant verifiedAt;
 private Instant paymentVerifiedAt;
 @Column(length=80) private String verifiedBy;
 @Column(length=80) private String paymentVerifiedBy;
 protected LabOrder(){}
 public LabOrder(Visit visit,String test){this.visit=visit;this.testName=test;}
 public Long getId(){return id;} public Visit getVisit(){return visit;} public String getTestName(){return testName;}
 public String getStatus(){return status;} public String getPaymentStatus(){return paymentStatus;} public BigDecimal getPrice(){return price;}
 public String getResult(){return result;} public String getMeasurement(){return measurement;} public String getUnit(){return unit;} public String getInterpretation(){return interpretation;}
 public Instant getRequestedAt(){return requestedAt;} public Instant getVerifiedAt(){return verifiedAt;}
 public String getSpecimenCode(){return specimenCode;} public String getVerifiedBy(){return verifiedBy;}
 public Instant getPaymentVerifiedAt(){return paymentVerifiedAt;} public String getPaymentVerifiedBy(){return paymentVerifiedBy;}
 public void setResult(String r){result=r;} public void setMeasurement(String m){measurement=m;} public void setUnit(String u){unit=u;} public void setInterpretation(String i){interpretation=i;}
 public void setStatus(String s){status=s;} public void setSpecimenCode(String s){specimenCode=s;}
 public void setPrice(BigDecimal p){price=p;}
 public void markPaid(String by){paymentStatus="PAID";paymentVerifiedBy=by;paymentVerifiedAt=Instant.now();if("AWAITING_PAYMENT".equals(status))status="READY_FOR_TESTING";}
 public void verify(String by){status="VERIFIED";verifiedBy=by;verifiedAt=Instant.now();}
}
