package net.viperfish.planner.service;

import net.viperfish.ai.csp.Constraint;
import net.viperfish.ai.csp.ConstraintProblem;
import net.viperfish.planner.core.Metric;
import net.viperfish.planner.core.Profile;
import net.viperfish.planner.core.TimeRange;

import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class AllowedConstraintGenerator implements ConstraintHandler {

    @Override
    public void handle(Profile profile, ConstraintProblem csp) {
        Metric allowedTimeMetrics = profile.getMetrics().get("allowedTimes");
        if (allowedTimeMetrics == null) {
            return;
        }

        Map<DayOfWeek, Set<TimeRange>> allowedRanges = new HashMap<>();

        for (Map.Entry<String, Object> entry : allowedTimeMetrics.getDetails().entrySet()) {
            Set<Map<String, Integer>> ranges = (Set<Map<String, Integer>>) entry.getValue();
            Set<TimeRange> allowedRg = new HashSet<>();
            for (Map<String, Integer> timeRangeObj : ranges) {
                int startTime = timeRangeObj.get("startTime");
                int endTime = timeRangeObj.get("endTime");

                TimeRange range = new TimeRange(startTime, endTime);
                allowedRg.add(range);
            }
            allowedRanges.put(DayOfWeek.valueOf(entry.getKey()), allowedRg);
        }

        for (String vName : csp.variables()) {
            for (Map.Entry<DayOfWeek, Set<TimeRange>> e : allowedRanges.entrySet()) {
                Constraint c = new AllowedClassTimeConstraint(vName, e.getValue(), e.getKey());
                csp.addConstraint(c);
            }
        }
    }
}
