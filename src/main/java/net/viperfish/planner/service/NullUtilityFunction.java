package net.viperfish.planner.service;

public class NullUtilityFunction implements UtilityFunction {
    @Override
    public double evaluate(Semester semester) {
        return 0;
    }

    @Override
    public boolean isIdeal(Semester semester) {
        return true;
    }
}
