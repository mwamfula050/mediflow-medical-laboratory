package tz.mediflow.model;

public enum Role {
    // NURSE is retained only so legacy database rows can be read during migration; new accounts are rejected and old accounts disabled.
    ADMIN, MANAGER, RECEPTIONIST, CASHIER, DOCTOR, LAB_TECHNICIAN,
    PHARMACIST, NURSE, ACCOUNTANT, RECORDS_OFFICER
}
