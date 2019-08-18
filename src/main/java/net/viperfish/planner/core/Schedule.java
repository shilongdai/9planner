package net.viperfish.planner.core;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class Schedule {

    private int totalCredit;
    private List<CourseArchtype> courses;
    private List<Course> sections;

    public Schedule(Collection<CourseArchtype> courses, Collection<Course> sections) {
        this.courses = new ArrayList<>(courses);
        this.sections = new ArrayList<>(sections);
        totalCredit = 0;
        for (CourseArchtype c : this.courses) {
            totalCredit += c.getUnits();
        }
    }

    public int getTotalCredit() {
        return totalCredit;
    }

    public List<CourseArchtype> getCourses() {
        return new ArrayList<>(courses);
    }

    public List<Course> getSections() {
        return new ArrayList<>(sections);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Schedule schedule = (Schedule) o;
        return Objects.equals(courses, schedule.courses) &&
                Objects.equals(sections, schedule.sections);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courses, sections);
    }
}
