package net.viperfish.planner.service;

import net.viperfish.planner.core.CourseArchtype;

import java.util.HashMap;
import java.util.Map;

public class SubjectPriorityUtilityFunction implements UtilityFunction {

    private Map<String, Double> ordering;

    public SubjectPriorityUtilityFunction(Map<String, Integer> ordering) {
        this.ordering = new HashMap<>();
        int total = 0;
        for (Integer v : ordering.values()) {
            total += v;
        }
        for (Map.Entry<String, Integer> e : ordering.entrySet()) {
            this.ordering.put(e.getKey(), ((double) e.getValue()) / ((double) total));
        }
    }

    @Override
    public double evaluate(Semester semester) {
        double result = 0;
        for (CourseArchtype selected : semester.getSelection()) {
            result += ordering.getOrDefault(selected.getSubject(), 0.0);
        }
        return result;
    }

    @Override
    public boolean isIdeal(Semester semester) {
        return false;
    }
}
