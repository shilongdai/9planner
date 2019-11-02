package net.viperfish.planner.service;

import net.viperfish.ai.csp.Constraint;
import net.viperfish.ai.csp.ConstraintProblem;
import net.viperfish.ai.csp.Variable;
import net.viperfish.planner.core.Course;

import java.time.DayOfWeek;
import java.util.Set;

public class DifferentTimeConstraint extends Constraint {

    public DifferentTimeConstraint(String src, String dest) {
        super(src, dest, "DiffTime");
    }

    @Override
    public boolean validate(ConstraintProblem csp) {
        Variable<Course> thisCourseVar = csp.getVariable(getSrc(), Course.class);
        Variable<Course> thatCourseVar = csp.getVariable(getDest(), Course.class);
        Course thisCourse = thisCourseVar.getValue();


        Set<DayOfWeek> thisDay = thisCourse.getDayOfWeek();
        for (Course c : thatCourseVar.getVariation()) {
            Set<DayOfWeek> thatDay = c.getDayOfWeek();
            if (thatDay.removeAll(thisDay)) {
                if (!thisCourse.getTimeRange().overlap(c.getTimeRange())) {
                    return true;
                }
            } else {
                return true;
            }
        }
        return false;
    }
}
