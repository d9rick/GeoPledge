package com.geopledge.controller;

import com.geopledge.auth.model.User;
import com.geopledge.dto.PledgeCreateDTO;
import com.geopledge.dto.PledgeDTO;
import com.geopledge.service.PledgeService;
import com.geopledge.auth.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pledges")
public class PledgeController {

    private final PledgeService pledgeService;

    @Autowired
    public PledgeController(PledgeService pledgeService,
                            UserRepository userRepo) {
        this.pledgeService = pledgeService;
    }

    @GetMapping
    public ResponseEntity<List<PledgeDTO>> listUserPledges(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        List<PledgeDTO> pledges = pledgeService.getPledgesForUser(userId);
        return ResponseEntity.ok(pledges);
    }

    @PostMapping
    public ResponseEntity<PledgeDTO> createPledge(
            @RequestBody @Valid PledgeCreateDTO dto,
            Authentication auth) {

        // principal = UUID string set by JwtAuthTokenFilter
        UUID userId = UUID.fromString(auth.getName());

        // delegate straight to the service
        PledgeDTO created = pledgeService.createPledge(userId, dto);
        return ResponseEntity.ok(created);
    }
}
