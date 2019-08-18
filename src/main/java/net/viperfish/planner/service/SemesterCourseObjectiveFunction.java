package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.ObjectiveFunction;

public class SemesterCourseObjectiveFunction implements ObjectiveFunction {

    private int targetUnits;

    public SemesterCourseObjectiveFunction(int targetUnits) {
        this.targetUnits = targetUnits;
    }

    @Override
    public double evaluate(State state) {
        if (state instanceof Semester) {
            Semester current = (Semester) state;
            return -1 * Math.abs(current.getSelectedUnits() - targetUnits);
        } else {
            throw new IllegalArgumentException("The SemesterCourseObjectiveFunction only works with Semester");
        }
    }
}
