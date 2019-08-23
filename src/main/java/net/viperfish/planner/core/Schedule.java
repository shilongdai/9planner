package net.viperfish.planner.core;

import java.util.*;

public class Schedule {

    private int totalCredit;
    private List<Course> sections;

    public Schedule(Collection<Course> sections) {
        this.sections = new ArrayList<>(sections);
        totalCredit = 0;

        Set<Long> processedCourse = new HashSet<>();
        for (Course c : this.sections) {
            if (processedCourse.contains(c.getArchtype().getId())) {
                continue;
            }
            totalCredit += c.getArchtype().getUnits();
            processedCourse.add(c.getArchtype().getId());
        }
    }

    public int getTotalCredit() {
        return totalCredit;
    }

    public List<Course> getSections() {
        return sections;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Schedule schedule = (Schedule) o;
        return totalCredit == schedule.totalCredit &&
                Objects.equals(sections, schedule.sections);
    }

    @Override
    public int hashCode() {
        return Objects.hash(totalCredit, sections);
    }
}
