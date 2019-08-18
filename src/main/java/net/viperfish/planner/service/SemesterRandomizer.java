package net.viperfish.planner.service;

import net.viperfish.ai.search.State;
import net.viperfish.ai.search.deterministic.Randomizer;
import net.viperfish.planner.core.CourseArchtype;

import java.util.*;

public class SemesterRandomizer implements Randomizer {

    private List<CourseArchtype> courses;

    public SemesterRandomizer(Collection<CourseArchtype> courses) {
        this.courses = new ArrayList<>(courses);
    }

    @Override
    public Iterable<? extends State> randomState(int amount) {
        Set<State> result = new HashSet<>();
        while (result.size() != amount) {
            result.add(randomState());
        }
        return result;
    }

    @Override
    public State randomState() {
        Random rand = new Random();
        int selectionAmount = rand.nextInt(courses.size());
        Collections.shuffle(courses);
        Set<CourseArchtype> selected = new HashSet<>(courses.subList(0, selectionAmount));
        Set<CourseArchtype> options = new HashSet<>(courses.subList(selectionAmount, courses.size()));
        return new Semester(options, selected);
    }
}
