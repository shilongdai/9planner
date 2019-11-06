package net.viperfish.planner.service;

import net.viperfish.ai.csp.Constraint;
import net.viperfish.ai.csp.ConstraintProblem;
import net.viperfish.ai.csp.Variable;
import net.viperfish.planner.core.Course;

import java.time.DayOfWeek;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class AllowedClassDayConstraint extends Constraint {

    private Set<DayOfWeek> allowedDays;

    public AllowedClassDayConstraint(String src, Collection<DayOfWeek> allowedDays) {
        super(src, src, "allowedDays");
        this.allowedDays = new HashSet<>(allowedDays);
    }

    @Override
    public boolean validate(ConstraintProblem csp) {
        Variable<Course> currentCourse = csp.getVariable(getSrc(), Course.class);
        Course toEval = currentCourse.getValue();

        return allowedDays.containsAll(toEval.getDayOfWeek());
    }
}
