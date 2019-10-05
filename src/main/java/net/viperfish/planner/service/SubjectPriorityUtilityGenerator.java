package net.viperfish.planner.service;

import net.viperfish.planner.core.Profile;

import java.util.HashMap;
import java.util.Map;

public class SubjectPriorityUtilityGenerator implements UtilityFunctionGenerator {

    @Override
    public UtilityFunction generate(Profile profile) {
        if (profile.getMetrics().containsKey("subjectPriority")) {
            Map<String, String> ordering = (Map<String, String>) profile.getMetrics().get("subjectPriority").getDetails().get("ordering");
            if (ordering == null) {
                return new NullUtilityFunction();
            }
            Map<String, Integer> converted = new HashMap<>();
            for (Map.Entry<String, String> e : ordering.entrySet()) {
                Integer priority = Integer.parseInt(e.getValue());
                converted.put(e.getKey(), priority);
            }
            return new SubjectPriorityUtilityFunction(converted);
        } else {
            return new NullUtilityFunction();
        }
    }
}
