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
    private CourseSectionRepository sectionRepository;

    @Autowired
    private SchedulePlanner planner;

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @RequestMapping(path = "/api/plan/profile", method = RequestMethod.POST)
    public Schedule planSchedule(@RequestBody ProfileInputForm inputForm) {
        Set<CourseArchtype> portfolio = new HashSet<>();
        Set<Long> archTypeIds = new HashSet<>(inputForm.getArchtypeIds());
        Set<Long> blacklistIds = new HashSet<>(inputForm.getBlacklist());
        for (Long id : archTypeIds) {
            Optional<CourseArchtype> archtype = repo.findById(id);
            if (archtype.isPresent()) {
                portfolio.add(archtype.get());
            } else {
                throw new CourseArchtypeNotFoundException();
            }
        }
        Set<Course> blackList = new HashSet<Course>();
        sectionRepository.findAllById(blacklistIds).forEach(blackList::add);

        logger.debug("Received metrics {}", inputForm.getMetrics());
        Profile profile = new Profile(inputForm.getMetrics(), portfolio, blackList);
        Schedule result = planner.plan(profile);
        return result;
    }

}
