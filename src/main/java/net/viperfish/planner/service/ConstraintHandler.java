package net.viperfish.planner.service;

import net.viperfish.ai.csp.ConstraintProblem;
import net.viperfish.planner.core.Profile;

public interface ConstraintHandler {

    void handle(Profile profile, ConstraintProblem csp);

}
