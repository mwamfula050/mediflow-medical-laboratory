package tz.mediflow.controller;
import tz.mediflow.model.*; import tz.mediflow.repo.UserRepo;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.http.*; import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/users")
public class UserController {
 private final UserRepo repo;private final PasswordEncoder encoder;
 public UserController(UserRepo r,PasswordEncoder e){repo=r;encoder=e;}
 public record CreateUser(@NotBlank @Size(min=3,max=80) String username,@NotBlank @Size(min=14,max=100) String password,@NotBlank @Size(min=2,max=140) String fullName,@NotNull Role role){}
 @PostMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')") public Map<String,Object> create(@Valid @RequestBody CreateUser x,org.springframework.security.core.Authentication auth){
  if(auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_MANAGER")) && (x.role()==Role.ADMIN||x.role()==Role.MANAGER))
   throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN,"Managers cannot create administrator or manager accounts.");
  if(x.username().trim().equalsIgnoreCase("nurse")||x.role()==Role.NURSE)throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST,"Nurse accounts are retired. Use direct reception-to-doctor workflow.");
  if(repo.existsByUsername(x.username().trim()))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT,"Username already exists");
  AppUser u=repo.save(new AppUser(x.username().trim(),encoder.encode(x.password()),x.fullName().trim(),x.role()));
  return Map.of("id",u.getId(),"username",u.getUsername(),"role",u.getRole());
 }
 @GetMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')") public List<Map<String,Object>> list(){
  return repo.findAll().stream().filter(u->u.getRole()!=Role.NURSE&&!u.getUsername().equalsIgnoreCase("nurse")).map(u->Map.<String,Object>of("id",u.getId(),"username",u.getUsername(),"fullName",u.getFullName(),"role",u.getRole(),"enabled",u.isEnabled())).toList();
 }
 @PatchMapping("/{id}/enabled") @PreAuthorize("hasRole('ADMIN')") public Map<String,Object> enable(@PathVariable Long id,@RequestBody Map<String,Boolean> body){
  AppUser u=repo.findById(id).orElseThrow();u.setEnabled(Boolean.TRUE.equals(body.get("enabled")));repo.save(u);return Map.of("id",id,"enabled",u.isEnabled());
 }
}
