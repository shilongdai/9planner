package net.viperfish.planner.service;

public class CreditHourUtilityFunction implements UtilityFunction {

    private int target;

    public CreditHourUtilityFunction(int target) {
        this.target = target;
    }

    @Override
    public double evaluate(Semester semester) {
        return -1 * Math.abs(semester.getSelectedUnits() - target);
    }

    @Override
    public boolean isIdeal(Semester semester) {
        return semester.getSelectedUnits() == target;
    }
}
