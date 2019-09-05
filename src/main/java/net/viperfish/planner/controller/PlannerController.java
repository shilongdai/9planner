package net.viperfish.planner.controller;

import net.viperfish.planner.core.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
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
        logger.debug("Received metrics {}", inputForm.getMetrics());
        Profile profile = createProfile(inputForm);
        if (profile.getPortfolio().isEmpty()) {
            return Schedule.NULL_SCHEDULE;
        }
        Schedule result = planner.plan(profile);
        return result;
    }

    private Profile createProfile(ProfileInputForm inputForm) {
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

        portfolio = filterCourseArchtypes(portfolio, blackList);
        return new Profile(inputForm.getMetrics(), portfolio);
    }

    private Set<CourseArchtype> filterCourseArchtypes(Set<CourseArchtype> portfolio, Set<Course> blackList) {
        Set<CourseArchtype> finalPortfolio = new HashSet<>();
        for (CourseArchtype c : portfolio) {
            Set<Course> primarySection = new HashSet<>();
            Set<Course> secSection = new HashSet<>();

            for (Course course : c.getCourses()) {
                if (course.getType() == CourseType.MAIN) {
                    primarySection.add(course);
                } else {
                    secSection.add(course);
                }
            }
            primarySection.removeAll(blackList);
            if (primarySection.isEmpty()) {
                continue;
            }
            if (!secSection.isEmpty()) {
                secSection.removeAll(blackList);
                if (secSection.isEmpty()) {
                    continue;
                }
            }
            primarySection.addAll(secSection);
            c.setCourses(new ArrayList<>(primarySection));
            finalPortfolio.add(c);
        }
        return finalPortfolio;
    }

}
