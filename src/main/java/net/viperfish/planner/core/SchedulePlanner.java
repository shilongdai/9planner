package net.viperfish.planner.core;

public interface SchedulePlanner {

    Schedule plan(Profile profile);

    Schedule complete(Schedule existing, Profile profile);

}
