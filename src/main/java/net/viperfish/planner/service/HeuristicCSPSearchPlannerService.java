package net.viperfish.planner.service;

import net.viperfish.ai.csp.*;
import net.viperfish.ai.search.deterministic.LocalSearch;
import net.viperfish.ai.search.deterministic.RandomRestartHillClimb;
import net.viperfish.ai.search.deterministic.Randomizer;
import net.viperfish.ai.search.deterministic.SteepAscentHillClimbSearch;
import net.viperfish.planner.core.*;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.*;

@Service
public class HeuristicCSPSearchPlannerService implements SchedulePlanner {

    private Map<String, UtilityFunctionGenerator> utilityFunctionGenerators;
    private Map<String, ConstraintGenerator> constraintGenerators;

    public HeuristicCSPSearchPlannerService() {
        this.utilityFunctionGenerators = new HashMap<>();
        this.constraintGenerators = new HashMap<>();
    }

    @PostConstruct
    public void init() {
        utilityFunctionGenerators.put("creditHourUtility", new CreditHourUtilityGenerator());
    }

    @Override
    public Schedule plan(Profile profile) {
        int maxTries = 10;
        for (int i = 0; i < maxTries; ++i) {
            Semester semester = planSemester(profile);
            if (semester != null) {
                Schedule schedule = generateSchedule(profile, semester);
                if (schedule != null) {
                    return schedule;
                }
            }
        }
        return Schedule.NULL_SCHEDULE;
    }

    @Override
    public Schedule complete(Schedule existing, Profile profile) {
        return null;
    }

    private Semester planSemester(Profile profile) {
        Randomizer rand = new SemesterRandomizer(profile.getPortfolio());
        LocalSearch semesterPlanner = new RandomRestartHillClimb(new SteepAscentHillClimbSearch(3), rand, 100);

        Map<String, Double> scale = extractScales(profile);
        Map<String, UtilityFunction> utils = generateUtilityFunctions(profile);
        CompositeObjectiveFunction objectiveFunction = new CompositeObjectiveFunction(utils, scale);

        Semester result = (Semester) semesterPlanner.solve(rand.randomState(1), objectiveFunction, objectiveFunction);
        return result;
    }

    private Map<String, Double> extractScales(Profile profile) {
        Map<String, Double> result = new HashMap<>();
        for (Map.Entry<String, Metric> m : profile.getMetrics().entrySet()) {
            result.put(m.getKey(), m.getValue().getScale());
        }
        return result;
    }

    private Map<String, UtilityFunction> generateUtilityFunctions(Profile profile) {
        Map<String, UtilityFunction> result = new HashMap<>();
        for (Map.Entry<String, UtilityFunctionGenerator> e : this.utilityFunctionGenerators.entrySet()) {
            result.put(e.getKey(), e.getValue().generate(profile));
        }
        return result;
    }

    private Schedule generateSchedule(Profile profile, Semester semester) {
        BacktrackingCSPSolver solver = new BacktrackingCSPSolver(new AC3());
        solver.addValHeuristic(new LeastConstrainingHeuristic());
        solver.addVarHeuristic(new MinRemainHeuristic());
        solver.addVarHeuristic(new MaxDegreeHeuristic());
        ConstraintProblem csp = setUpVariable(semester);
        setupConstraints(profile, csp);

        csp = solver.solve(csp);
        if (csp != null) {
            List<Course> sections = new ArrayList<>();
            for (String v : csp.variables()) {
                Variable<Course> var = csp.getVariable(v, Course.class);
                sections.add(var.getValue());
            }
            Schedule result = new Schedule(sections);
            return result;
        }
        return null;
    }

    private ConstraintProblem setUpVariable(Semester semester) {
        ConstraintProblem csp = new ConstraintProblem();

        // adds slots based on semester plan
        for (CourseArchtype c : semester.getSelection()) {
            List<Course> primaryVariations = new ArrayList<>();
            List<Course> secondaryVariations = new ArrayList<>();
            for (Course section : c.getCourses()) {
                if (section.getType() == CourseType.MAIN) {
                    primaryVariations.add(section);
                } else {
                    secondaryVariations.add(section);
                }
            }
            String variableName = c.getSubject() + "-" + c.getCourseNumber();
            Variable<Course> primarySlot = new Variable<>(null, primaryVariations);
            csp.addVariable(variableName, primarySlot);
            if (!secondaryVariations.isEmpty()) {
                Variable<Course> secondarySlot = new Variable<>(null, secondaryVariations);
                variableName += "-SUPPL";
                csp.addVariable(variableName, secondarySlot);
            }
        }

        return csp;
    }

    private void setupConstraints(Profile profile, ConstraintProblem csp) {
        List<String> variables = new ArrayList<>(csp.variables());
        for (int i = 0; i < variables.size(); ++i) {
            for (int j = i + 1; j < variables.size(); ++j) {
                csp.addConstraint(new DifferentTimeConstraint(variables.get(i), variables.get(j)));
            }
        }

        Set<Constraint> constraints = new HashSet<>();
        for (ConstraintGenerator c : constraintGenerators.values()) {
            constraints.addAll(c.generate(profile));
        }

        for (Constraint c : constraints) {
            csp.addConstraint(c);
        }
    }
}
