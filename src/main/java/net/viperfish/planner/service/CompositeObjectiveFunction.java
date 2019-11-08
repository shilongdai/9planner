package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.GoalTester;
import net.viperfish.ai.search.deterministic.ObjectiveFunction;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class CompositeObjectiveFunction implements ObjectiveFunction, GoalTester {

    private Map<String, UtilityFunction> utilityFunctions;
    private Map<String, Double> scales;
    private Set<Semester> failedSet;

    public CompositeObjectiveFunction(Map<String, UtilityFunction> utilityFunctions, Map<String, Double> scales, Set<Semester> failed) {
        this.utilityFunctions = new HashMap<>(utilityFunctions);
        this.scales = new HashMap<>(scales);
        this.failedSet = new HashSet<>(failed);
    }

    @Override
    public double evaluate(State state) {
        if (!(state instanceof Semester)) {
            throw new IllegalArgumentException("State not Semester");
        }
        Semester semester = (Semester) state;
        if (failedSet.contains(semester)) {
            return Double.NEGATIVE_INFINITY;
        }

        double current = 0;
        for (Map.Entry<String, UtilityFunction> e : utilityFunctions.entrySet()) {
            double utility = e.getValue().evaluate(semester);
            utility *= scales.getOrDefault(e.getKey(), 1.0);
            current += utility;
        }
        return current;
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
