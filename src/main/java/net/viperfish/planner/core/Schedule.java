package net.viperfish.planner.core;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class Schedule {

    private int totalCredit;
    private List<Course> sections;

    public Schedule(Collection<Course> sections) {
        this.sections = new ArrayList<>(sections);
        totalCredit = 0;
        for (Course c : this.sections) {
            totalCredit += c.getArchtype().getUnits();
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
