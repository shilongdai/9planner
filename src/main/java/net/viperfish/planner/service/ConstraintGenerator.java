package net.viperfish.planner.service;

import net.viperfish.ai.csp.Constraint;
import net.viperfish.planner.core.Profile;

import java.util.Set;

public interface ConstraintGenerator {

    Set<Constraint> generate(Profile profile);

}
