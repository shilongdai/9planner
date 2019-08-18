package net.viperfish.planner.controller;

import net.viperfish.planner.core.CourseArchtype;
import net.viperfish.planner.core.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/course")
public class CourseArchtypeController {

    @Autowired
    private CourseRepository repo;

    @RequestMapping(path = "{subject}/{courseNumber}")
    public CourseArchtype getCourseArchtype(@PathVariable String subject, @PathVariable String courseNumber) {
        CourseArchtype result = repo.findFirstBySubjectAndAndCourseNumber(subject, courseNumber);
        if (result == null) {
            throw new CourseArchtypeNotFoundException();
        } else {
            return result;
        }
    }

    @RequestMapping(path = "{id}")
    public CourseArchtype getCourseArchtype(@PathVariable long id) {
        Optional<CourseArchtype> result = repo.findById(id);
        if (result.isPresent()) {
            return result.get();
        } else {
            throw new CourseArchtypeNotFoundException();
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public Iterable<CourseArchtype> getCourseArchtypes() {
        Iterable<CourseArchtype> result = repo.findAll();
        return result;
    }

}
