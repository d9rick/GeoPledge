package com.geopledge.controller;

import com.geopledge.dto.LocationFixDTO;
import com.geopledge.service.PledgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pledges")
@RequiredArgsConstructor
public class PledgeCheckController {

    private final PledgeService pledgeService;

    @PostMapping("/check")
    public void checkPledges(@RequestBody @Valid LocationFixDTO fix,
                             Authentication auth) {

        /* principal is the user UUID set by your JWT filter */
        UUID userId = UUID.fromString(auth.getName());
        pledgeService.recordFix(userId, fix);
    }
}
