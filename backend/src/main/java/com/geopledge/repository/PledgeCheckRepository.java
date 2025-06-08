package com.geopledge.repository;

import com.geopledge.model.PledgeCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PledgeCheckRepository extends JpaRepository<PledgeCheck, UUID> {
    PledgeCheck findTopByPledgeIdOrderByCheckedAtDesc(UUID pledgeId);
}
