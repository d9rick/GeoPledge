package com.geopledge.charity;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CharityRepository extends JpaRepository<Charity, UUID> {}
