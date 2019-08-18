package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.GoalTester;

import java.util.HashSet;
import java.util.Set;

public class SemesterGoalTester implements GoalTester {

    private int targetUnit;
    private Set<Semester> tried;

    public SemesterGoalTester(int targetUnit, Set<Semester> tried) {
        this.targetUnit = targetUnit;
        this.tried = new HashSet<>(tried);
    }

    @Override
    public boolean goalReached(State toTest) {
        if (toTest instanceof Semester) {
            Semester current = (Semester) toTest;
            if (tried.contains(current)) {
                return false;
            }
            return current.getSelectedUnits() == targetUnit;
        } else {
            throw new IllegalArgumentException("The SemesterGoalTester only applies to Semesters");
        }
    }
}
