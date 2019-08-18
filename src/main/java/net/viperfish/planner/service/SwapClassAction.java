package net.viperfish.planner.service;

import net.viperfish.ai.search.Action;
import net.viperfish.ai.search.State;
import net.viperfish.planner.core.CourseArchtype;

import java.util.Objects;

public class SwapClassAction implements Action {

    private CourseArchtype swap1;
    private CourseArchtype swap2;

    public SwapClassAction(CourseArchtype fromSelection, CourseArchtype fromOptions) {
        this.swap1 = fromSelection;
        this.swap2 = fromOptions;
    }

    @Override
    public State execute(State current) {
        if (current instanceof Semester) {
            Semester workingSemester = (Semester) current;
            return workingSemester.swap(swap1, swap2);
        } else {
            throw new IllegalArgumentException("Swap only applies to semester");
        }
    }

    @Override
    public double cost() {
        return 1;
    }

    @Override
    public Action reverse() {
        return new SwapClassAction(swap2, swap1);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SwapClassAction that = (SwapClassAction) o;
        return Objects.equals(swap1, that.swap1) &&
                Objects.equals(swap2, that.swap2);
    }

    @Override
    public int hashCode() {
        return Objects.hash(swap1, swap2);
    }
}
