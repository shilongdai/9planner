package net.viperfish.planner.service;

import net.viperfish.ai.csp.Constraint;
import net.viperfish.ai.csp.ConstraintProblem;
import net.viperfish.ai.csp.Variable;
import net.viperfish.planner.core.Course;
import net.viperfish.planner.core.TimeRange;

import java.time.DayOfWeek;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class AllowedClassTimeConstraint extends Constraint {

    private Set<TimeRange> ranges;
    private DayOfWeek day;

    public AllowedClassTimeConstraint(String src, Collection<TimeRange> ranges, DayOfWeek day) {
        super(src, src, "AllowedTime");
        this.ranges = new HashSet<>(ranges);
        this.day = day;
    }

    @Override
    public boolean validate(ConstraintProblem csp) {
        Variable<Course> currentCourse = csp.getVariable(getSrc(), Course.class);
        Course toEval = currentCourse.getValue();

        if (!toEval.getDayOfWeek().contains(day)) {
            return true;
        }

        for (TimeRange t : ranges) {
            if (t.contains(toEval.getTimeRange())) {
                return true;
            }
        }
        return false;
    }
}
