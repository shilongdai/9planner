package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.GoalTester;

import java.util.HashMap;
import java.util.Map;

public class CompositeSemesterGoalTester implements GoalTester {

    private Map<String, UtilityFunction> utilityFunctions;

    public CompositeSemesterGoalTester(Map<String, UtilityFunction> utilityFunctions) {
        this.utilityFunctions = new HashMap<>(utilityFunctions);
    }

    @Override
    public boolean goalReached(State toTest) {
        if (!(toTest instanceof Semester)) {
            throw new IllegalArgumentException("State not Semester");
        }
        Semester semester = (Semester) toTest;

        for (UtilityFunction f : utilityFunctions.values()) {
            if (!f.isIdeal(semester)) {
                return false;
            }
        }
        return true;
    }
}
