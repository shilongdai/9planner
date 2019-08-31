package net.viperfish.planner.service;

public interface UtilityFunction {

    double evaluate(Semester semester);

    boolean isIdeal(Semester semester);

}
