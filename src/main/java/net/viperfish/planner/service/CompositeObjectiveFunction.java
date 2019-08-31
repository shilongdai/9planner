package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.ObjectiveFunction;

import java.util.HashMap;
import java.util.Map;

public class CompositeObjectiveFunction implements ObjectiveFunction {

    private Map<String, UtilityFunction> utilityFunctios;
    private Map<String, Double> scales;

    public CompositeObjectiveFunction(Map<String, UtilityFunction> utilityFunctios, Map<String, Double> scales) {
        this.utilityFunctios = new HashMap<>(utilityFunctios);
        this.scales = new HashMap<>(scales);
    }

    @Override
    public double evaluate(State state) {
        if (!(state instanceof Semester)) {
            throw new IllegalArgumentException("State not Semester");
        }
        Semester semester = (Semester) state;
        double current = 0;
        for (Map.Entry<String, UtilityFunction> e : utilityFunctios.entrySet()) {
            double utility = e.getValue().evaluate(semester);
            utility *= scales.getOrDefault(e.getKey(), 1.0);
            current += utility;
        }
        return current;
    }
}
