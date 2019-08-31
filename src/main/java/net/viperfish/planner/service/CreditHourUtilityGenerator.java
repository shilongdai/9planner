package net.viperfish.planner.service;

import net.viperfish.planner.core.Metric;
import net.viperfish.planner.core.Profile;

public class CreditHourUtilityGenerator implements UtilityFunctionGenerator {

    @Override
    public UtilityFunction generate(Profile profile) {
        Metric creditHour = profile.getMetrics().get("creditHour");
        if (creditHour == null) {
            return new NullUtilityFunction();
        }

        int targetUnits = (int) creditHour.getDetails().getOrDefault("targetUnits", 15);
        return new CreditHourUtilityFunction(targetUnits);
    }
}
