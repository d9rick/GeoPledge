package com.geopledge.service;

import com.geopledge.dto.LocationFixDTO;
import com.geopledge.dto.PledgeCreateDTO;
import com.geopledge.dto.PledgeDTO;
import com.geopledge.model.Pledge;
import com.geopledge.model.PledgeCheck;
import com.geopledge.repository.PledgeRepository;
import com.geopledge.repository.PledgeCheckRepository;
import com.geopledge.util.GeoUtils;
import jakarta.transaction.Status;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PledgeService {

    private final PledgeRepository pledgeRepo;
    private final PledgeCheckRepository checkRepo;

    @Autowired
    public PledgeService(PledgeRepository pledgeRepo,
                         PledgeCheckRepository checkRepo) {
        this.pledgeRepo = pledgeRepo;
        this.checkRepo = checkRepo;
    }

    public List<PledgeDTO> getPledgesForUser(UUID userId) {
        List<Pledge> pledges = pledgeRepo.findByUserId(userId);
        List<PledgeDTO> dtos = new ArrayList<>();
        ZonedDateTime now = ZonedDateTime.now(ZoneId.systemDefault());

        for (Pledge p : pledges) {
            ZonedDateTime nextRun = computeNextRun(p, now);
            PledgeCheck lastCheck = checkRepo.findTopByPledgeIdOrderByCheckedAtDesc(p.getId());
            String lastStatus = lastCheck != null ? lastCheck.getStatus().name() : null;

            dtos.add(new PledgeDTO(
                    p.getId(),
                    p.getName(),
                    nextRun,
                    p.getStakeCents(),
                    lastStatus
            ));
        }
        return dtos;
    }

    private ZonedDateTime computeNextRun(Pledge p, ZonedDateTime from) {
        // Find the next ZonedDateTime matching one of the days_of_week at time_hour:time_minute
        for (int offset = 0; offset < 7; offset++) {
            ZonedDateTime candidate = from.plusDays(offset)
                    .withHour(p.getTimeHour())
                    .withMinute(p.getTimeMinute())
                    .withSecond(0)
                    .withNano(0);
            DayOfWeek dow = candidate.getDayOfWeek();
            int dowIndex = dow.getValue() % 7; // Java: MONDAY=1...SUNDAY=7 -> map Sunday to 0
            if (p.getDaysOfWeek().contains(dowIndex) && candidate.isAfter(from)) {
                return candidate;
            }
        }
        // Fallback: return now
        return from;
    }

    public PledgeDTO createPledge(UUID userId, PledgeCreateDTO dto) {
        Pledge p = new Pledge();
        p.setId(UUID.randomUUID());
        p.setUserId(userId);
        p.setName(dto.getName());
        p.setTargetLatitude(dto.getTargetLatitude());
        p.setTargetLongitude(dto.getTargetLongitude());
        p.setRadiusMeters(dto.getRadiusMeters());
        p.setStakeCents(dto.getStakeCents());
        p.setCharityId(dto.getCharityId());
        p.setDaysOfWeek(dto.getDaysOfWeek());
        p.setTimeHour(dto.getTimeHour());
        p.setTimeMinute(dto.getTimeMinute());
        p.setActive(true);
        p.setCreatedAt(ZonedDateTime.now(ZoneId.systemDefault()));
        p.setUpdatedAt(p.getCreatedAt());
        pledgeRepo.save(p);

        // compute next run just like in getPledgesForUser
        ZonedDateTime nextRun = computeNextRun(p, p.getCreatedAt());
        return new PledgeDTO(p.getId(), p.getName(), nextRun, p.getStakeCents(), null);
    }

    @Transactional
    public void recordFix(UUID userId, LocationFixDTO fixUtc) {

        ZonedDateTime now = fixUtc.at()
                .atZone(ZoneId.systemDefault()); // localise once
        List<Pledge> candidates = pledgeRepo.findByUserIdAndActiveTrue(userId);

        for (Pledge p : candidates) {
            /* 1️⃣ Is this pledge “scheduled” right now? */
            if (!isScheduledNow(p, now)) continue;

            /* 2️⃣ Measure distance user→target */
            double metres = GeoUtils.haversine(
                    fixUtc.lat(), fixUtc.lon(),
                    p.getTargetLatitude(), p.getTargetLongitude());

            PledgeCheck.Status status = metres <= p.getRadiusMeters()
                    ? PledgeCheck.Status.MET : PledgeCheck.Status.VIOLATED;

            /* 3️⃣ Persist the check row */
            PledgeCheck pc = new PledgeCheck();
            pc.setId(UUID.randomUUID());
            pc.setPledgeId(p.getId());
            pc.setScheduledFor(now);       // this HH:MM slot
            pc.setStatus(status);
            pc.setUserLatitude(fixUtc.lat());
            pc.setUserLongitude(fixUtc.lon());
            pc.setCheckedAt(ZonedDateTime.now(ZoneId.systemDefault()));
            checkRepo.save(pc);

            /* 4️⃣ Optional: charge stake on violation */
//            if (status == Status.VIOLATED) {
//                penaltyService.charge(userId, p);     // implement or inject later
//            }
        }
    }

    /* helper */
    private boolean isScheduledNow(Pledge p, ZonedDateTime t) {
        int dow = t.getDayOfWeek().getValue() % 7;          // SUN→0
        if (!p.getDaysOfWeek().contains(dow)) return false;
        return t.getHour() == p.getTimeHour()
                && t.getMinute() == p.getTimeMinute();
    }
}