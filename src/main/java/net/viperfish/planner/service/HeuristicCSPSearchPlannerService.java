package net.viperfish.planner.service;

import net.viperfish.ai.csp.*;
import net.viperfish.ai.search.deterministic.*;
import net.viperfish.planner.core.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class HeuristicCSPSearchPlannerService implements SchedulePlanner {

    @Override
    public Schedule plan(Profile profile) {
        int maxTries = 10;
        Set<Semester> tried = new HashSet<>();
        for (int i = 0; i < maxTries; ++i) {
            Semester semester = planSemester(profile, tried);
            if (semester != null) {
                Schedule schedule = generateSchedule(profile, semester);
                if (schedule != null) {
                    return schedule;
                }
                tried.add(semester);
            }
        }
        return null;
    }

    @Override
    public Schedule complete(Schedule existing, Profile profile) {
        return null;
    }

    private Semester planSemester(Profile profile, Set<Semester> tried) {
        Randomizer rand = new SemesterRandomizer(profile.getPortfolio());
        LocalSearch semesterPlanner = new RandomRestartHillClimb(new SteepAscentHillClimbSearch(3), rand, 100);
        ObjectiveFunction objectiveFunction = new SemesterCourseObjectiveFunction(profile.getTargetUnits());
        GoalTester tester = new SemesterGoalTester(profile.getTargetUnits(), tried);

        Semester result = (Semester) semesterPlanner.solve(rand.randomState(1), objectiveFunction, tester);
        return result;
    }

    private Schedule generateSchedule(Profile profile, Semester semester) {
        BacktrackingCSPSolver solver = new BacktrackingCSPSolver(new AC3());
        solver.addValHeuristic(new LeastConstrainingHeuristic());
        solver.addVarHeuristic(new MinRemainHeuristic());
        solver.addVarHeuristic(new MaxDegreeHeuristic());
        ConstraintProblem csp = setUpVariable(semester);
        setupConstraints(csp);

        csp = solver.solve(csp);
        if (csp != null) {
            List<Course> sections = new ArrayList<>();
            for (String v : csp.variables()) {
                Variable<Course> var = csp.getVariable(v, Course.class);
                sections.add(var.getValue());
            }
            Schedule result = new Schedule(semester.getSelection(), sections);
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

            if (primaryVariations.size() == 0) {
                return null;
            }
            String variableName = c.getSubject() + "-" + c.getCourseNumber();
            Variable<Course> primarySlot = new Variable<>(null, primaryVariations);
            csp.addVariable(variableName, primarySlot);
            if (secondaryVariations.size() != 0) {
                Variable<Course> secondarySlot = new Variable<>(null, secondaryVariations);
                variableName += "-SUPPL";
                csp.addVariable(variableName, secondarySlot);
            }
        }

        return csp;
    }

    private void setupConstraints(ConstraintProblem csp) {
        List<String> variables = new ArrayList<>(csp.variables());
        for (int i = 0; i < variables.size(); ++i) {
            for (int j = i + 1; j < variables.size(); ++j) {
                csp.addConstraint(new DifferentTimeConstraint(variables.get(i), variables.get(j)));
            }
        }
    }
}
