package net.viperfish.planner.core;

import java.util.*;

public class Schedule {

    private int totalCredit;
    private List<Course> sections;

    public static final Schedule NULL_SCHEDULE = new Schedule(-1, new ArrayList<>());

    public Schedule(Collection<Course> sections) {
        this(calculateCredit(sections), sections);
    }

    private Schedule(int totalCredit, Collection<Course> sections) {
        this.sections = new ArrayList<>(sections);
        this.totalCredit = totalCredit;
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

    private static int calculateCredit(Collection<Course> courses) {
        Set<Long> processedCourse = new HashSet<>();
        int totalCredit = 0;
        for (Course c : courses) {
            if (processedCourse.contains(c.getArchtype().getId())) {
                continue;
            }
            totalCredit += c.getArchtype().getUnits();
            processedCourse.add(c.getArchtype().getId());
        }
        return totalCredit;
    }
}
