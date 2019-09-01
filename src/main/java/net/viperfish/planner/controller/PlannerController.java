package net.viperfish.planner.controller;

import net.viperfish.planner.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@RestController
public class PlannerController {

    @Autowired
    private CourseRepository repo;

    @Autowired
    private SchedulePlanner planner;

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @RequestMapping(path = "/api/plan/profile", method = RequestMethod.POST)
    public Schedule planSchedule(@RequestBody ProfileInputForm inputForm) {
        Set<CourseArchtype> portfolio = new HashSet<>();
        for (Long id : inputForm.getArchtypeIds()) {
            Optional<CourseArchtype> archtype = repo.findById(id);
            if (archtype.isPresent()) {
                portfolio.add(archtype.get());
            } else {
                throw new CourseArchtypeNotFoundException();
            }
        }

        logger.debug("Received metrics {}", inputForm.getMetrics());
        Profile profile = new Profile(inputForm.getMetrics(), portfolio);
        Schedule result = planner.plan(profile);
        return result;
    }

}
