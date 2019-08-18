package net.viperfish.planner.service;

import net.viperfish.ai.search.Action;
import net.viperfish.ai.search.State;
import net.viperfish.planner.core.CourseArchtype;

import java.util.Objects;

public class SelectClassAction implements Action {

    private CourseArchtype fromOption;

    public SelectClassAction(CourseArchtype fromOption) {
        this.fromOption = fromOption;
    }

    @Override
    public State execute(State current) {
        if (current instanceof Semester) {
            Semester currentSemester = (Semester) current;
            return currentSemester.select(fromOption);
        } else {
            throw new IllegalArgumentException("SelectClassAction only applies to Semester");
        }
    }

    @Override
    public double cost() {
        return 1;
    }

    @Override
    public Action reverse() {
        return new DeselectClassAction(fromOption);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SelectClassAction that = (SelectClassAction) o;
        return Objects.equals(fromOption, that.fromOption);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromOption);
    }
}
