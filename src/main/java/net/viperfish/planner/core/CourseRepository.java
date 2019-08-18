package net.viperfish.planner.core;

import org.springframework.data.repository.CrudRepository;

public interface CourseRepository extends CrudRepository<CourseArchtype, Long> {

    CourseArchtype findFirstBySubjectAndAndCourseNumber(String subject, String courseNumber);

}
