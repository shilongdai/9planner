package net.viperfish.planner.service;

import net.viperfish.ai.search.Action;
import net.viperfish.ai.search.State;
import net.viperfish.planner.core.CourseArchtype;

import java.util.Objects;

public class DeselectClassAction implements Action {

    private CourseArchtype fromSelected;

    public DeselectClassAction(CourseArchtype fromSelected) {
        this.fromSelected = fromSelected;
    }

    @Override
    public State execute(State current) {
        if (current instanceof Semester) {
            Semester currentSemester = (Semester) current;
            return currentSemester.deselect(fromSelected);
        } else {
            throw new IllegalArgumentException("DeselectClassAction only works with Semester");
        }
    }

    @Override
    public double cost() {
        return 1;
    }

    @Override
    public Action reverse() {
        return new SelectClassAction(fromSelected);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeselectClassAction that = (DeselectClassAction) o;
        return Objects.equals(fromSelected, that.fromSelected);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromSelected);
    }
}
